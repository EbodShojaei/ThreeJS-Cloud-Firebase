import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Enable color management
THREE.ColorManagement.enabled = true;

const scene = new THREE.Scene();
scene.add(new THREE.AxesHelper(5));

// const pointLight = new THREE.PointLight(0xeeeeee, 1);
// pointLight.position.set(0.8, 1.4, 1.0);
// scene.add(pointLight);

const ambientLight = new THREE.AmbientLight(0xB19CD9, 2);
scene.add(ambientLight);

const hemiLight = new THREE.HemisphereLight(0xFFD580, 0xB19CD9, 1);
scene.add(hemiLight);

// const light = new THREE.SpotLight(0xFFD580, 4);
// light.position.set(8, 14, 10);
// light.castShadow = true;
// scene.add(light);

const directionalLight = new THREE.DirectionalLight(0xFFD580, 4);
directionalLight.position.set(30, -20, 10);
scene.add(directionalLight);

scene.background = new THREE.Color(0xdddddd);

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0.8, 1.4, 1.0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.LinearEncoding = THREE.SRGBColorSpace;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

const gltfLoader = new GLTFLoader();

const draco = new DRACOLoader();
draco.setDecoderConfig({ type: 'js' });
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
gltfLoader.setDRACOLoader(draco);
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

const mixer = new THREE.AnimationMixer(scene); // Create an animation mixer

const fileURL = '/load';

const load = () => {
  fetch(fileURL)
    .then((response) => response.json())
    .then((data) => {
      const modelURL = data.url;

      gltfLoader.load(
        modelURL,
        (object) => {
          console.log(modelURL);
          let avatar = object.scene;
          avatar.scale.set(1, 1, 1);
          // avatar.rotation.x = -Math.PI / 2;

          avatar.traverse((child) => {
            if (child.isMesh) {
              child.material.envMapIntensity = 1;
              child.material.needsUpdate = true;
              // child.geometry.computeVertexNormals(); // Disabled for Meshopt compressed glTF
              child.material.lightMapIntensity = 1;
              child.material.emissiveIntensity = 1;
              child.material.aoMapIntensity = 1;
              child.material.normalScale = new THREE.Vector2(1, 1);
              child.material.vertexColors = false;
              child.material.visible = true;
              child.material.alphaTest = 0;
            }
          });

          scene.add(avatar);

          const animations = object.animations;

          if (animations && animations.length > 0) {
            animations.forEach((animation) => {
              if (animation.name === 'StandingIdle') {
                console.log(`Playing animation ${animation.name}`);
                const animationAction = mixer.clipAction(animation);
                animationAction.play();
              }
            });
          }
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.log(error);
        });
    })
    .catch((error) => {
      console.error(error);
      console.log('Retrying...');
      load();
    });
};

// When dom content is loaded, load the model
document.addEventListener('DOMContentLoaded', load);

window.addEventListener('resize', onWindowResize, false);

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  render();
}

const stats = new Stats();
document.body.appendChild(stats.dom);

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  mixer.update(0.01); // Update the animation mixer with a fixed time step

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();