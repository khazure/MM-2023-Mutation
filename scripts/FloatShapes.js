import * as THREE from 'three';


export default class MeshShapes {
    #parent;
    #meshes;
    #total;

    constructor(parentScene, theGeometry, theMaterial, count, layer) {
        this.#parent =  parentScene;
        this.#meshes =  [];
        this.#total = count;
        for(let i = 0; i < count; i++) {
            this.#meshes.push(new THREE.Mesh(theGeometry, theMaterial));
            parentScene.add(this.#meshes[i]);
            this.#meshes[i].layers.set(layer);
        }
        this.randomizePos();
    }

    /**
     * Changes the geometry of selected shape. Currently the slowest method 
     * of changing shape manually.
     * 
     * TODO find faster method?
     * 
     * @param {Integer} index is the index of the shape we want to change
     * @param {*} newGeo is the new geometry we want to apply.
     */
    changeGeometryAt(index, newGeo) {
        const oldMaterial = this.#meshes[index].material; //Copy old material.
        this.#meshes[index].geometry.dispose(); //Frees up GPU, prevents memory leak.
        this.#parent.remove(this.#meshes[index]); //Visually, this does nothing. I think it prevents leak.
        this.#meshes[index] = new THREE.Mesh(newGeo, oldMaterial);
        this.#parent.add(this.#meshes[index]);
    }

    /**
     * Sets a new position for the selected shape.
     * 
     * @param {Integer} index is the index of the shape we want to change.
     * @param {Number} x is the new x coordinate.
     * @param {Number} y is the new y coordinate.
     * @param {Number} z is the new z coordinate.
     */
    setPosAt(index, x, y, z) {
        this.#meshes[index].position.set(x, y, z);
    }

    randomizePos() {
        
    }

    formSphere(radius, maxVert, minVert, layer) {
        //Tween to new pos
    }

    formSquare() {
        //Tween to new pos
    }

    #tweenToNew() {

    }
}