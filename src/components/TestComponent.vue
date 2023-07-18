<script lang="ts">

import { defineComponent } from 'vue'
import * as THREE from 'three'
import { disposeTreeGeometry } from '@/logic/renderer';

let lineMaterial!: THREE.LineBasicMaterial;
let planeMaterial!: THREE.MeshBasicMaterial;

let camera = new THREE.OrthographicCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()
let mesh = new THREE.Mesh()
let changer = true;
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
        // mesh.geometry.dispose()
        // scene.remove(mesh)

        const heartShape = new THREE.Shape()

        heartShape.moveTo(0, 1)

        for (let i = 0; i < 300; i++) {
          heartShape.lineTo(i, changer ? 300 - i : i)
        }

        heartShape.lineTo(300, -1)


        debugger
        const shape = heartShape.extractPoints(302);



        const positionAttr = mesh.geometry.attributes.position;
        for (let i = 0; i < positionAttr.count; i++) {
          positionAttr.setXY(i,
            shape.shape[i].x,
            shape.shape[i].y)

        }

        positionAttr.needsUpdate = true;
        mesh.geometry.computeBoundingBox();
        mesh.geometry.computeBoundingSphere();
        mesh.geometry.computeVertexNormals();
        // mesh.geometry.computeTangents();
        // mesh.geometry.attributes. = true;
        // const geometry = new THREE.ShapeGeometry(heartShape)
        // mesh = new THREE.Mesh(geometry, planeMaterial)
        mesh.position.z = 10

        // scene.add(mesh)
        this.changeShape = false;
        changer = !changer;
      }

      this.render()
    },

    render() {


      renderer.render(scene, camera)
    }
  },
  mounted() {
    camera = new THREE.OrthographicCamera(0, 300, 300, 0)
    camera.position.z = 1000

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.$refs.canvas as HTMLElement
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.useLegacyLights = false

    scene.background = new THREE.Color(255, 255, 255)

    lineMaterial = new THREE.LineBasicMaterial({ color: 0x000 });
    planeMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });

    {
      const heartShape = new THREE.Shape()

      heartShape.moveTo(0, 1)

      for (let i = 0; i < 300; i++) {
        heartShape.lineTo(i, i)
      }

      heartShape.lineTo(300, -1)

      const shape = heartShape.extractPoints(305);

      const geometry = new THREE.ShapeGeometry(heartShape)
      mesh = new THREE.Mesh(geometry, planeMaterial)
      scene.add(mesh)
    }

    window.addEventListener('resize', this.onWindowResize)
    this.onWindowResize()
    this.animate()
  },
  unmounted() {
    this.stopAnimate = true;
    lineMaterial.dispose();
    planeMaterial.dispose();
    disposeTreeGeometry(scene);
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
