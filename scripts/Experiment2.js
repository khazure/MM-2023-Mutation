import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw'; // vite needs the ?raw query to import as string
import fragmentShader from './shaders/fragment.glsl?raw';

export default class Experiment2 {
  #mesh;

  constructor(parentScene, theGeometry, layer) {
    const loader = new THREE.TextureLoader();

    // const texture = loader.load("../images/pixelmiku_large.png");
    // texture.magFilter = THREE.NearestFilter;

    const texture = this.spriteSheetTexture("../images/test_sheet.png", 2, 1, 5);
    //const texture = this.makeTexture("../images/test_sheet")
    // let color = new THREE.Color(0x3762ff);
    // let material = new THREE.MeshBasicMaterial({ 
    //   color: color,
    //   transparent: true,
    //   map: texture,
    //   alphaMap: alphaMap
    // });

    // this.#mesh = new THREE.Mesh(theGeometry, material);
    // parentScene.add(this.#mesh);
    // this.#mesh.layers.enable(layer);

    const material = new THREE.SpriteMaterial({
      map: texture,
    });

    this.#mesh = new THREE.Sprite(material);
    this.#mesh.scale.set(5, 5, 0)
    parentScene.add(this.#mesh);
  }

  spriteSheetTexture(imageURL, framesX, framesY, frameDelay, _endFrame) {

    var timer, frameWidth, frameHeight,
            x = 0, y = 0, count = 0, startFrame = 0, 
            endFrame = _endFrame || framesX * framesY,
            canvas = document.createElement('canvas'),
            ctx = canvas.getContext('2d'),
            canvasTexture = new THREE.CanvasTexture(canvas),
            img = new Image();

    img.onload = function(){
        canvas.width = frameWidth = img.width / framesX;
        canvas.height = frameHeight = img.height / framesY;
        timer = setInterval(nextFrame, frameDelay);
    }
    img.src = imageURL;

    function nextFrame() {
        count++;

        if(count >= endFrame ) {
            count = 0;
        };

        x = (count % framesX) * frameWidth;
        y = ((count / framesX)|0) * frameHeight;

        ctx.clearRect(0, 0, frameWidth, frameHeight);
        ctx.drawImage(img, x, y, frameWidth, frameHeight, 0, 0, frameWidth, frameHeight);

        canvasTexture.needsUpdate = true;
    }

    return canvasTexture;
  }

  makeTexture(imgUrl, framesX, framesY, imgWidth, imgHeight) {
    
    const texture = loader.load(imgUrl);
    texture.magFilter = THREE.NearestFilter;

  }
}