import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw'; // vite needs the ?raw query to import as string
import fragmentShader from './shaders/brainFragment.glsl?raw';

export default class infiniteTubes {
  #tube;
  #tubeMaterial;
  #speed;

  constructor(parentScene, uniforms, layer) {
    this.#speed = 0.07;

    // Create an empty array to stores the points
    var points = [];

    // Define points along Z axis
    for (var i = 0; i < 5; i += 1) {
        points.push(new THREE.Vector3(0, 0, 15 * (i) - 35));
    }

    // Set custom Y position for the last point
    points[0].y = -10;

    // Create a curve based on the points
    var curve = new THREE.CatmullRomCurve3(points)

   
    // Create the geometry of the tube based on the curve
    // The other values are respectively : 
    // 70 : the number of segments along the tube
    // 0.02 : its radius (yeah it's a tiny tube)
    // 50 : the number of segments that make up the cross-section
    // false : a value to set if the tube is closed or not
    var tubeGeometry = new THREE.TubeGeometry(curve, 700, 2, 50, false);

    const loader = new THREE.TextureLoader();
    let rockPattern = loader.load('../images/miku.png');

    // let tubeMaterial = new THREE.MeshPhongMaterial(0xFFFFFF);
    // Define a material for the tube with a jpg as texture instead of plain color
    var tubeMaterial = new THREE.MeshStandardMaterial({
        side: THREE.BackSide, // Since the camera will be inside the tube we need to reverse the faces
        color: 0xFFFFFF,
        map: rockPattern // rockPattern is a texture previously loaded
    });
    // Repeat the pattern to prevent the texture being stretched
    tubeMaterial.map.wrapS = THREE.RepeatWrapping;
    tubeMaterial.map.wrapT = THREE.RepeatWrapping;
    tubeMaterial.map.repeat.set(30, 6);

    // Create a mesh based on tubeGeometry and tubeMaterial
    this.#tubeMaterial = tubeMaterial;
    this.#tube = new THREE.Mesh(tubeGeometry, tubeMaterial);
    this.#tube.layers.set(layer);

    // Add the tube into the scene
    parentScene.add(this.#tube);
  }

  updateMaterialOffset() {
    // Update the offset of the material with the defined speed
    this.#tubeMaterial.map.offset.x += this.#speed;
  };

  updateCurve() {
    // Update the third point of the curve in X and Y axis
    curve.points[2].x = -mouse.position.x * 0.1;
    curve.points[2].y = mouse.position.y * 0.1;

    // Update the X position of the last point
    curve.points[4].x = -mouse.position.x * 0.1;
  }
}