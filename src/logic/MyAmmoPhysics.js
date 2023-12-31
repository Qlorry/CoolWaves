let AmmoLib;

export class RigidBody {

	constructor(body,
		transform,
		motionState,
		shape,
		inertia,
		info) {
		this.body_ = body;
		this.transform_ = transform;
		this.motionState_ = motionState;
		this.shape_ = shape;
		this.inertia_ = inertia;
		this.info_ = info;
	}

	setRestitution(val) {
		this.body_?.setRestitution(val);
	}

	setFriction(val) {
		this.body_?.setFriction(val);
	}

	setRollingFriction(val) {
		this.body_?.setRollingFriction(val);
	}
}

export class RigidBox extends RigidBody {

	constructor(mass, pos, quat, size) {
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
	constructor(mass, pos, size) {
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


async function MyAmmoPhysics() {

	if ('Ammo' in window === false) {

		console.error('AmmoPhysics: Couldn\'t find Ammo.js');
		return;

	}

	if (typeof Ammo === 'function') {

		AmmoLib = await Ammo(); // eslint-disable-line no-undef
	}
	else {
		AmmoLib = Ammo;
	}
	const frameRate = 60;

	const collisionConfiguration = new AmmoLib.btDefaultCollisionConfiguration();
	const dispatcher = new AmmoLib.btCollisionDispatcher(collisionConfiguration);
	const broadphase = new AmmoLib.btDbvtBroadphase();
	const solver = new AmmoLib.btSequentialImpulseConstraintSolver();
	const world = new AmmoLib.btDiscreteDynamicsWorld(dispatcher, broadphase, solver, collisionConfiguration);
	world.setGravity(new AmmoLib.btVector3(0, - 9.8, 0));

	const worldTransform = new AmmoLib.btTransform();

	//

	function getShape(geometry) {

		const parameters = geometry.parameters;

		// TODO change type to is*

		if (geometry.type === 'BoxGeometry') {

			const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
			const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
			const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;

			const shape = new AmmoLib.btBoxShape(new AmmoLib.btVector3(sx, sy, sz));
			shape.setMargin(0.05);

			return shape;

		} else if (geometry.type === 'SphereGeometry' || geometry.type === 'IcosahedronGeometry') {

			const radius = parameters.radius !== undefined ? parameters.radius : 1;

			const shape = new AmmoLib.btSphereShape(radius);
			shape.setMargin(0.05);

			return shape;

		}

		return null;

	}

	const meshes = [];
	const meshMap = new WeakMap();
	const meshWeightMap = new WeakMap();


	function addMeshAndShape(mesh, shape, mass = 0) {
		if (shape !== null) {

			if (mesh.isInstancedMesh) {

				handleInstancedMesh(mesh, mass, shape);

			} else if (mesh.isMesh) {

				handleMesh(mesh, mass, shape);

			}

		}
	}

	function addMeshAndBody(mesh, body, mass = 0) {
		addMeshAndShape(mesh, body.shape_, mass)
	}

	function addMesh(mesh, mass = 0) {

		const shape = getShape(mesh.geometry);

		addMeshAndShape(mesh, shape, mass);

	}


	function handleMesh(mesh, mass, shape) {

		const position = mesh.position;
		const quaternion = mesh.quaternion;

		const transform = new AmmoLib.btTransform();
		transform.setIdentity();
		transform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));
		transform.setRotation(new AmmoLib.btQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w));

		const motionState = new AmmoLib.btDefaultMotionState(transform);

		const localInertia = new AmmoLib.btVector3(0, 0, 0);
		shape.calculateLocalInertia(mass, localInertia);

		const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);

		const body = new AmmoLib.btRigidBody(rbInfo);
		// body.setFriction( 4 );
		world.addRigidBody(body);

		// if (mass > 0) {
		meshWeightMap.set(mesh, mass);
		// }
		meshes.push(mesh);
		meshMap.set(mesh, body);

