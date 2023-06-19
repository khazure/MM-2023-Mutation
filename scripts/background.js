import * as THREE from 'three';

export default class Background {
    parentScene;
    cubeRotationAmount;
    cubeMesh;

    constructor(parentScene) {
        this.parentScene = parentScene;
    }

    createInstancedCubes() {
        const cubeShape = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial =  new THREE.MeshPhongMaterial({ color: 0xFFFFFF });

        this.cubeMesh = new THREE.InstancedMesh(cubeShape, cubeMaterial, 10000);
        this.parentScene.add(this.cubeMesh);
        //this.cubeMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    }
    
    randomizeCubePos() {
        const currShape = new THREE.Object3D();
        for (let i = 0; i < this.cubeMesh.count; i++) {
            //console.log("BEFORE: " + currShape.matrix);
            currShape.position.x = Math.random() * 100 - 20; //80 to -20
            currShape.position.y = Math.random() * 100 - 20;
            currShape.position.z = Math.random() * 100 - 20;
        
            currShape.updateMatrix();
            this.cubeMesh.setMatrixAt(i, currShape.matrix);
            //console.log("AFTER " + currShape.matrix);
        }
    }

    rotateCubesXBy(amount) {
        //const currMatrix = new THREE.Matrix4();
        const currShape =  new THREE.Object3D();
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