import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw'; // vite needs the ?raw query to import as string
import fragmentShader from './shaders/fragment.glsl?raw';

export default class hologramShape {
  #line;
  #mesh;

  constructor(parentScene, geometry, uniforms) {

    // make wireframe
    const wireframeGeo = new THREE.WireframeGeometry(geometry);
    const lineMaterial = new THREE.LineBasicMaterial( {
        color: 0x9DB2FF,
    });
    this.#line = new THREE.LineSegments(wireframeGeo, lineMaterial);
    parentScene.add(this.#line);


    // made hologram inside

    let material = new THREE.ShaderMaterial( {
      blending: THREE.AdditiveBlending,
      opacity: 0.3,
      vertexShader: vertexShader,
      fragmentShader: fragmentShader,
      uniforms
    });

    this.#mesh = new THREE.Mesh(geometry, material);
    parentScene.add(this.#mesh);
  }
}