		// }


	}

	function handleInstancedMesh(mesh, mass, shape) {

		const array = mesh.instanceMatrix.array;

		const bodies = [];

		for (let i = 0; i < mesh.count; i++) {

			const index = i * 16;

			const transform = new AmmoLib.btTransform();
			transform.setFromOpenGLMatrix(array.slice(index, index + 16));

			const motionState = new AmmoLib.btDefaultMotionState(transform);

			const localInertia = new AmmoLib.btVector3(0, 0, 0);
			shape.calculateLocalInertia(mass, localInertia);

			const rbInfo = new AmmoLib.btRigidBodyConstructionInfo(mass, motionState, shape, localInertia);

			const body = new AmmoLib.btRigidBody(rbInfo);
			world.addRigidBody(body);

			bodies.push(body);

		}

		if (mass > 0) {

			meshes.push(mesh);

			meshMap.set(mesh, bodies);

		}

	}

	//

	function setMeshPosition(mesh, position, index = 0) {

		if (mesh.isInstancedMesh) {

			const bodies = meshMap.get(mesh);
			const body = bodies[index];

			body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
			body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));

			worldTransform.setIdentity();
			worldTransform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));
			body.setWorldTransform(worldTransform);

		} else if (mesh.isMesh) {

			const body = meshMap.get(mesh);

			body.setAngularVelocity(new AmmoLib.btVector3(0, 0, 0));
			body.setLinearVelocity(new AmmoLib.btVector3(0, 0, 0));

			worldTransform.setIdentity();
			worldTransform.setOrigin(new AmmoLib.btVector3(position.x, position.y, position.z));
			body.setWorldTransform(worldTransform);

		}

	}

	//

	let lastTime = 0;

	function step() {

		const time = performance.now();

		if (lastTime > 0) {

			const delta = (time - lastTime) / 1000;

			world.stepSimulation(delta, 10);

			//

			for (let i = 0, l = meshes.length; i < l; i++) {

				const mesh = meshes[i];

				const mass = meshWeightMap.get(mesh);
				if (mass !== undefined && mass === 0)
					continue;

				if (mesh.isInstancedMesh) {

					const array = mesh.instanceMatrix.array;
					const bodies = meshMap.get(mesh);

					for (let j = 0; j < bodies.length; j++) {

						const body = bodies[j];

						const motionState = body.getMotionState();
						motionState.getWorldTransform(worldTransform);

						const position = worldTransform.getOrigin();
						const quaternion = worldTransform.getRotation();

						compose(position, quaternion, array, j * 16);

					}

					mesh.instanceMatrix.needsUpdate = true;
					mesh.computeBoundingSphere();

				} else if (mesh.isMesh) {

					const body = meshMap.get(mesh);

					const motionState = body.getMotionState();
					motionState.getWorldTransform(worldTransform);

					const position = worldTransform.getOrigin();
					const quaternion = worldTransform.getRotation();
					mesh.position.set(position.x(), position.y(), position.z());
					mesh.quaternion.set(quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w());

				}

			}

		}

		lastTime = time;

	}

	// animate

	setInterval(step, 1000 / frameRate);

	return {
		addMesh: addMesh,
		addMeshAndBody: addMeshAndBody,
		setMeshPosition: setMeshPosition
		// addCompoundMesh
	};

}

function compose(position, quaternion, array, index) {

	const x = quaternion.x(), y = quaternion.y(), z = quaternion.z(), w = quaternion.w();
	const x2 = x + x, y2 = y + y, z2 = z + z;
	const xx = x * x2, xy = x * y2, xz = x * z2;
	const yy = y * y2, yz = y * z2, zz = z * z2;
	const wx = w * x2, wy = w * y2, wz = w * z2;

	array[index + 0] = (1 - (yy + zz));
	array[index + 1] = (xy + wz);
	array[index + 2] = (xz - wy);
	array[index + 3] = 0;

	array[index + 4] = (xy - wz);
	array[index + 5] = (1 - (xx + zz));
	array[index + 6] = (yz + wx);
	array[index + 7] = 0;

	array[index + 8] = (xz + wy);
	array[index + 9] = (yz - wx);
	array[index + 10] = (1 - (xx + yy));
	array[index + 11] = 0;

	array[index + 12] = position.x();
	array[index + 13] = position.y();
	array[index + 14] = position.z();
	array[index + 15] = 1;

}

export { MyAmmoPhysics };
