import * as THREE from 'three';

// function main() {
    const backCanvas =  document.querySelector('#c');
    const backRenderer =  new THREE.WebGL1Renderer({antialias: true, backCanvas});
    backRenderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( backRenderer.domElement );

 
    const backCamera = new THREE.PerspectiveCamera(75, 2, 0.1, 5);

    //By default, the camera will be looking down -Z with, positioned at (0, 0, 0)
    backCamera.position.z = 2; //Move camera back by 2 units since we create cube at origin

    const scene = new THREE.Scene();

    { //Setting up lights?
        const color = 0xFFFFFF;
        const intensity = 1;
        const light = new THREE.DirectionalLight(color, intensity);
        light.position.set(-1, 2, 4);
        scene.add(light);
    }

    //Shape of object
    //(boxWidth, boxHeight, BoxDepth)
    const cubeVertices = new THREE.BoxGeometry(1, 1, 1);

    //How to draw the object.
    //const cubeColor = new THREE.MeshBasicMaterial({color: 0x44aa88});
    const cubeColor = new THREE.MeshPhongMaterial({color: 0x44aa88});

    //Combines Geometry, Material, and position.
    const myCube = new THREE.Mesh(cubeVertices, cubeColor); //Create the cube with input data.
    scene.add(myCube);
    //renderer.render(scene, camera); //Renders cube once.
    function animate(time) {
        //console.log(time);
        time *= 0.001; //convert to seconds.
    
        myCube.rotation.x = time;
        myCube.rotation.y = time;
        //console.log(time);
        backRenderer.render(scene, backCamera);
        requestAnimationFrame(animate);//Request to brower to animate something
        //requestAnimationFrame passes time since the page loaadeed to our function.
    }
    requestAnimationFrame(animate); //Starts loop, continously calls requestAnimationFrame() on animate.
// }

// main();