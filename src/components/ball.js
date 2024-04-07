import * as THREE from "three";
import * as Ammo from "ammo.js";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";

class BowlingBall {
  constructor(x, y, z, callback) {
    this.mesh = null;
    this.body = null;

    // create rigid body
    const shape = new Ammo.btSphereShape(0.5); // Adjust radius as needed
    const transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin(new Ammo.btVector3(x, y, z));
    const motionState = new Ammo.btDefaultMotionState(transform);
    const inertia = new Ammo.btVector3(0, 0, 0);
    shape.calculateLocalInertia(1, inertia); // Mass = 1
    const rbInfo = new Ammo.btRigidBodyConstructionInfo(
      1,
      motionState,
      shape,
      inertia
    );
    const body = new Ammo.btRigidBody(rbInfo);

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

export { BowlingBall };
