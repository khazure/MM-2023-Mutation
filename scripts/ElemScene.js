import * as THREE from 'three';


export default class ElemScene {
    #scene;
    #camera;
    #element;

    constructor(elem) {
        this.#scene = new THREE.Scene();
        this.#element = elem;

        const aspectRatio = elem.offsetWidth / elem.offsetHeight;
        //fov, aspect, near, far
        this.#camera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 5);
        this.#camera .position.set(0, 1, 2);
        this.#camera .lookAt(0, 0, 0);

        //Setting up lighting
        {
            //color, intensity
            const light =  new THREE.DirectionalLight(0xFFFFFF, 1);
            light.position.set(-1, 2, 4);
            this.#scene.add(light);
        }
    }

    resizeRendererToDisplaySize(renderer) {
        const canvas = renderer.domElement;
        const width = canvas.clientWidth;
        const height = canvas.clientHeight;
        const needResize = canvas.width !== width || canvas.height !== height;
        if (needResize) {
          renderer.setSize(width, height, false);
        }
        return needResize;
    }

    renderScene(renderer) {
        const {left, right, top, bot, w, h} = this.#element.getBoundingClientRect();
        const isVisable = bot >= 0 && top <= renderer.domElement.clientHeight &&
                        right  >= 0 && left <= renderer.domElement.clientWidth;
        // const isVisable =  bot < 0 ||
        //     top > renderer.domElement.clientHeight ||
        //     right < 0 ||
        //     left > renderer.domElement.clientWidth;
        if(isVisable) {
            //console.log(isVisable);
            this.#camera.aspect = w/h;
            this.#camera.updateProjectionMatrix();
            
            //setScissor and setViewport set bottom differently
            const posBot = renderer.domElement.clientHeight - bot;

            renderer.setScissor(left, posBot, w, h);
            renderer.setViewport(left, posBot, w, h);

            renderer.render(this.#scene, this.#camera);
        }
    }

    getScene() {
        return this.#scene;
    }
}