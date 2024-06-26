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
    this.clock = new THREE.Clock();
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

    // game
    this.ball = null;
    this.pins = [];
    this.pinsPos = [];
    this.elapsed = 0;
  }

  init() {
    this.initThree();
    this.initPhysics();

    this.camera.position.set(-35, 45, 0);
    const direction = new THREE.Vector3(100, 0, 0);
    this.camera.lookAt(direction);

    new BowlingLane(0, 0, 0, (object) => {
      this.addObject(object);
      object.setPos(0, 0, -object.bounds.z / 2);

      const intensity = 300;
      const lightPos = [
        [object.bounds.x - 35, object.bounds.y - 5, -object.bounds.z / 2 + 5],
        [object.bounds.x - 35, object.bounds.y - 5, object.bounds.z / 2 - 5],
        [object.bounds.x - 35, object.bounds.y - 45, -object.bounds.z / 2 + 5],
        [object.bounds.x - 35, object.bounds.y - 45, object.bounds.z / 2 - 5],
        [
          object.bounds.x - 35,
          object.bounds.y - 5,
          object.bounds.z / 4 - object.bounds.z / 4,
        ],
        [
          object.bounds.x - 35,
          object.bounds.y - 45,
          object.bounds.z / 4 - object.bounds.z / 4,
        ],
      ];

      lightPos.forEach((pos) => {
        const light = new THREE.PointLight(0xffffbf);
        light.position.set(pos[0], pos[1], pos[2]);
        light.intensity = intensity;
        this.scene.add(light);
      });
    });

    // Create 10 instances of the bowling pin in a triangle formation
    const numPinsInRow = [1, 2, 3, 4]; // Number of pins in each row of the triangle
    const pinSpacingX = 6; // Spacing between pins along the X-axis
    const pinSpacingZ = 6; // Spacing between rows along the Z-axis
    const startX =
      11.25 * pinSpacingX * (numPinsInRow[numPinsInRow.length - 1] - 1); // Starting X position
    const startZ = 1; // Starting Z position
    const yVal = 5; // Y position of the pins

    for (let row = 0; row < numPinsInRow.length; row++) {
      const xOffset = -0.5 * pinSpacingX * (numPinsInRow[row] - 1);
      const zOffset = -0.5 * pinSpacingZ * row;
      for (let col = 0; col < numPinsInRow[row]; col++) {
        this.pinsPos.push([
          startX + xOffset + row * pinSpacingX,
          yVal,
          startZ + zOffset + col * pinSpacingZ,
        ]);
        this.pins.push(
          new BowlingPins(
            startX + xOffset + row * pinSpacingX,
            yVal,
            startZ + zOffset + col * pinSpacingZ,
            (object) => this.addObject(object)
          )
        );
      }
    }

    this.ball = new BowlingBall(0, 0, 0, (object) => {
      this.addObject(object);
      object.setPos(0, 7, 0);
      object.launch(110, 0, 0);
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

  addObject(object) {
    this.scene.add(object.mesh);
    this.world.addRigidBody(object.body);
    this.objects.push(object);
  }

  reset() {
    const rand = (min, max) => Math.floor(Math.random() * (max - min) + min);

    const force = rand(80, 150);
    const zPos = rand(-12, 12);
    this.ball.removeForces();
    this.ball.setPos(0, 7, zPos);
    this.ball.launch(force, 0, 0);

    this.pins.forEach((pin, idx) => {
      const pos = this.pinsPos[idx];
      pin.removeForces();
      pin.setPos(pos[0], pos[1], pos[2]);
    });

    this.elapsed = 0;
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    if (
      this.ball.mesh.position.x >= 250.0 ||
      this.ball.mesh.position.z >= 50.0 ||
      this.ball.mesh.position.z <= -50.0 ||
      this.ball.mesh.position.y <= -5.0 ||
      this.elapsed >= 5.0
    ) {
      this.reset();
    }

    const deltaTime = this.clock.getDelta();
    this.elapsed += deltaTime;
    this.world.stepSimulation(deltaTime, 10);

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

    // this.orbitControls.update();

    this.renderer.render(this.scene, this.camera);
  }
}

export { MainScene };
