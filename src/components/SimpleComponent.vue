<script lang="ts">
// defineProps<{
//   msg: string
// }>()

import { defineComponent } from 'vue'
import { createData } from '@/logic/generator'
import * as THREE from 'three'

const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00bd7e })
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0x000 })
let linesData: Array<Array<number>> = []
let linesGroup = new THREE.Group()
let listOfCurves: Array<any> = []
let camera = new THREE.OrthographicCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()

let transitionMatrix = new Array<Array<number>>()

export default defineComponent({
  data() {
    return {
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
    getData() {
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
      listOfCurves.forEach((el: any) => {
        el.geometry.dispose()
      })
      listOfCurves.length = 0
      linesGroup.clear()

      linesData.forEach((lineData, lineIndex) => {
        {
          const heartShape = new THREE.Shape()

          heartShape.moveTo(0, lineIndex + lineData[0])

          lineData.forEach((el, index) => {
            if (index == 0) {
              return
            }
            heartShape.lineTo(index, lineIndex + el)
          })
          heartShape.lineTo(lineData.length - 1, 0)
          heartShape.lineTo(0, -1)
          heartShape.lineTo(0, lineIndex + lineData[0])
          debugger
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
    scene.background = new THREE.Color(255, 255, 255)
    renderer.setPixelRatio(window.devicePixelRatio)
    renderer.useLegacyLights = false

    // document.body.appendChild(this.renderer.domElement);

    scene.add(linesGroup)
    scene.background = new THREE.Color('#000')

    window.addEventListener('resize', this.onWindowResize)
    this.onWindowResize()
    this.animate()
  },
  unmounted() {
    this.stopAnimate = true
  }
})
</script>

<template>
  <div class="flex-grow-1 p-0 m-0">
    <canvas ref="canvas"></canvas>
  </div>
</template>
