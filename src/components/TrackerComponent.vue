<script lang="ts">
import { defineComponent } from 'vue'
import { createData, createNoisyData, createSinData } from '@/logic/generator'

import * as THREE from 'three'
import { disposeTreeGeometry, createLines, updateLines, type Lines } from '@/logic/shader-renderer'

let linesData: Array<Array<number>> = []
let linesDataNext: Array<Array<number>> = []
let linesGroup = new THREE.Group()

let camera = new THREE.OrthographicCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()

let transitionMatrix = new Array<Array<number>>()

let savedLines: Lines;

export default defineComponent({
  data() {
    return {
      pointer: new THREE.Vector2(-100, -100),

      inTransition: false,
      transitionIteration: 0,
      transitionLength: 100,
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
      return createNoisyData(this.linesCount, this.pointsCount)
    },

    onWindowResize() {
      let parent = (this.$refs.canvas as HTMLElement).parentElement
      if (!parent) {
        return
      }

      camera.updateProjectionMatrix()

      renderer.setSize(parent.clientWidth, parent.clientHeight - 6)
    },

    animateBuzz() {
      if (!this.linesCount || !this.pointsCount) {
        return
      }

      const targetX = Math.round(this.pointer.x)
      const targetY = Math.round(this.pointer.y)

      if (this.inTransition) {
        this.transitionIteration++
        for (let i = 0; i < this.linesCount; i++) {
          for (let j = 0; j < this.pointsCount; j++) {
            const radius = Math.sqrt(Math.pow(targetX - j, 2) + Math.pow(targetY - i, 2))
            if (radius > 7) {
              linesData[i][j] += transitionMatrix[i][j]
              continue
            }
            const targetValue = linesData[i][j]
            linesData[i][j] = targetValue < 40 ? targetValue + 40 / 20 : 40
            transitionMatrix[i][j] =
              (linesDataNext[i][j] - linesData[i][j]) / this.transitionLength

          }
        }
      } else {
        let linesDataOld = linesData
        linesDataNext = this.getData()
        for (let i = 0; i < this.linesCount; i++) {
          for (let j = 0; j < this.pointsCount; j++) {
            let diff = linesDataNext[i][j] - linesDataOld[i][j]
            transitionMatrix[i][j] = diff / this.transitionLength
          }
        }
        this.transitionIteration = 0
        this.inTransition = true
      }
    },

    animateWave() {
      if (!this.linesCount || !this.pointsCount) {
        return
      }

      for (let i = 0; i < this.linesCount; i++) {
        linesData[i].push(...linesData[i].splice(0, 1))
      }
    },

    animate() {
      if (this.stopAnimate) {
        return
      }

      requestAnimationFrame(this.animate)

      if (this.transitionIteration > this.transitionLength) {
        this.inTransition = false
      }
      // const start = performance.now();

      this.animateBuzz()

      // const middle = performance.now();
      this.render()
      // const end = performance.now();
      // console.log(`animateBuzz execution time: ${middle - start} ms`);
      // console.log(`render execution time: ${end - middle} ms`);

    },

    render() {
      const start = performance.now();

      updateLines(savedLines, linesData)
      const middle = performance.now();
      renderer.render(scene, camera)
      const end = performance.now();
      console.log(`updateLines execution time: ${middle - start} ms`);
      console.log(`renderer.render execution time: ${end - middle} ms`);

    },

    updateMousePos(event: TouchEvent | MouseEvent) {
      const canvasEl = this.$refs.canvas as HTMLElement
      var rect = canvasEl.getBoundingClientRect()

      let x, y
      if (event instanceof TouchEvent) {
        event.preventDefault()

        var touch = event.touches[0] || event.changedTouches[0]
        x = touch.pageX
        y = touch.pageY
      } else {
        x = event.clientX
        y = event.clientY
      }

      this.pointer.x = x - rect.left
      this.pointer.y = y - rect.top

      this.pointer.x = this.pointer.x < 0 ? 0 : this.pointer.x
      this.pointer.y = this.pointer.y < 0 ? 0 : this.pointer.y

      this.pointer.x = (this.pointer.x / rect.width) * camera.right
      this.pointer.y = ((rect.height - this.pointer.y) / rect.height) * camera.top
    },
    removeSelection(event: TouchEvent | MouseEvent) {
      this.pointer.x = -100
      this.pointer.y = -100
    }
  },
  mounted() {
    linesData = this.getData()
    transitionMatrix = JSON.parse(JSON.stringify(linesData))
    camera = new THREE.OrthographicCamera(0, linesData[0].length - 1, linesData.length - 1, 0)
    camera.position.z = 2000

    const canvasEl = this.$refs.canvas as HTMLElement
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasEl })

    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.useLegacyLights = false

    scene.add(linesGroup)


    scene.background = new THREE.Color("#ff0000")

    window.addEventListener('resize', this.onWindowResize)

    canvasEl.addEventListener('mousemove', this.updateMousePos)
    canvasEl.addEventListener('touchmove', this.updateMousePos)
    canvasEl.addEventListener('touchstart', this.updateMousePos)
    canvasEl.addEventListener('touchcancel', this.updateMousePos)

    canvasEl.addEventListener('touchend', this.removeSelection)
    canvasEl.addEventListener('click', this.removeSelection)

    savedLines = createLines(linesGroup, linesData, this.lineColor ?? "", this.backgroundColor ?? "")

    this.onWindowResize()
    this.animate()
  },
  unmounted() {
    this.stopAnimate = true

    disposeTreeGeometry(linesGroup)
  }
})
</script>

<template>
  <div class="flex-grow-1 p-0 m-0">
    <canvas ref="canvas"></canvas>
  </div>
</template>
