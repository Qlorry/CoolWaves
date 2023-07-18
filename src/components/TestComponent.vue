<script lang="ts">
// defineProps<{
//   msg: string
// }>()

import { defineComponent } from 'vue'
import * as THREE from 'three'

let camera = new THREE.OrthographicCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()
let mesh = new THREE.Mesh()
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff })

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
      stopAnimate: false
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

      this.render()
    },

    render() {
      mesh.geometry.dispose()
      scene.remove(mesh)

      const heartShape = new THREE.Shape()

      heartShape.moveTo(0, 1)

      for (let i = 0; i < 300; i++) {
        heartShape.lineTo(i, Math.random() * 100)
      }

      heartShape.lineTo(300, 35)
      heartShape.lineTo(300, -1)
      heartShape.lineTo(0, -1)
      heartShape.lineTo(0, 1)

      const geometry = new THREE.ShapeGeometry(heartShape)
      mesh = new THREE.Mesh(geometry, planeMaterial)
      mesh.position.z = 10

      scene.add(mesh)

      renderer.render(scene, camera)
    }
  },
  mounted() {
    debugger
    camera = new THREE.OrthographicCamera(0, 300, 100, 0)
    camera.position.z = 1000
    const canvasEl = this.$refs.canvas as HTMLElement
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasEl })
    // scene.background = new THREE.Color(255, 255, 255)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.useLegacyLights = false

    window.addEventListener('resize', this.onWindowResize)

    canvasEl.addEventListener('mousemove', (event) => {
      const canvasEl = this.$refs.canvas as HTMLElement
      var rect = canvasEl.getBoundingClientRect()

      this.pointer.x = event.clientX - rect.left
      this.pointer.y = event.clientY - rect.top
      this.pointer.x = this.pointer.x < 0 ? 0 : this.pointer.x
      this.pointer.y = this.pointer.y < 0 ? 0 : this.pointer.y
    })

    this.onWindowResize()
    this.animate()
  },
  unmounted() {
    this.stopAnimate = true
  }
})
</script>

<template>
  <h4>{{ pointer.x }}</h4>
  <h4>{{ pointer.y }}</h4>
  <div class="flex-grow-1 p-0 m-0">
    <canvas ref="canvas"></canvas>
  </div>
</template>
