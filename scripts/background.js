import * as THREE from 'three';

export default class Background {
    parentScene;
    cubeRotationAmount;
    cubeMesh;

    constructor(parentScene) {
        this.parentScene = parentScene;
    }

    /*
     * Create the instance mesh of cubes.
     * 
     */
    createInstancedCubes(boxW, boxH, boxD, theColor) {
        const cubeShape = new THREE.BoxGeometry(boxW, boxH, boxD);
        const cubeMaterial =  new THREE.MeshStandardMaterial({ color: theColor });

        this.cubeMesh = new THREE.InstancedMesh(cubeShape, cubeMaterial, 10000);
        this.parentScene.add(this.cubeMesh);
        //this.cubeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);

        for (let i = 0; i < this.cubeMesh.count; i++) {//Must set initial color to change later.
            this.cubeMesh.setColorAt( i, new THREE.Color(0xFFFFFF) );
        }
    }
    
    /*
     * Randomizes the cubes' position.
     * 
     */
    randomizeCubePos() {
        const currShape = new THREE.Object3D();
        for (let i = 0; i < this.cubeMesh.count; i++) {

            currShape.position.x = Math.random() * 100 - 20; //80 to -20
            currShape.position.y = Math.random() * 100 - 20;
            currShape.position.z = Math.random() * 100 - 20;
            
            currShape.updateMatrix(); //Update matrix's (x,y,z)
            this.cubeMesh.setMatrixAt(i, currShape.matrix); //Change transformation matrix to new pos.
        }
    }

    /*
     * Set the instance mesh's form to be a cube.
     */
    setCubeForm(xLength, yLength, zLength, xGap, yGap, zGap, xStart, yStart, zStart) {
        const currShape = new THREE.Object3D();
        let count = 0;
        for(let i = xStart; i < xLength * xGap + xStart; i = i + xGap) {
            for(let j =  yStart; j < yLength * yGap + yStart; j = j + yGap) {
                for(let k = zStart; k < zLength * zGap + zStart; k = k + zGap) {
                    currShape.position.x = i;
                    currShape.position.y = j;
                    currShape.position.z = k;

                    currShape.updateMatrix(); //Update matrix's (x,y,z)
                    this.cubeMesh.setMatrixAt(count, currShape.matrix); //Change transformation matrix to new pos.
                    count++;

                }
            }
        }
    }


    //THIS IS CURRENTLY UNUSED, DO NOT USE.
    rotateCubesXBy(amount) {
        //const currMatrix = new THREE.Matrix4();
        const currShape =  new THREE.Object3D();
        const moveQ = new THREE.Quaternion( 0.5, 0.5, 0.5, 0.0 ).normalize();
        tmpQ.set( moveQ.x * delta, moveQ.y * delta, moveQ.z * delta, 1 ).normalize();
        for(let i = 0; i < this.cubeMesh.count; i++) {
            //this.cubeMesh.getMatrixAt(i, currMatrix);
            //currShape.applyMatrix4(currMatrix);
            currShape.rotation.x =  amount;
            
            currShape.updateMatrix();
            this.cubeMesh.setMatrixAt(i, currShape.matrix);
        }
        this.cubeMesh.instanceMatrix.needsUpdate = true;
        this.cubeMesh.computeBoundingBox();  
    }
}