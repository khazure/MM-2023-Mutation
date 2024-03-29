import * as THREE from 'three';
import * as TWEEN from '@tweenjs/tween.js';

export default class MikuSprite {
  #mesh;

  /**
   * Creates a miku sprite.
   * @param {THREE.Scene} parentScene - parent scene to add sprite to.
   * @param {*} sheetInfo - object containing parameters:
   *  - sheetPath: path to character sheet
   *  - alphaPath: path to corresponding alpha map for sheet
   *  - framesX: number of colummns in character sheet
   *  - framesY: number of rows in character sheet.
   * @param {Integer} layer - layer to add sprite to.
   */
  constructor(parentScene, sheetInfo, layer) {
    const texture = this.spriteSheetTexture(sheetInfo.sheetPath, sheetInfo.framesX, sheetInfo.framesY, 200);
    const alphaTexture = this.spriteSheetTexture(sheetInfo.alphaPath,sheetInfo.framesX, sheetInfo.framesY, 200);
    const material = new THREE.MeshPhysicalMaterial({
      transparent: true,
      map: texture,
      alphaMap: alphaTexture,
    });

    this.#mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    this.#mesh.layers.enable(layer);
    parentScene.add(this.#mesh);
  }

  /**
   * Function from Motionharvest: https://stackoverflow.com/questions/16029103/three-js-using-2d-texture-sprite-for-animation-planegeometry 
   * Creates a texture from a sprite sheet that animates the sprite by
   * going from frame to frame in the sprite sheet grid. Used by the material
   * of the sprite.
   * @param {URL} imageURL - url of sprite sheet
   * @param {Integer} framesX - number of frames on the x-axis
   * @param {Integer} framesY - Number of frames on the y-axis
   * @param {Number} frameDelay - delay between frames
   * @param {Integer} _endFrame - optional, denotes ending frame if entire row isn't used
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
    canvasTexture.magFilter = THREE.NearestFilter;

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
    this.#mesh.material.alphaMap.animate();
  }

  /**
   * Set the y rotation of the sprite plane
   */
  setRotation(value) {
    this.#mesh.rotation.y = value;
  }

  #createRotationTween(startAngle, endAngle, duration = 300, ease = TWEEN.Easing.Cubic.InOut) {
    startAngle = THREE.MathUtils.degToRad(startAngle);
    endAngle = THREE.MathUtils.degToRad(endAngle);
    const tween = new TWEEN.Tween({angle: startAngle})
      .to({angle: endAngle}, duration)
      .easing(ease)
      .onUpdate((coords) => {
        this.#mesh.rotation.y = coords.angle;
      });
      return tween;
  }

  tweenRotation(delay, startAngle, endAngle) {
    const enterTween = this.#createRotationTween(startAngle, endAngle);
    const exitTween = this.#createRotationTween(endAngle, startAngle);
    exitTween.delay(delay);

    enterTween.start().onComplete(() => exitTween.start());
  }
}
