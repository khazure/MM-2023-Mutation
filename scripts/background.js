import * as THREE from 'three';
//Importmap recognizes three/addons
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import WebGL from 'three/addons/capabilities/WebGL.js';

//Shapes.
let cube, cubeOfCubes;

const backCanvas =  document.querySelector('#c');

const renderer =  new THREE.WebGL1Renderer({antialias: true, backCanvas});

//(fov, aspect, minRender, maxRender);
const camera = new THREE.PerspectiveCamera(75, 2, 0.1, 100);

//Controls for Camera, add-on for three.js
const camControls =  new OrbitControls(camera, renderer.domElement);

const scene = new THREE.Scene();

//Cube Constants used
const numOfCubes = [10, 10, 10]; //x, y, z;
const cubeSize = [1, 1, 1]; //x, y, z multipliers.
const cubeGaps = [1.5, 1.5, 1.5];
// cubeSize.forEach((length) => {
//     cubeGaps.push(length * 1.5); //gaps is 1.5 * the size?
// })


/**********HELPER VISUALS (DELETE BEFORE FINAL RELEASE)**********/
//x, y, z axes, points in positive direction.
const axes = new THREE.AxesHelper(5)
axes.setColors('red', 'blue', 'green'); //x = r, y = b, z = g.
scene.add(axes);



renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

/***********CAMERA AND ITS CONTROLS***********/
//By default, the camera will be looking down -Z with, positioned at (0, 0, 0)
camera.position.set(numOfCubes[0] * 3, numOfCubes[1] * 3, numOfCubes[2] * 3); //x, y, z
camControls.update(); //update everytime position changes.

camControls.listenToKeyEvents( window );

//Damping slows down camera speed
camControls.enableDamping = true;
camControls.dampingFactor = 0.025;

camControls.screenSpacePanning = false;

//Min and Max distance we can zoom on camera
camControls.minDistance = 0; //Neg does nothing?
camControls.maxDistance = 50;
camControls.maxPolarAngle = Math.PI / 2; //90 degrees

camControls.enableZoom = true;
onWindowResize(); //Calc aspect for first time.
//camControls.update() must be called after any manual changes to the camera's transform

scene.background =  new THREE.Color(0xCFD8DC);

/***********LIGHTING***********/
{
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.DirectionalLight(color, intensity);
    //light.position.set(-1, 2, 4);
    light.position.set(-1, 5, 3);
    //By default the light will look at (0, 0, 0), change with light.target()
    scene.add(light);


    //HELPER VISUAL 
    const lightHelper = new THREE.DirectionalLightHelper( light, 5, 0xC52AB1);
    // lightHelper.color = 0xC52AB1;
    scene.add( lightHelper );
}


/***********SHAPES***********/
cube =  makeCube(1, 1, 1, 'white', 2, 2, 2); //Pos does not matter here, since it never in scene.
cubeOfCubes = makeCubeOf(cube, cubeGaps[0], cubeGaps[1], cubeGaps[2],
                         numOfCubes[0], numOfCubes[1], numOfCubes[2]);
//renderer.render(scene, camera); //Renders cube once.

/***********EVENTS***********/
window.addEventListener( 'resize', onWindowResize);

function animate(time) {
    time *= 0.001; //convert to seconds.

    //Rotate cubes.
    //myCube.rotation.x = time;
    //myCube.rotation.y = time;
    cubeOfCubes.forEach((cube, ndx) => {
        const speed = 0.5;
        const rot = time * speed;
        cube.rotation.x = rot;
        cube.rotation.y = rot;
    })
    requestAnimationFrame(animate);//Request to brower to animate something
    camControls.update(); //Requires if(enableDamping || autoRotate)
    
    
    renderer.render(scene, camera);
    //requestAnimationFrame passes time since the page loaadeed to our function.
}

if ( WebGL.isWebGLAvailable() ) {
    //Starts loop, continously calls requestAnimationFrame() on animate.
    requestAnimationFrame(animate);
} else {
	const warning = WebGL.getWebGLErrorMessage();
	document.getElementById( 'container' ).appendChild( warning );
}


function makeCube(boxW, boxH, boxD, color, xPos, yPos, zPos) {
    //Shape of object
    //(boxWidth, boxHeight, BoxDepth)
    const cubeVertices = new THREE.BoxGeometry(boxW, boxH, boxD);
    const material =  new THREE.MeshPhongMaterial({color});

    //Combines Geometry, Material, and position.
    const cube =  new THREE.Mesh(cubeVertices, material);
    //scene.add(cube);
    cube.position.x = xPos;
    cube.position.y = yPos;
    cube.position.z = zPos;

    return cube;
}

/**
 * Makes cube made of inputted shape.
 * 
 * @param gaps describes the distance between each shape.
 * @param width describes how many shapes on x-axis.
 * @param height describes how many shapes on x-axis.
 * @param depth describes how many shapes on x-axis.
 * 
 * @returns array contains shapes in this cube.
 */
function makeCubeOf(shape, xGap, yGap, zGap, width, height, depth) {
    let shapes = [];
    let totalHeight = height * yGap;
    let totalWidth = width * xGap;
    let totalDepth = depth * zGap;
    let currShape;

    //TODO need something more efficient than 3 for loops.
    for(let x = 0; x <= totalWidth; x = xGap + x) {
        for(let y = 0; y <= totalHeight; y = yGap + y) {
            for(let z = 0; z <= totalDepth; z = zGap + z) {
                //shapes.push(makeCube(1, 1, 1, 0x44aa88, x, y, z));
                currShape = shape.clone();
                currShape.position.x = x;
                currShape.position.y = y;
                currShape.position.z = z;
                scene.add(currShape);
                shapes.push(currShape);
            }
        }
    }

    return shapes;
}

/**
 * Resizes window when browser resizes.
 */
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix(); //
    renderer.setSize(window.innerWidth, window.innerHeight);
}
