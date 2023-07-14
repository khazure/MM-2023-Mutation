import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export default class Particles {

    #parent;

    #meshes;

    //Where our current shape will be at.
    #viewingPos;

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
        this.#viewingPos = new THREE.Vector3();
        this.#hiddenPos =  new THREE.Vector3();
        this.#exitPos = new THREE.Vector3();

        //Calculate distance between shapes using triangle.
        const angle = Math.tan(camera.fov);
        this.#distInBetween = angle * distFromCam * 2;
        //* 2 to act as buffer.
        //Note that shapes larger than fov of camera will not account for this.

        this.#viewingPos.copy(camera.position);
        //Assuming camera direction is still down negative z-axis.
        //Thus changing camera position itself will break this.
        this.#viewingPos.add(new THREE.Vector3(0, -0.25, -1 * distFromCam));
        console.log(this.#viewingPos);

        //Where other shapes will be stored to be hidden.
        this.#hiddenPos.copy(this.#viewingPos);
        this.#hiddenPos.add(new THREE.Vector3(0, this.#distInBetween, 0));

        this.#exitPos.copy(this.#viewingPos);
        this.#exitPos.add(new THREE.Vector3(0, -1 * this.#distInBetween, 0));

        //
        this.#meshes.push(startMesh);
        this.#parent.add(this.#meshes[0]);
        this.#meshes[0].position.copy(this.#viewingPos);
        this.#meshes[0].updateMatrix();
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
        const moveTween = new TWEEN.Tween({
            x: this.#hiddenPos.x, 
            y: this.#hiddenPos.y, 
            z: this.#hiddenPos.z
        })
            .to({x: this.#viewingPos.x, y: this.#viewingPos.y, z: this.#viewingPos.z}, duration)
            .easing(TWEEN.Easing.Elastic.InOut)
            .onUpdate((coords) => {
                this.#meshes[this.#currIndex + 1].position.set(coords.x, coords.y, coords.z);
                this.#meshes[this.#currIndex + 1].updateMatrix();
            })
            .repeat(Infinity)
            .delay(500);
        moveTween.start();
        //this.#currIndex = this.#currIndex + 1;
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
