import * as THREE from "three";
import { STLLoader } from "three/examples/jsm/loaders/STLLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xadd8e6);
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
const controls = new OrbitControls(camera, renderer.domElement);

var ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

var directionalLight = new THREE.DirectionalLight(0xffffff);
directionalLight.position.set(1, 1, 1).normalize();
scene.add(directionalLight);

camera.position.x = -5;
camera.position.y = 10;
camera.position.z = 10;

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
    const scale = 0.0009;
    mesh.scale.set(scale, scale, scale);
    mesh.translateOnAxis(new THREE.Vector3(0, 1, 0), 2);
    scene.add(mesh);
  },
  undefined,
  (err) => console.error(err)
);

loader.load(
  "bowling-pin.stl",
  (geometry) => {
    const material = new THREE.MeshPhongMaterial({ color: 0xffffff });
    const pinMesh = new THREE.Mesh(geometry, material);

    // Create 10 instances of the bowling pin in a triangle formation
    const numPinsInRow = [1, 2, 3, 4]; // Number of pins in each row of the triangle
    const pinSpacingX = 1.1; // Spacing between pins along the X-axis
    const pinSpacingZ = 1; // Spacing between rows along the Z-axis
    const startX = -0.5 * pinSpacingX * (numPinsInRow[numPinsInRow.length - 1] - 1); // Starting X position
    const startZ = 0; // Starting Z position

    const pinScale = 0.0035; // Scale factor for the pins

    for (let row = 0; row < numPinsInRow.length; row++) {
        const xOffset = -0.5 * pinSpacingX * (numPinsInRow[row] - 1);
        for (let col = 0; col < numPinsInRow[row]; col++) {
            const pinInstance = pinMesh.clone();
            pinInstance.scale.set(pinScale, pinScale, pinScale); // Scale down the pin
            pinInstance.position.set(startX + xOffset + col * pinSpacingX, 0, startZ - row * pinSpacingZ);
            scene.add(pinInstance);
        }
    }
  },
  undefined,
  (err) => console.error(err)
);

loader.load(
  "bowling-lane.stl",
  (geometry) => {
    const material = new THREE.MeshPhongMaterial({
      color: 0xcd7f32,
      specular: 0x111111,
      shininess: 200,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const scale = 0.001;
    mesh.scale.set(scale, scale, scale + 0.001);

    // Rotate the lane mesh
    mesh.rotation.y = Math.PI / 2; // Rotate 90 degrees clockwise around the y-axis

    // Adjust the position of the lane along the y-axis
    mesh.position.y = 0.5; // Example height

    scene.add(mesh);
  },
  undefined,
  (err) => console.error(err)
);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  renderer.render(scene, camera);
}

animate();
