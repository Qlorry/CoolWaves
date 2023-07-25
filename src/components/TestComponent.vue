<script lang="ts">
import { defineComponent } from 'vue'
import * as THREE from 'three'
import { disposeTreeGeometry } from '@/logic/renderer'

let lineMaterial!: THREE.LineBasicMaterial
// let planeMaterial!: THREE.MeshBasicMaterial

let camera = new THREE.OrthographicCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()
let mesh = new THREE.Mesh()
let changer = true

let displacement: any, noise: any;

let uniforms: any;
const clock = new THREE.Clock();
const vshader = `

// uniform float amplitude;

attribute float displacement;

varying vec3 vNormal;
varying vec2 vUv;

void main() {

  // vNormal = normal;
  // vUv = ( 0.5 + amplitude ) * uv + vec2( amplitude );

  vec3 newPosition = position;
  newPosition.y += displacement;
  //  + normal * vec3( displacement );
  gl_Position = projectionMatrix * modelViewMatrix * vec4( newPosition, 1.0 );
  // gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}
`
const fshader = `

varying vec3 vNormal;
varying vec2 vUv;

uniform vec3 color;

void main() {


  gl_FragColor = vec4( color , 1.0 );

}
`



export default defineComponent({
  data() {
    return {
      pointer: new THREE.Vector2(),
      linesCount: 200,
      pointsCount: 200,
      maxHeight: 30,

      inTransition: false,
      transitionIteration: 0,
      transitionLength: 70,
      stopAnimate: false,
      changeShape: false
    }
  },
  methods: {
    onWindowResize() {
      let parent = (this.$refs.canvas as HTMLElement).parentElement
      if (!parent) {
        return
      }

      camera.updateProjectionMatrix()

      renderer.setSize(parent.clientWidth, parent.clientHeight - 6)
    },

    //

    animate() {
      if (this.stopAnimate) {
        return
      }
      requestAnimationFrame(this.animate)
      if (this.transitionIteration > this.transitionLength) {
        this.inTransition = false
      }

      if (this.inTransition) {
        this.transitionIteration++
      } else {
        this.transitionIteration = 0
        this.inTransition = true
      }
      if (this.changeShape) {


        const time = Date.now() * 0.01;
        debugger
        // sphere.rotation.y = sphere.rotation.z = 0.01 * time;

        // uniforms['amplitude'].value = 2.5 * Math.sin(sphere.rotation.y * 0.125);
        // uniforms['color'].value.offsetHSL(0.0005, 0, 0);

        for (let i = 0; i < displacement.length; i++) {

          displacement[i] = Math.sin(0.1 * i + time);

          noise[i] += 0.5 * (0.5 - Math.random());
          noise[i] = THREE.MathUtils.clamp(noise[i], - 5, 5);

          displacement[i] += noise[i] * 2;
        }

        mesh.geometry.attributes.displacement.needsUpdate = true;

        this.changeShape = false
        changer = !changer
      }

      this.render()
    },

    render() {
      renderer.render(scene, camera)
    }
  },
  mounted() {
    camera = new THREE.OrthographicCamera(-150, 150, 150, -150)
    camera.position.z = 1000

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.$refs.canvas as HTMLElement
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.useLegacyLights = false

    scene.background = new THREE.Color(255, 255, 255)

    uniforms = {
      'color': { value: new THREE.Color(0xff2200) }
    };

    const shaderMaterial = new THREE.ShaderMaterial({

      uniforms: uniforms,
      vertexShader: vshader,
      fragmentShader: fshader

    });

    let randomArr = [0, 20, 5, 20, 0];
    const points: THREE.Vector2[] = []
    randomArr.forEach((el, index) => {
      points.push(new THREE.Vector2(index, el))
    })

    const planeShape = new THREE.Shape(points);
    const planeGeometry = new THREE.ShapeGeometry(planeShape);
    debugger
    displacement = new Float32Array(planeGeometry.attributes.position.count);
    noise = new Float32Array(planeGeometry.attributes.position.count);

    for (let i = 0; i < displacement.length; i++) {

      noise[i] = Math.random() * 5;

    }

    planeGeometry.setAttribute('displacement', new THREE.BufferAttribute(displacement, 1));
    mesh = new THREE.Mesh(planeGeometry, shaderMaterial)
    scene.add(mesh);

    // sphere = new THREE.Mesh(geometry, shaderMaterial);
    // scene.add(sphere);

    window.addEventListener('resize', this.onWindowResize)
    this.onWindowResize()
    this.animate()
  },
  unmounted() {
    this.stopAnimate = true

    disposeTreeGeometry(scene)
  }
})
</script>

<template>
  <div class="d-flex flex-row p-2 justify-content-evenly">
    <h4>{{ pointer.x }}</h4>
    <h4>{{ pointer.y }}</h4>
    <button type="button" class="btn btn-danger" @click="changeShape = !changeShape">Change</button>
  </div>

  <div class="flex-grow-1 p-0 m-0">
    <canvas ref="canvas"></canvas>
  </div>
</template>
