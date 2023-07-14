import * as THREE from 'three';

export default class Particles {

    #mesh
    #geo
    #mat
    #sampler

    constructor(radius, ) {
        this.#geo =  new THREE.SphereGeometry(radius, 32, 16);
        this.#mat =  new THREE.MeshBasicMaterial({
            color: 0xffffff,
            wireframe: true,
            transparent: true
        });
        this.#mesh = new THREE.Mesh(this.#geo, this.#mat);
        this.#sampler = new THREE.MeshSurfaceSampler(this.#mesh).build();
    }
}