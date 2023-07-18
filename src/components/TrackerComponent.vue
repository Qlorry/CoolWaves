<script lang="ts">
// defineProps<{
//   msg: string
// }>()

import { defineComponent } from 'vue'
import { createData, createNoisyData, createSinData } from '@/logic/generator'
import * as THREE from 'three'

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00bd7e })
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x000 })
let linesData: Array<Array<number>> = []
let linesDataNext: Array<Array<number>> = []
let linesGroup = new THREE.Group()
let listOfCurves: Array<any> = []
let camera = new THREE.OrthographicCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()

let transitionMatrix = new Array<Array<number>>()

export default defineComponent({
  data() {
    return {
      pointer: new THREE.Vector2(-100, -100),
      linesCount: 150,
      pointsCount: 200,
      maxHeight: 30,

      inTransition: false,
      transitionIteration: 0,
      transitionLength: 100,
      stopAnimate: false
    }
  },
  methods: {
    getData() {
      // return createNoisyData(
      //   this.linesCount,
      //   this.pointsCount
      // )
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
      const targetX = Math.round(this.pointer.x)
      const targetY = Math.round(this.pointer.y)

      if (this.inTransition) {
        this.transitionIteration++
        for (let i = 0; i < this.linesCount; i++) {
          for (let j = 0; j < this.pointsCount; j++) {
            if (targetY - 7 < i && targetY + 7 > i && targetX - 7 < j && targetX + 7 > j) {
              const radius = Math.sqrt(Math.pow(targetX - j, 2) + Math.pow(targetY - i, 2))
              if (radius > 7) {
                linesData[i][j] += transitionMatrix[i][j]
                continue
              }
              const targetValue = linesData[i][j]
              linesData[i][j] = targetValue < 40 ? targetValue + 40 / 20 : 40
              transitionMatrix[i][j] =
                (linesDataNext[i][j] - linesData[i][j]) / this.transitionLength
            } else {
              linesData[i][j] += transitionMatrix[i][j]
            }
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
      this.animateBuzz()
      // for (let y = targetY - 7; y < targetY + 7; y++) {
      //   for (let x = targetX - 7; x < targetX + 7; x++) {
      //     if (x >= 0 && y >= 0 && linesData.length > y && linesData[y].length > x) {
      //       const targetValue = linesData[y][x];

      //       linesData[y][x] = targetValue < 40 ? targetValue + 40 / 20 : 40;
      //     }
      //   }
      // }

      this.render()
    },

    drawLines() {
      listOfCurves.forEach((el: any) => {
        el.geometry.dispose()
      })
      listOfCurves.length = 0
      linesGroup.clear()
      linesData.forEach((lineData, lineIndex) => {
        {
          const heartShape = new THREE.Shape()
          heartShape.moveTo(0, Math.round(lineIndex + lineData[0]))

          lineData.forEach((el, index) => {
            if (index == 0) {
              return
            }
            heartShape.lineTo(index, lineIndex + el)
          })
          heartShape.lineTo(lineData.length - 1, 0)
          heartShape.lineTo(0, -1)
          heartShape.lineTo(0, Math.round(lineIndex + lineData[0]))

          const geometry = new THREE.ShapeGeometry(heartShape)
          const mesh = new THREE.Mesh(geometry, planeMaterial)
          mesh.position.setZ(this.linesCount - lineIndex)
          linesGroup.add(mesh)
          listOfCurves.push(mesh)
        }
        {
          const points: THREE.Vector3[] = []
          lineData.forEach((el, index) => {
            points.push(new THREE.Vector3(index, lineIndex + el, 0))
          })

          const geometry = new THREE.BufferGeometry().setFromPoints(points)

          const line = new THREE.Line(geometry, lineMaterial)
          line.position.setZ(this.linesCount - lineIndex)

          linesGroup.add(line)
          listOfCurves.push(line)
        }
      })
    },

    render() {
      this.drawLines()

      renderer.render(scene, camera)
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
    camera.position.z = 1000
    const canvasEl = this.$refs.canvas as HTMLElement
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasEl })
    scene.background = new THREE.Color(0, 0, 0)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.useLegacyLights = false

    scene.add(linesGroup)

    window.addEventListener('resize', this.onWindowResize)

    canvasEl.addEventListener('mousemove', this.updateMousePos)
    canvasEl.addEventListener('touchmove', this.updateMousePos)
    canvasEl.addEventListener('touchstart', this.updateMousePos)
    canvasEl.addEventListener('touchcancel', this.updateMousePos)

    canvasEl.addEventListener('touchend', this.removeSelection)
    canvasEl.addEventListener('click', this.removeSelection)

    this.onWindowResize()
    this.animate()
  },
  unmounted() {
    this.stopAnimate = true
  }
})
</script>

<template>
  <!-- <h4>{{ pointer.x }}</h4>
  <h4>{{ pointer.y }}</h4> -->
  <div class="flex-grow-1 p-0 m-0">
    <canvas ref="canvas"></canvas>
  </div>
</template>
