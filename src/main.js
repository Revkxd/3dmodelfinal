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
    const material = new THREE.MeshPhongMaterial({
      color: 0xffffff,
      specular: 0x111111,
      shininess: 200,
    });
    const mesh = new THREE.Mesh(geometry, material);
    const scale = 0.0033;
    mesh.scale.set(scale, scale, scale);
    mesh.translateOnAxis(new THREE.Vector3(0, 1, 1), 2);
    scene.add(mesh);
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
