import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw'; // vite needs the ?raw query to import as string
import fragmentShader from './shaders/fragment.glsl?raw';

export default class hologramShape {
  #line;
  #mesh;

  constructor(parentScene, geometry, uniforms, layer) {

    // make wireframe
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial( {
        color: 0x9DB2FF,
    });
    this.#line = new THREE.LineSegments(wireframeGeo, lineMaterial);
    this.#line.layers.set(layer);
    parentScene.add(this.#line);


    // made hologram inside

    let material = new THREE.ShaderMaterial( {
      blending: THREE.AdditiveBlending,
      transparent: true,
      opacity: 0.9,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms
    });

    this.#mesh = new THREE.Mesh(geometry, material);
    this.#mesh.layers.set(layer);
    parentScene.add(this.#mesh);
  }

  setRotate(amount) {
    this.#line.rotation.y = amount;
    this.#mesh.rotation.y = amount;
  }

  incrementRotate(amount) {
    this.#line.rotation.y += amount;
    this.#mesh.rotation.y += amount;
  }
}