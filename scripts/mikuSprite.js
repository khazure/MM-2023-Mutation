import * as THREE from 'three';

export default class MikuSprite {
  #mesh;

  constructor(parentScene, uniforms, layer) {
    const texture = this.spriteSheetTexture("../images/test_sheet.png", 2, 1, 5);
    const material = new THREE.SpriteMaterial({
      map: texture,
    });

    this.#mesh = new THREE.Sprite(material);
    this.#mesh.scale.set(5, 5, 0);
    this.#mesh.layers.enable(layer);
    parentScene.add(this.#mesh);
  }

  /**
   * Function from Motionharvest: https://stackoverflow.com/questions/16029103/three-js-using-2d-texture-sprite-for-animation-planegeometry 
   * Creates a texture from a sprite sheet that animates the sprite by
   * going from frame to frame in the sprite sheet grid. Used by the material
   * of the sprite.
   * @param {*} imageURL - url of sprite sheet
   * @param {*} framesX - number of frames on the x-axis
   * @param {*} framesY - Number of frames on the y-axis
   * @param {*} frameDelay - delay between frames
   * @param {*} _endFrame - optional, denotes ending frame if entire row isn't used
   * @returns texture for use by Sprite's material
   */
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
        //timer = setInterval(nextFrame, frameDelay);
    }
    img.src = imageURL;

    canvasTexture.animate = function nextFrame() {
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

  /**
   * Public function for animating to the next frame of sprite
   */
  nextFrame() {
    this.#mesh.material.map.animate();
  }
}