import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export default class Particles {

    #parent;

    #meshes;

    //Where our current shape will be at.
    #viewPos;

    //Where other shapes will be stored at.
    #hiddenPos;

    //Tween current shape to pos to exit out of view.
    //Once finish tween, relocate it back to hidden.
    #exitPos;

    //Distance between shapes, calculated from camera.
    #distInBetween;

    #currIndex;
    
    constructor(parentScene, camera, distFromCam, startMesh) {
        this.#meshes = [];
        this.#parent = parentScene;
        this.#viewPos = new THREE.Vector3();
        this.#hiddenPos =  new THREE.Vector3();
        this.#exitPos = new THREE.Vector3();

        //Calculate distance between shapes using triangle.
        const angle = Math.tan(camera.fov);
        this.#distInBetween = angle * distFromCam;
        //* 2 to act as buffer.
        //Note that shapes larger than fov of camera will not account for this.

        this.#viewPos.copy(camera.position);
        //Assuming camera direction is still down negative z-axis.
        //Thus changing camera position itself will break this.
        this.#viewPos.add(new THREE.Vector3(0, -0.25, -1 * distFromCam));
        console.log(this.#viewPos);

        //Where other shapes will be stored to be hidden.
        this.#hiddenPos.copy(this.#viewPos);
        this.#hiddenPos.add(new THREE.Vector3(0, this.#distInBetween, 0));

        this.#exitPos.copy(this.#viewPos);
        this.#exitPos.add(new THREE.Vector3(0, -1 * this.#distInBetween, 0));

        //
        this.#meshes.push(startMesh);
        this.#parent.add(this.#meshes[0]);
        this.setPosVector(0, this.#viewPos);
        this.#currIndex = 0;
    }

    push(mesh) {
        this.#meshes.push(mesh);
        this.#parent.add(this.#meshes[this.#meshes.length - 1]);
        this.#meshes[this.#meshes.length - 1].position.copy(this.#hiddenPos);
        this.#meshes[this.#meshes.length - 1].updateMatrix();
        //this.#update();
    }

    next(duration) {
        if(this.#meshes.length > 1) {

            console.log(this.#meshes); //Debug
            //EnterTween
            const enterTween = this._tweenToPos(this.#currIndex + 1, this.#hiddenPos, this.#viewPos, duration);

            //ExitTween
            const exitTween = this._tweenToPos(this.#currIndex, this.#viewPos, this.#exitPos, duration);
            exitTween.onComplete(() => {
                this.setPosVector(this.#currIndex, this.#hiddenPos);
                //Update
                if(this.#currIndex >= this.#meshes.length - 1) {//Race condition with tween above.
                    this.#currIndex = 0;
                } else {
                    this.#currIndex++;
                }
            })
            enterTween.start();
            exitTween.start();
        } else {
            console.error("Slot object has less than 2 meshes!, .next canceled");
        }
    }

    _tweenToPos(index, start, end, duration = 5000, ease = TWEEN.Easing.Elastic.InOut) {
        const tween = new TWEEN.Tween({x: start.x, y: start.y, z: start.z})
            .to({x: end.x, y: end.y, z: end.z}, duration)
            .easing(ease)
            .onUpdate((coords) => {
                this.setPosAt(index, coords.x, coords.y, coords.z);
            })
            //.repeat(Infinity) //Temp to demo this.
            .delay(500); //Might need this as parameter.
        return tween;
    }   

    setPosAt(index, x, y, z) {
        this.#meshes[index].position.set(x, y, z);
        this.#meshes[index].updateMatrix();
    }

    setPosVector(index, posVec) {
        this.#meshes[index].position.copy(posVec);
        this.#meshes[index].updateMatrix();
    }

    getMeshAt(index) {
        return this.#meshes[index];
    }

    getCount() {
        return this.#meshes.length;
    }

    #update() {
        let needsPos = this.#meshes[this.#meshes.length - 1];
    }
}
