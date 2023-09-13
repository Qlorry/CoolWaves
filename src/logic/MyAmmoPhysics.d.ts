import * as THREE from 'three'

export class RigidBody {
    
}

export class RigidBox extends RigidBody {
    constructor(mass: number, pos: THREE.Vector3, quat: THREE.Quaternion, size: THREE.Vector3);
}

export class RigidSphere extends RigidBody {
    constructor(mass: number, pos: THREE.Vector3, size: number);
}

export interface AmmoPhysicsObject {
    addMesh: (mesh: THREE.Mesh, mass?: number) => void;
    addMeshAndBody: (mesh: THREE.Mesh, body: RigidBox, mass?: number) => void;
    setMeshPosition: (mesh: THREE.Mesh, position: THREE.Vector3, index?: number) => void;
}



// export class PhysicsWorld {
//     constructor();

//     addBody(mesh: THREE.Object3D, body: RigidBody): never;

//     removeBody(mesh?: THREE.Object3D, body?: RigidBody): never;

//     update(t: number): never;

//     step(timeElapsed: number): never;
// }

export function MyAmmoPhysics(): Promise<AmmoPhysicsObject>;

