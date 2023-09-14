<script lang="ts">
import { ref } from 'vue'

import { defineComponent } from 'vue'

import * as THREE from 'three'

import Stats from 'three/addons/libs/stats.module.js';
import { disposeTreeGeometry } from '@/logic/shader-renderer'
// import { PhysicsWorld, RigidBox, createAmmoLib } from '@/logic/physics-world'
import { MyAmmoPhysics, RigidBox, RigidSphere } from '@/logic/MyAmmoPhysics'
import type { AmmoPhysicsObject } from '@/logic/MyAmmoPhysics'

// let boxes, spheres, flowers;
let pointer: THREE.Vector2, raycaster: THREE.Raycaster;
let isShiftDown = false;

let floor: THREE.Mesh;
let sphere: THREE.Mesh;
let camera = new THREE.PerspectiveCamera()
let scene = new THREE.Scene()
let renderer = new THREE.WebGLRenderer()

let stats = new Stats();
let physics!: AmmoPhysicsObject;
let monkeys: THREE.InstancedMesh;
// const dummy = new THREE.Object3D();
let sound: THREE.Audio;

export default defineComponent({
  data() {
    return {
      inTransition: false,
      transitionIteration: 0,
      transitionLength: 100,
      stopAnimate: false,
      elementsCount: 300
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
    playMusic() {
      sound.play();
    },
    pauseMusic() {
      sound.pause();
    },
    onWindowResize() {
      const canvas = (this.$refs.canvasRef as HTMLCanvasElement);
      let parent = canvas.parentElement;
      if (!parent) {
        return
      }


      // adjust displayBuffer size to match
      if (canvas.width === parent.clientWidth || canvas.height === parent.clientHeight) {
        return;
      }


      camera.aspect = parent.clientWidth / parent.clientHeight;
      renderer.setSize(parent.clientWidth, parent.clientHeight)

      camera.updateProjectionMatrix()
    },
    animate() {
      if (this.stopAnimate) {
        return
      }
      this.onWindowResize();

      requestAnimationFrame(this.animate)

      this.render()
      stats?.update();

    },
    render() {
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
    onPointerMove(event: any) {
      event.preventDefault();
      event.stopImmediatePropagation();

      pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

      raycaster.setFromCamera(pointer, camera);

      const intersects = raycaster.intersectObjects([floor], false);
      if (intersects.length > 0) {

        const intersect = intersects[0];

        physics.setMeshPosition(sphere, new THREE.Vector3(intersect.point.x, sphere.position.y, intersect.point.z))
        sphere.position.x = intersect.point.x;
        sphere.position.z = intersect.point.z;

        this.render();
      }
    },
    // onPointerDown(event: any) {

    //   pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    //   raycaster.setFromCamera(pointer, camera);

    //   const intersects = raycaster.intersectObjects(objects, false);

    //   if (intersects.length > 0) {

    //     const intersect = intersects[0];

    //     // delete cube

    //     if (isShiftDown) {

    //       if (intersect.object !== plane) {

    //         scene.remove(intersect.object);

    //         objects.splice(objects.indexOf(intersect.object), 1);

    //       }

    //       // create cube

    //     } else {

    //       const voxel = new THREE.Mesh(cubeGeo, cubeMaterial);
    //       voxel.position.copy(intersect.point).add(intersect.face.normal);
    //       voxel.position.divideScalar(50).floor().multiplyScalar(50).addScalar(25);
    //       scene.add(voxel);

    //       objects.push(voxel);

    //     }

    //     render();

    //   }

    // }
  },
  async mounted() {
    physics = await MyAmmoPhysics();
    scene = new THREE.Scene();

    raycaster = new THREE.Raycaster();
    pointer = new THREE.Vector2();

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
    camera.position.set(4, 5, 0);
    camera.lookAt(0, 0, 0);

    const listener = new THREE.AudioListener();
    camera.add(listener);


    sound = new THREE.Audio(listener);

    const audioLoader = new THREE.AudioLoader();
    audioLoader.load('sounds/Shigatsu wa Kimi no Uso UKR.mp3', function (buffer) {
      sound.setBuffer(buffer);
      sound.setLoop(true);
      sound.setVolume(0.5);
      // sound.play();
    });

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

    floor = new THREE.Mesh(
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
      new THREE.BoxGeometry(1, 105, 4),
      wallTexture
    );
    wall1.position.y = 0;
    wall1.position.z = 0;
    wall1.position.x = 2.5;

    scene.add(wall1);
    physics.addMesh(wall1);

    let wall2 = new THREE.Mesh(
      new THREE.BoxGeometry(4, 105, 1),
      wallTexture
    );
    wall2.position.y = 0;
    wall2.position.z = -2.5;
    wall2.position.x = 0;

    scene.add(wall2);
    physics.addMesh(wall2);

    let wall3 = new THREE.Mesh(
      new THREE.BoxGeometry(4, 105, 1),
      wallTexture
    );
    wall3.position.y = 0;
    wall3.position.z = 2.5;
    wall3.position.x = 0;

    scene.add(wall3);
    physics.addMesh(wall3);

    let wall4 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 105, 4),
      wallTexture
    );
    wall4.position.y = 0;
    wall4.position.z = 0;
    wall4.position.x = -2.5;

    scene.add(wall4);
    physics.addMesh(wall4);

    // sphere to move
    // const test = new THREE.MeshBasicMaterial({ color: 0xff0000 })

    sphere = new THREE.Mesh(
      new THREE.SphereGeometry(1, 10, 10),
      wallTexture
    );
    sphere.position.y = -0.5;
    sphere.position.z = 0;
    sphere.position.x = 0;

    scene.add(sphere);
    physics.addMesh(sphere);


    // instances
    const material = new THREE.MeshLambertMaterial();

    const matrix = new THREE.Matrix4();
    const color = new THREE.Color();


    const loader = new THREE.BufferGeometryLoader();
    loader.load('/models/suzanne_buffergeometry.json', (monkGeometry) => {
      monkGeometry.computeVertexNormals();
      monkGeometry.scale(0.07, 0.07, 0.07);

      const monkGaterial = new THREE.MeshNormalMaterial();
      // check overdraw
      // let material = new THREE.MeshBasicMaterial({ color: 0xff0000, opacity: 0.1, transparent: true });

      monkeys = new THREE.InstancedMesh(monkGeometry, monkGaterial, 500);
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


    window.addEventListener('resize', this.onWindowResize)
    parent?.addEventListener('resize', this.onWindowResize)

    document.addEventListener('pointermove', this.onPointerMove);
    // document.addEventListener('pointerdown', this.onPointerDown);
    // document.addEventListener('keydown', this.onDocumentKeyDown);
    // document.addEventListener('keyup', this.onDocumentKeyUp);

    canvasEl.addEventListener('mousemove', this.onPointerMove, { passive: false })
    canvasEl.addEventListener('touchmove', this.onPointerMove, { passive: false })
    canvasEl.addEventListener('touchstart', this.onPointerMove, { passive: false })
    canvasEl.addEventListener('touchcancel', this.onPointerMove, { passive: false })
    canvasEl.addEventListener('touchend', this.onPointerMove, { passive: false })
    // canvasEl.addEventListener('click', this.removeSelection)
    // document.body.appendChild(stats.dom);

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
  <div class="constainer d-flex justify-content-between py-1 px-4 m-0 w-100">
    <!-- <div class="constainer d-flex justify-content-between py-1 px-4 m-0 w-100">

    </div> -->
    <button type="button" @click="playMusic" class="btn btn-primary mx-2">Play Music</button>
    <button type="button" @click="pauseMusic" class="btn btn-danger mx-2">Stop Music</button>
    <div class="mx-2" >
      <label for="customRange2" class="form-label">Number Of Elements</label>
      <input v-model="elementsCount" type="range" class="form-range" min="10" max="1500" id="customRange2">
    </div>
  </div>
  <div class="flex-grow-1 p-0 m-0 mw-100 mh-100 overflow-hidden">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>
