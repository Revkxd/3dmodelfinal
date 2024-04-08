import * as THREE from "three";
import * as Ammo from "ammo.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

class BowlingBall {
  constructor(x, y, z, callback) {
    this.mesh = null;
    this.body = null;
    this.bounds = null;

    // load mesh
    const loader = new STLLoader();
    loader.load(
      "bowling-ball.stl",
      (geometry) => {
        const material = new THREE.MeshPhongMaterial({
          color: 0x000000,
          specular: 0x111111,
          shininess: 200,
        });
        const mesh = new THREE.Mesh(geometry, material);
        const scale = 0.004;
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.scale.set(scale, scale, scale);
        this.mesh = mesh;

        // get bounds
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        this.bounds = size;

        // create rigid body
        const radius = size.x / 1.5;
        const shape = new Ammo.btSphereShape(radius); // Adjust radius as needed
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(x, y, z));
        const motionState = new Ammo.btDefaultMotionState(transform);
        const inertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(300, inertia); // Mass
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
          1,
          motionState,
          shape,
          inertia
        );
        const body = new Ammo.btRigidBody(rbInfo);
        body.setRestitution(0.75);
        body.setFriction(0.3);
        body.setRollingFriction(0.01);
        this.body = body;

        if (callback) {
          callback(this);
        }
      },
      undefined,
      (err) => console.error(err)
    );
  }

  setPos(x, y, z) {
    this.mesh.position.set(x, y, z);
    const newPos = new Ammo.btVector3(x, y, z);
    const newTransform = new Ammo.btTransform();
    newTransform.setIdentity();
    newTransform.setOrigin(newPos);
    this.body.setCenterOfMassTransform(newTransform);
  }

  launch(x, y, z) {
    const impulseVec = new Ammo.btVector3(x, y, z);
    const centerOfMass = new Ammo.btVector3();
    this.body.getCenterOfMassTransform().getOrigin(centerOfMass);
    this.body.applyImpulse(impulseVec, centerOfMass);
  }

  removeForces() {
    this.body.setAngularVelocity(new Ammo.btVector3(0, 0, 0));
    this.body.setLinearVelocity(new Ammo.btVector3(0, 0, 0));
  }
}

export { BowlingBall };
