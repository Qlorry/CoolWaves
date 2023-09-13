<script lang="ts">
import { ref } from 'vue'

import { defineComponent } from 'vue'

import * as THREE from 'three'

import Stats from 'three/addons/libs/stats.module.js';
import { disposeTreeGeometry } from '@/logic/shader-renderer'
// import { PhysicsWorld, RigidBox, createAmmoLib } from '@/logic/physics-world'
import { MyAmmoPhysics, RigidBox, RigidSphere } from '@/logic/MyAmmoPhysics'

let position = new THREE.Vector3();
let boxes, spheres, flowers;


let camera = new THREE.PerspectiveCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()

let stats = new Stats();
let physics;
let monkeys: THREE.InstancedMesh;
const dummy = new THREE.Object3D();


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
  setup() {
    const canvasRef = ref(null)
    return {
      canvasRef
    }
  },
  props: {
    backgroundColor: String
  },
  methods: {
    onWindowResize() {
      let parent = (this.$refs.canvasRef as HTMLElement).parentElement
      if (!parent) {
        return
      }

      camera.aspect = parent.clientWidth / parent.clientHeight;
      renderer.setSize(parent.clientWidth, parent.clientHeight)

      camera.updateProjectionMatrix()
    },

    animate(t: number) {
      if (this.stopAnimate) {
        return
      }

      requestAnimationFrame(this.animate)

      this.render(t)
      stats?.update();

    },

    render(t: number) {
      // if (mesh) {

      //   const time = Date.now() * 0.001;

      //   mesh.rotation.x = Math.sin(time / 4);
      //   mesh.rotation.y = Math.sin(time / 2);

      //   let i = 0;
      //   const offset = (amount - 1) / 2;

      //   for (let x = 0; x < amount; x++) {

      //     for (let y = 0; y < amount; y++) {

      //       for (let z = 0; z < amount; z++) {

      //         dummy.position.set(offset - x, offset - y, offset - z);
      //         dummy.rotation.y = (Math.sin(x / 4 + time) + Math.sin(y / 4 + time) + Math.sin(z / 4 + time));
      //         dummy.rotation.z = dummy.rotation.y * 2;

      //         dummy.updateMatrix();

      //         mesh.setMatrixAt(i++, dummy.matrix);

      //       }

      //     }

      //   }

      //   mesh.instanceMatrix.needsUpdate = true;
      //   mesh.computeBoundingSphere();

      // }
      renderer.render(scene, camera);
    },

    // updateMousePos(event: TouchEvent | MouseEvent) {
    //   const canvasEl = this.$refs.canvasRef as HTMLElement
    //   var rect = canvasEl.getBoundingClientRect()

    //   let x, y
    //   if (event instanceof TouchEvent) {
    //     event.preventDefault()

    //     var touch = event.touches[0] || event.changedTouches[0]
    //     x = touch.pageX
    //     y = touch.pageY
    //   } else {
    //     x = event.clientX
    //     y = event.clientY
    //   }

    //   this.pointer.x = x - rect.left
    //   this.pointer.y = y - rect.top

    //   this.pointer.x = this.pointer.x < 0 ? 0 : this.pointer.x
    //   this.pointer.y = this.pointer.y < 0 ? 0 : this.pointer.y

    //   this.pointer.x = (this.pointer.x / rect.width) * camera.right
    //   this.pointer.y = ((rect.height - this.pointer.y) / rect.height) * camera.top
    // },
    // removeSelection(event: TouchEvent | MouseEvent) {
    //   this.pointer.x = -100
    //   this.pointer.y = -100
    // }
  },
  async mounted() {
    physics = await MyAmmoPhysics();

    const canvasEl = this.$refs.canvasRef as HTMLElement
    const parent = canvasEl.parentElement;

    const width = parent ? parent.clientWidth : window.innerWidth;
    const height = parent ? parent.clientHeight : window.innerHeight;

    // renderer
    renderer = new THREE.WebGLRenderer({ antialias: true, canvas: canvasEl })
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(width, height);
    renderer.shadowMap.enabled = true;

    // camera
    camera = new THREE.PerspectiveCamera(70, width / height, 0.1, 1000);
    camera.position.set(2, 1.5, 2);
    camera.lookAt(0, 0, 0);

    // light
    const hemiLight = new THREE.HemisphereLight();
    scene.add(hemiLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 3);
    dirLight.position.set(5, 5, 5);
    dirLight.castShadow = true;
    dirLight.shadow.camera.zoom = 2;
    scene.add(dirLight);
    scene.background = new THREE.Color(0x666666);

    // floor
    const floorShadow = new THREE.Mesh(
      new THREE.BoxGeometry(10, 5, 10),
      new THREE.ShadowMaterial({ color: 0x444444 })
    );
    floorShadow.position.y = - 2.5;
    floorShadow.receiveShadow = true;
    scene.add(floorShadow);
    physics.addMesh(floorShadow);

    const floor = new THREE.Mesh(
      new THREE.BoxGeometry(10, 5, 10),
      new THREE.MeshBasicMaterial({ color: 0x666666 })
    );
    floor.position.y = - 2.5;
    scene.add(floor);

    // walls
    const wallTexture = new THREE.MeshBasicMaterial({ color: 0xff0000 })
    wallTexture.opacity = 0.0;
    wallTexture.transparent = true;

    let wall1 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 15, 4),
      wallTexture
    );
    wall1.position.y = 0;
    wall1.position.z = 0;
    wall1.position.x = 2.5;

    scene.add(wall1);
    physics.addMesh(wall1);

    let wall2 = new THREE.Mesh(
      new THREE.BoxGeometry(4, 15, 1),
      wallTexture
    );
    wall2.position.y = 0;
    wall2.position.z = -2.5;
    wall2.position.x = 0;

    scene.add(wall2);
    physics.addMesh(wall2);

    let wall3 = new THREE.Mesh(
      new THREE.BoxGeometry(4, 15, 1),
      wallTexture
    );
    wall3.position.y = 0;
    wall3.position.z = 2.5;
    wall3.position.x = 0;

    scene.add(wall3);
    physics.addMesh(wall3);

    let wall4 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 15, 4),
      wallTexture
    );
    wall4.position.y = 0;
    wall4.position.z = 0;
    wall4.position.x = -2.5;

    scene.add(wall4);
    physics.addMesh(wall4);

    // instances
    const material = new THREE.MeshLambertMaterial();

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();

    // Boxes
    // debugger
    // const geometryBox = new THREE.BoxGeometry(0.075, 0.075, 0.075);
    // boxes = new THREE.InstancedMesh(geometryBox, material, 400);
    // boxes.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame

    // for (let i = 0; i < boxes.count; i++) {

    //   matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
    //   boxes.setMatrixAt(i, matrix);
    //   boxes.setColorAt(i, color.setHex(0xffffff * Math.random()));

    // }
    // const boxesBody = new RigidBox(1, boxes.position, boxes.quaternion, new THREE.Vector3(0.075, 0.075, 0.075));
    // physics.addMeshAndBody(boxes, boxesBody, 1);


    // const x = 0, y = 0;
    // const heartShape = new THREE.Shape();

    // heartShape.moveTo(x + 5, y + 5);
    // heartShape.bezierCurveTo(x + 5, y + 5, x + 4, y, x, y);
    // heartShape.bezierCurveTo(x - 6, y, x - 6, y + 7, x - 6, y + 7);
    // heartShape.bezierCurveTo(x - 6, y + 11, x - 3, y + 15.4, x + 5, y + 19);
    // heartShape.bezierCurveTo(x + 12, y + 15.4, x + 16, y + 11, x + 16, y + 7);
    // heartShape.bezierCurveTo(x + 16, y + 7, x + 16, y, x + 10, y);
    // heartShape.bezierCurveTo(x + 7, y, x + 5, y + 5, x + 5, y + 5);


    // const geometry = new THREE.ShapeGeometry(heartShape);
    // geometry.scale(0.007, 0.007, 0.007);





    const loader = new THREE.BufferGeometryLoader();
    loader.load('src/assets/models/suzanne_buffergeometry.json', (monkGeometry) => {
      debugger
      monkGeometry.computeVertexNormals();
      monkGeometry.scale(0.07, 0.07, 0.07);

      const monkGaterial = new THREE.MeshNormalMaterial();
      // check overdraw
      // let material = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.1, transparent: true });

      monkeys = new THREE.InstancedMesh(monkGeometry, monkGaterial, 1400);
      monkeys.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
      scene.add(monkeys);

      monkeys.castShadow = true;
      monkeys.receiveShadow = true;

      for (let i = 0; i < monkeys.count; i++) {
        matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
        monkeys.setMatrixAt(i, matrix);
        monkeys.setColorAt(i, color.setHex(0xffffff * Math.random()));

      }
      const boxesBody = new RigidSphere(1, monkeys.position, 0.075);
      physics.addMeshAndBody(monkeys, boxesBody, 1);
    });





    // // Spheres

    // const geometrySphere = new THREE.IcosahedronGeometry(0.05, 4);
    // spheres = new THREE.InstancedMesh(geometrySphere, material, 400);
    // spheres.instanceMatrix.setUsage(THREE.DynamicDrawUsage); // will be updated every frame
    // spheres.castShadow = true;
    // spheres.receiveShadow = true;
    // scene.add(spheres);

    // for (let i = 0; i < spheres.count; i++) {

    //   matrix.setPosition(Math.random() - 0.5, Math.random() * 2, Math.random() - 0.5);
    //   spheres.setMatrixAt(i, matrix);
    //   spheres.setColorAt(i, color.setHex(0xffffff * Math.random()));

    // }

    // physics.addMesh(spheres, 1);





    window.addEventListener('resize', this.onWindowResize)

    // canvasEl.addEventListener('mousemove', this.updateMousePos)
    // canvasEl.addEventListener('touchmove', this.updateMousePos)
    // canvasEl.addEventListener('touchstart', this.updateMousePos)
    // canvasEl.addEventListener('touchcancel', this.updateMousePos)

    // canvasEl.addEventListener('touchend', this.removeSelection)
    // canvasEl.addEventListener('click', this.removeSelection)
    document.body.appendChild(stats.dom);

    this.onWindowResize()
    this.animate(0)

    // setInterval(() => {

    //   let index = Math.floor(Math.random() * boxes.count);

    //   position.set(0, Math.random() + 1, 0);
    //   physics.setMeshPosition(boxes, position, index);

    //   //

    //   index = Math.floor(Math.random() * spheres.count);

    //   position.set(0, Math.random() + 1, 0);
    //   physics.setMeshPosition(spheres, position, index);

    // }, 1000 / 60);
  },
  unmounted() {
    this.stopAnimate = true

    disposeTreeGeometry(scene)
  }
})
</script>

<template>
  <div class="flex-grow-1 p-0 m-0 mw-100 mh-100 overflow-auto">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
