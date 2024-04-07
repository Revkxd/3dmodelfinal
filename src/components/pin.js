import * as THREE from "three";
import * as Ammo from "ammo.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

class BowlingPins {
  constructor(x, y, z, callback) {
    this.mesh = null;
    this.body = null;
    this.bounds = null;

    // load mesh
    const loader = new STLLoader();
    loader.load(
      "bowling-pin.stl",
      (geometry) => {
        const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
        const mesh = new THREE.Mesh(geometry, material);
        const scale = 0.02;
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
        const radius = size.x / 2;
        const height = size.y;
        const shape = new Ammo.btCylinderShape(
          new Ammo.btVector3(radius, height / 2, radius)
        );
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(x, y, z));
        const motionState = new Ammo.btDefaultMotionState(transform);
        const inertia = new Ammo.btVector3(0, 0, 0);
        shape.calculateLocalInertia(5, inertia); // Mass
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
    const newTransform = new Ammo.btTransform();
    newTransform.setIdentity();
    newTransform.setOrigin(newPos);
    this.body.setCenterOfMassTransform(newTransform);
  }
}

export { BowlingPins };
