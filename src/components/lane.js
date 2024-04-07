import * as THREE from "three";
import * as Ammo from "ammo.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

class BowlingLane {
  constructor(x, y, z, callback) {
    this.mesh = null;
    this.body = null;
    this.bounds = null;

    // load mesh
    const loader = new STLLoader();
    loader.load(
      "bowling-lane.stl",
      (geometry) => {
        const material = new THREE.MeshPhongMaterial({
          color: 0xced2d7,
          specular: 0x111111,
          shininess: -100,
        });
        const mesh = new THREE.Mesh(geometry, material);

        const scale = 0.01;
        mesh.position.x = x;
        mesh.position.y = y;
        mesh.position.z = z;
        mesh.scale.set(scale, scale, scale + 0.001);
        this.mesh = mesh;

        // get bounds
        const boundingBox = new THREE.Box3().setFromObject(mesh);
        const size = new THREE.Vector3();
        boundingBox.getSize(size);
        this.bounds = size;

        // create static body
        const shape = new Ammo.btBoxShape(
          new Ammo.btVector3(size.x, 1.25, size.z)
        ); // Adjust size as needed
        const transform = new Ammo.btTransform();
        transform.setIdentity();
        transform.setOrigin(new Ammo.btVector3(x, y, z));
        const motionState = new Ammo.btDefaultMotionState(transform);
        const rbInfo = new Ammo.btRigidBodyConstructionInfo(
          0,
          motionState,
          shape
        );
        const body = new Ammo.btRigidBody(rbInfo);
        body.setRestitution(0.55);
        body.setFriction(0.3);
        body.setRollingFriction(1.0);
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
    const newPos = new Ammo.btVector3(x, y, z);
    const newTransform = new Ammo.btTransform();
    newTransform.setIdentity();
    newTransform.setOrigin(newPos);
    this.body.setCenterOfMassTransform(newTransform);
  }
}

export { BowlingLane };
