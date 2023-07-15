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

    #clock;

    #elapsed;

    #prevDuration;
    
    constructor(parentScene, camera, distFromCam, startMesh) {
        this.#meshes = [];
        this.#parent = parentScene;

        this._createPositions(camera, distFromCam);

        this.#meshes.push(startMesh);
        this.#parent.add(this.#meshes[0]);
        this.setPosVector(0, this.#viewPos);
        this.#currIndex = 0;

        this._createClock();
    }

    _createPositions(camera, distFromCam) {

        this.#viewPos = new THREE.Vector3();
        this.#viewPos.copy(camera.position);
        this.#viewPos.add(new THREE.Vector3(0, -0.25, -1 * distFromCam));
        //console.log(this.#viewPos);

        //Calculate distance between shapes using triangle.
        const angle = Math.tan(camera.fov / 2);
        this.#distInBetween = angle * distFromCam * 2;  //* 2 to act as buffer.
        //Note that shapes larger than fov of camera will not account for this.

        this.#hiddenPos =  new THREE.Vector3();
        this.#hiddenPos.copy(this.#viewPos);
        this.#hiddenPos.add(new THREE.Vector3(0, this.#distInBetween, 0));

        this.#exitPos = new THREE.Vector3();
        this.#exitPos.copy(this.#viewPos);
        this.#exitPos.add(new THREE.Vector3(0, -1 * this.#distInBetween, 0));
    }

    push(mesh) {
        this.#meshes.push(mesh);
        this.#parent.add(this.#meshes[this.#meshes.length - 1]);
        this.#meshes[this.#meshes.length - 1].position.copy(this.#hiddenPos);
        this.#meshes[this.#meshes.length - 1].updateMatrix();
        //this.#update();
    }

    _createClock() {
        this.#clock = new THREE.Clock(false);
    }

    next(duration) {
        if(this.#meshes.length > 1) {
            const delta = this.#clock.getDelta();
            if(this.#prevDuration === undefined) {
                this.#clock.start();
                console.log("Starting Clock");
                this.#prevDuration = duration;
                this.#elapsed = 0;
            //There is currently a bug where tweens that shouldn't happen, still execute when set to 1000, so 950 for now.
            //TODO fix this.
            } else if(this.#elapsed <= this.#prevDuration / 950) {
                this.#elapsed += delta;
                //console.log("Skip: temp is " + this.#elapsed + " < " + (this.#prevDuration / 1000));
            } else {
                // console.log(this.#meshes); //Debug
                // console.log(this.#currIndex);

                //EnterTween
                // let enterIndex = this.#currIndex + 1; //This breaks the loop due async lol.
                // if(enterIndex >= this.#meshes.length - 1) {
                //     enterIndex = 0;
                // }
                // const enterTween = this._tweenToPos(enterIndex, this.#hiddenPos, this.#viewPos, duration);
                let enterTween = null;
                if(this.#currIndex >= this.#meshes.length - 1) {
                    enterTween = this._tweenToPos(0, this.#hiddenPos, this.#viewPos, duration);
                } else {
                    enterTween = this._tweenToPos(this.#currIndex + 1, this.#hiddenPos, this.#viewPos, duration);
                }
    
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
                });
                enterTween.start();
                exitTween.start();
                this.#elapsed = 0; //Reset the timer.
                this.#prevDuration = duration;
            }
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

    changeGeometryAt(index, newGeo) {
        this.#meshes[index].geometry.dispose();
        this.#meshes[index].geometry = newGeo;
    }

    changeMaterialAt(index, newMat) {
        this.#meshes[index].material.dispose();
        this.#meshes[index].material = newMat;
    }

    getCount() {
        return this.#meshes.length;
    }

    #update() {
        let needsPos = this.#meshes[this.#meshes.length - 1];
    }
}
