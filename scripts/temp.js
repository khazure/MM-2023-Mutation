import * as THREE from 'three';
import ElemScene from './ElemScene.js';
import InstanceShapes from './InstanceShapes.js';

const backCanvas = document.querySelector('#c'); //Select the canvas

const renderer = new THREE.WebGL1Renderer({ antialias: true, backCanvas, alpha: true
                                           }); // alpha true = transparent bg
const mikuScene = new ElemScene(document.querySelector("#miku-scene"));
console.log(document.querySelector("#miku-scene"));
const waveScene = new ElemScene(document.querySelector("#wave-scene"));
const test = new InstanceShapes(mikuScene.getScene(), new THREE.BoxGeometry(1.5, 1.5, 1.5),
                                new THREE.MeshPhongMaterial(0xFFFFFF), 150, 0);

function render(time) {
    time *= 0.001;

    mikuScene.resizeRendererToDisplaySize(renderer);

    renderer.setScissorTest(false);
    renderer.clear(true, true);
    renderer.setScissorTest(true);

    // sceneInfo1.mesh.rotation.y = time * .1;
    // sceneInfo2.mesh.rotation.y = time * .1;

    mikuScene.renderScene(renderer);
    waveScene.renderScene(renderer);  

    requestAnimationFrame(render);
}
requestAnimationFrame(render);

