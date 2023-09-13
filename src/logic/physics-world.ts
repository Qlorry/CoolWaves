
import * as THREE from 'three'
import { AmmoPhysics } from 'three/addons/physics/AmmoPhysics.js';

const DEFAULT_MASS = 10;

export class RigidBody {
    constructor(public body_: Ammo.btRigidBody,
        public transform_: Ammo.btTransform,
        public motionState_: Ammo.btDefaultMotionState,
        public shape_: Ammo.btBoxShape | Ammo.btSphereShape,
        public inertia_: Ammo.btVector3,
        public info_: Ammo.btRigidBodyConstructionInfo) {
    }

    setRestitution(val: number) {
        this.body_?.setRestitution(val);
    }

    setFriction(val: number) {
        this.body_?.setFriction(val);
    }

    setRollingFriction(val: number) {
        this.body_?.setRollingFriction(val);
    }
}

export class RigidBox extends RigidBody {

    constructor(mass: number, pos: THREE.Vector3, quat: THREE.Quaternion, size: THREE.Vector3) {
        const transform_ = new AmmoLib.btTransform();
        transform_.setIdentity();
        transform_.setOrigin(new AmmoLib.btVector3(pos.x, pos.y, pos.z));
        transform_.setRotation(new AmmoLib.btQuaternion(quat.x, quat.y, quat.z, quat.w));
        const motionState_ = new AmmoLib.btDefaultMotionState(transform_);

        const btSize = new AmmoLib.btVector3(size.x * 0.5, size.y * 0.5, size.z * 0.5);
        const shape_ = new AmmoLib.btBoxShape(btSize);
        shape_.setMargin(0.05);

        const inertia_ = new AmmoLib.btVector3(0, 0, 0);
        if (mass > 0) {
            shape_.calculateLocalInertia(mass, inertia_);
        }

        const info_ = new AmmoLib.btRigidBodyConstructionInfo(
            mass, motionState_, shape_, inertia_);
        const body_ = new AmmoLib.btRigidBody(info_);

        AmmoLib.destroy(btSize);

        super(body_, transform_, motionState_, shape_, inertia_, info_);
    }
}

export class RigidSphere extends RigidBody {
    constructor(mass: number, pos: THREE.Vector3, size: number) {
        const transform_ = new AmmoLib.btTransform();
        transform_.setIdentity();
        transform_.setOrigin(new AmmoLib.btVector3(pos.x, pos.y, pos.z));
        transform_.setRotation(new AmmoLib.btQuaternion(0, 0, 0, 1));
        const motionState_ = new AmmoLib.btDefaultMotionState(transform_);

        const shape_ = new AmmoLib.btSphereShape(size);
        shape_.setMargin(0.05);

        const inertia_ = new AmmoLib.btVector3(0, 0, 0);
        if (mass > 0) {
            shape_.calculateLocalInertia(mass, inertia_);
        }

        const info_ = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState_, shape_, inertia_);
        const body_ = new AmmoLib.btRigidBody(info_);
        super(body_, transform_, motionState_, shape_, inertia_, info_);
    }
}


export class PhysicsWorld {
    collisionConfiguration_ = new AmmoLib.btDefaultCollisionConfiguration();
    dispatcher_ = new AmmoLib.btCollisionDispatcher(this.collisionConfiguration_);
    broadphase_ = new AmmoLib.btDbvtBroadphase();
    solver_ = new AmmoLib.btSequentialImpulseConstraintSolver();
    physicsWorld_ = new AmmoLib.btDiscreteDynamicsWorld(
        this.dispatcher_, this.broadphase_, this.solver_, this.collisionConfiguration_);

    rigidBodies_: { mesh: THREE.Object3D, body: RigidBody }[] = []
    previousRAF_: number | null = null;

    tmpTransform_ = new AmmoLib.btTransform();

    constructor() {
        this.physicsWorld_.setGravity(new AmmoLib.btVector3(0, -100, 0));
    }

    addBody(mesh: THREE.Object3D, body: RigidBody) {
        this.physicsWorld_.addRigidBody(body.body_);
        this.rigidBodies_.push({ mesh: mesh, body: body });
    }

    removeBody(mesh?: THREE.Object3D, body?: RigidBody) {
        if (body) {
            this.physicsWorld_.removeRigidBody(body.body_);
        }
        if (mesh) {
            const index = this.rigidBodies_.findIndex((mesh, body) => mesh == mesh);
            if (index === -1) {
                return;
            }
            this.physicsWorld_.removeRigidBody(this.rigidBodies_[index].body.body_);
            this.rigidBodies_.splice(index, 1);
        }
    }

    update(t: number) {
        if (this.previousRAF_ === null) {
            this.previousRAF_ = t;
        }

        this.step_(t - this.previousRAF_);
        this.previousRAF_ = t;
    }

    // spawn_() {
    //     const scale = Math.random() * 4 + 4;
    //     const box = new THREE.Mesh(
    //         new THREE.BoxGeometry(scale, scale, scale),
    //         new THREE.MeshStandardMaterial({
    //             color: 0x808080,
    //         }));
    //     box.position.set(Math.random() * 2 - 1, 200.0, Math.random() * 2 - 1);
    //     box.quaternion.set(0, 0, 0, 1);
    //     box.castShadow = true;
    //     box.receiveShadow = true;

    //     const rb = new RigidBody();
    //     rb.createBox(DEFAULT_MASS, box.position, box.quaternion, new THREE.Vector3(scale, scale, scale), null);
    //     rb.setRestitution(0.125);
    //     rb.setFriction(1);
    //     rb.setRollingFriction(5);

    //     this.physicsWorld_.addRigidBody(rb.body_);

    //     this.rigidBodies_.push({ mesh: box, rigidBody: rb });

    //     this.scene_.add(box);
    // }

    step_(timeElapsed: number) {
        const timeElapsedS = timeElapsed * 0.001;

        this.physicsWorld_.stepSimulation(timeElapsedS, 10);

        for (let i = 0; i < this.rigidBodies_.length; ++i) {
            this.rigidBodies_[i].body.motionState_.getWorldTransform(this.tmpTransform_);
            const pos = this.tmpTransform_.getOrigin();
            const quat = this.tmpTransform_.getRotation();
            const pos3 = new THREE.Vector3(pos.x(), pos.y(), pos.z());
            const quat3 = new THREE.Quaternion(quat.x(), quat.y(), quat.z(), quat.w());

            this.rigidBodies_[i].mesh.position.copy(pos3);
            this.rigidBodies_[i].mesh.quaternion.copy(quat3);
        }
    }
}

export async function createAmmoLib() {

}