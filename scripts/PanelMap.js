import * as THREE from 'three';
import vertexShader from './shaders/vertex.glsl?raw'; // vite needs the ?raw query to import as string
import fragmentShader from './shaders/maskFragment.glsl?raw';

export default class PanelMap {
  #mesh;

  constructor(parentScene, uniforms, layer) {
    // 16:9 aspect ratio
    const width = 25;
    const height = 14.06;

    const theGeometry = new THREE.PlaneGeometry( 25, 14.06 );

    let alphaMap = this.#makePanelMask(width, height, 10, 15, 3, 2, 5, 6);
    alphaMap.magFilter = THREE.NearestFilter;

    uniforms.alphaMap = { value: alphaMap };

    // shader masking from scratch: https://stackoverflow.com/questions/64616711/how-to-add-opacity-map-to-shadermaterial
    let material = new THREE.ShaderMaterial({
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        vertexShader: vertexShader,
        fragmentShader: fragmentShader,
        uniforms  
    });

    this.#mesh = new THREE.Mesh(theGeometry, material);
    this.#mesh.layers.set(layer);

    // this.#mesh.lookAt(0, 0, 25);
    parentScene.add(this.#mesh);
  }

  
/**
 * Creates an alpha map for 3D meshes to enable masking
 * @param {*} width - width of canvas/texture
 * @param {*} height - height of canvas/texture
 * @param {*} rows - number of rows of grid on canvas
 * @param {*} columns - number of columns of grid on canvas
 * @param {*} xStart - x starting coord according to grid, corresponds to top left of panel
 * @param {*} yStart - y starting coord according to grid, corresponds to top left of panel
 * @param {*} xLength - width of panel following grid (ex. 5 means height of 5 columns)
 * @param {*} yLength - height of panel following grid (ex. 6 means height of 6 rows)
 * @returns 
 */
#makePanelMask(width, height, rows, columns, xStart, yStart, xLength, yLength) {
    let canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    ctx.canvas.width = width;
    ctx.canvas.height = height;
  
    // make canvas entirely black
    ctx.fillRect(0, 0, width, height);
  
    // calcuate panel placement
    const rowValue = height / rows;
    const colValue = width / columns;

    // draw panel
    ctx.fillStyle = "#FFF";
    ctx.fillRect(xStart * colValue, yStart * rowValue, xLength * colValue, yLength * rowValue);
  
    let canvasTexture = new THREE.CanvasTexture(canvas);
    return canvasTexture;
  
  }
}