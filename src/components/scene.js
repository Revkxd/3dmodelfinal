import * as THREE from "three";
import * as Ammo from "ammo.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { BowlingBall } from "./ball";
import { BowlingPins } from "./pin";
import { BowlingLane } from "./lane";

class MainScene {
  constructor() {
    // threejs
    this.scene = new THREE.Scene();
    this.renderer = new THREE.WebGLRenderer();
    this.stats = new Stats();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.orbitControls = new OrbitControls(
      this.camera,
      this.renderer.domElement
    );

    // ammojs
    this.world = null;
    this.objects = [];
  }

  init() {
    this.initThree();
    this.initPhysics();

    new BowlingBall(10.3, 3.5, 14, (object) => {
      this.add(object);
    });

    // Create 10 instances of the bowling pin in a triangle formation
    const numPinsInRow = [1, 2, 3, 4]; // Number of pins in each row of the triangle
    const pinSpacingX = 6; // Spacing between pins along the X-axis
    const pinSpacingZ = 5; // Spacing between rows along the Z-axis
    const startX =
      0.7 * pinSpacingX * (numPinsInRow[numPinsInRow.length - 1] - 1); // Starting X position
    const startZ = -180; // Starting Z position
    const yVal = 4.8; // Y position of the pins

    for (let row = 0; row < numPinsInRow.length; row++) {
      const xOffset = -0.5 * pinSpacingX * (numPinsInRow[row] - 1);
      for (let col = 0; col < numPinsInRow[row]; col++) {
        new BowlingPins(
          startX + xOffset + col * pinSpacingX,
          yVal,
          startZ - row * pinSpacingZ,
          (object) => this.add(object)
        );
      }
    }

    new BowlingLane(-4.9, -0.48, 19.5, (object) => {
      object.mesh.rotation.y = Math.PI / 2;
      this.add(object);
    });
  }

  initThree() {
    document.body.appendChild(this.stats.dom);
    document.body.appendChild(this.renderer.domElement);

    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.scene.background = new THREE.Color(0xadd8e6);

    const ambientLight = new THREE.AmbientLight(0x404040);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(1, 1, 1).normalize();
    this.scene.add(directionalLight);

    this.camera.position.x = 7;
    this.camera.position.y = 45;
    this.camera.position.z = 60;
  }

  initPhysics() {
    const collisionConfiguration = new Ammo.btDefaultCollisionConfiguration();
    const dispatcher = new Ammo.btCollisionDispatcher(collisionConfiguration);
    const overlappingPairCache = new Ammo.btDbvtBroadphase();
    const solver = new Ammo.btSequentialImpulseConstraintSolver();
    this.world = new Ammo.btDiscreteDynamicsWorld(
      dispatcher,
      overlappingPairCache,
      solver,
      collisionConfiguration
    );
    this.world.setGravity(new Ammo.btVector3(0, -9.8, 0));
  }

  add(object) {
    this.scene.add(object.mesh);
    this.world.addRigidBody(object.body);
    this.objects.push(object);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    this.world.stepSimulation(1 / 60, 10);

    this.objects.forEach((object) => {
      const transform = object.body.getWorldTransform();
      const position = transform.getOrigin();
      object.mesh.position.set(position.x(), position.y(), position.z());
      const rotation = transform.getRotation();
      object.mesh.quaternion.set(
        rotation.x(),
        rotation.y(),
        rotation.z(),
        rotation.w()
      );
    });

    this.stats.update();

    this.orbitControls.update();

    this.renderer.render(this.scene, this.camera);
  }
}

export { MainScene };