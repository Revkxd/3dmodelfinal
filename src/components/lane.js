import * as THREE from "three";
import * as Ammo from "ammo.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

class BowlingLane {
  constructor(x, y, z, callback) {
    this.mesh = null;
    this.body = null;

    // create static body
    const shape = new Ammo.btBoxShape(new Ammo.btVector3(10, 0.5, 100)); // Adjust size as needed
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(x, y, z));
    const motionState = new Ammo.btDefaultMotionState(transform);
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(0, motionState, shape);
    const body = new Ammo.btRigidBody(rbInfo);
    body.setCollisionFlags(body.getCollisionFlags() | 2); // Set as static object
    this.body = body;

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
        this.body = body;
        if (callback) {
          callback(this);
        }
      },
      undefined,
      (err) => console.error(err)
    );
  }
}

export { BowlingLane };
