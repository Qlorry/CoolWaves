<script lang="ts">
import { defineComponent } from 'vue'
import { createData } from '@/logic/generator'

import * as THREE from 'three'
import { disposeTreeGeometry, drawLines } from '@/logic/renderer'

let lineMaterial!: THREE.LineBasicMaterial
let planeMaterial!: THREE.MeshBasicMaterial
let linesData: Array<Array<number>> = []
let linesGroup = new THREE.Group()

let camera = new THREE.OrthographicCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()

let transitionMatrix = new Array<Array<number>>()

export default defineComponent({
  data() {
    return {
      maxHeight: 30,

      inTransition: false,
      transitionIteration: 0,
      transitionLength: 70,
      stopAnimate: false
    }
  },
  props: {
    linesCount: Number,
    pointsCount: Number,
    lineColor: String,
    backgroundColor: String
  },
  methods: {
    getData() {
      if (!this.linesCount || !this.pointsCount) {
        return [[]]
      }

      return createData(
        this.linesCount,
        this.pointsCount,
        this.maxHeight,
        15,
        10,
        3,
        Math.random() * 3 + 6
      )
    },

    onWindowResize() {
      let parent = (this.$refs.canvas as HTMLElement).parentElement
      if (!parent) {
        return
      }

      camera.updateProjectionMatrix()

      renderer.setSize(parent.clientWidth, parent.clientHeight - 6)
    },

    animate() {
      if (this.stopAnimate) {
        return
      }

      requestAnimationFrame(this.animate)

      if (this.transitionIteration > this.transitionLength) {
        this.inTransition = false
      }

      if (!this.linesCount || !this.pointsCount) {
        return
      }

      if (this.inTransition) {
        this.transitionIteration++
        for (let i = 0; i < this.linesCount; i++) {
          for (let j = 0; j < this.pointsCount; j++) {
            linesData[i][j] += transitionMatrix[i][j]
          }
        }
      } else {
        let linesDataOld = linesData
        let linesDataNext = this.getData()
        for (let i = 0; i < this.linesCount; i++) {
          for (let j = 0; j < this.pointsCount; j++) {
            let diff = linesDataNext[i][j] - linesDataOld[i][j]
            transitionMatrix[i][j] = diff / this.transitionLength
          }
        }
        this.transitionIteration = 0
        this.inTransition = true
      }

      this.render()
    },

    render() {
      drawLines(linesGroup, linesData, lineMaterial, planeMaterial)
      renderer.render(scene, camera)
    }
  },
  mounted() {
    linesData = this.getData()
    transitionMatrix = JSON.parse(JSON.stringify(linesData))
    camera = new THREE.OrthographicCamera(0, linesData[0].length - 1, linesData.length - 1, 0)
    camera.position.z = 1000

    renderer = new THREE.WebGLRenderer({
      antialias: true,
      canvas: this.$refs.canvas as HTMLElement
    })
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.useLegacyLights = false

    scene.add(linesGroup)
    scene.background = new THREE.Color(this.backgroundColor)

    lineMaterial = new THREE.LineBasicMaterial({ color: this.lineColor })
    planeMaterial = new THREE.MeshBasicMaterial({ color: this.backgroundColor })

    window.addEventListener('resize', this.onWindowResize)
    this.onWindowResize()
    this.animate()
  },
  unmounted() {
    this.stopAnimate = true
    lineMaterial.dispose()
    planeMaterial.dispose()
    disposeTreeGeometry(linesGroup)
  }
})
</script>

<template>
  <div class="flex-grow-1 p-0 m-0">
    <canvas ref="canvas"></canvas>
  </div>
</template>
