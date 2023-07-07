import * as THREE from 'three';

/*TODO only when you really need to.
    Currently, this shape assume an even amount of ring layers. We need to account for odd amount of layers.
      BTW layer 0 is not being used, but it is unoticable at larger numbers.
    Fix the instance(s) appearing at the center of circle when it should be at top or bottom of sphere,
    Fix the 'curvature difference' of the circles on seperate layers, 
      I.e there is one straight vertical line of instances but another looks like a wave.
    Color visability is tied to layer 0 toggle, fix it.
*/
export default class InstanceSphere {
  
  //The mesh that will be added to scene.
  #mesh;

  //Geometery used instances, possible usage later.
  #geometry;

  //Contains the end index of each ring layer, i.e layer 0 has instances at index 0 to maxVert.
  #layerEnd;

  //Contains the seperate individual radius used in the ring layers.
  #radii;


  constructor(parentScene, theGeometry, theMaterial, radius, maxVert, minVert, layer) {
    this.#geometry = theGeometry;
    this.#layerEnd =  [];
    this.#radii = [];

    let count = 0; //The total amount of instances needed.
    let totalLayers = (maxVert - minVert) * 2; //assumes even.

    //COUNTING THE INSTANCES NEEDED.
    for(let i = maxVert; i > minVert; i--) {
      count += i;
      this.#layerEnd.push(count); //Save the ending index of this layer.
    }

    for(let i = minVert; i < maxVert; i++) {
      count += i;
      this.#layerEnd.push(count);
    }      
    this.#mesh = new THREE.InstancedMesh(theGeometry, theMaterial, count);
    this.#mesh.layers.set(layer);
    parentScene.add(this.#mesh);

    //ASSIGNING RADI TO LAYERS  
    for(let i = 0; i < totalLayers / 2; i++) {
      this.#radii.push((Math.PI / 2) * i / radius);
    }
    //console.log("RADII of Instance Sphere: " + this.#layerEnd);

    //CREATING LAYERS:
      //Negative Radius can be used as reflection!
    for(let i = 1; i < totalLayers / 2; i++) {
      let height = radius * Math.sin(this.#radii[i - 1]);
      let ringRadius = radius * Math.cos(this.#radii[i - 1]);

      this.#arrangeToRing(this.#layerEnd[i - 1], this.#layerEnd[i],
                         ringRadius, 0, height, 0);
      this.#arrangeToRing(this.#layerEnd[this.#layerEnd.length - 1 - i], 
                          this.#layerEnd[this.#layerEnd.length - i], 
                          ringRadius, 0, -1 * height, 0); //-1 to reflect across center y-axis.
    }

    //Probably should move this to seperate setColorAt()
    //Needed since default InstancedMesh doesn't set color.
    for (let i = 0; i < this.#mesh.count; i++) {//Must set initial color to change later.
      this.#mesh.setColorAt( i, theMaterial.color);
    }

  }

  /**
   * Arranges the inputted portion of this instanceMesh into a ring formation that
   * is parallel to the y-axis.
   * 
   * @param {Integer} startIndex is the starting instance index.
   * @param {Integer} endIndex is the ending instance index.
   * @param {Number} radius is the radius of the ring.
   * @param {Number} centerX is the center X position.
   * @param {Number} centerY is the center Y position. 
   * @param {Number} centerZ is the center Z position. 
   */
  #arrangeToRing(startIndex, endIndex, radius, centerX, centerY, centerZ) {

    let vertices = endIndex - startIndex;
    for(let i = 0; i <= vertices; i++) {
      let newPos = new THREE.Matrix4();
      let angle = 2 * Math.PI * i/vertices; //Divide circumfrence of circle
      newPos.setPosition(radius * Math.cos(angle) + centerX, centerY, radius * Math.sin(angle) + centerZ);
      //Negative radius just switches places.
      this.#mesh.setMatrixAt(i + startIndex, newPos);
    }
    this.#mesh.instanceMatrix.needsUpdate = true;
    this.#mesh.computeBoundingBox();
  }


}