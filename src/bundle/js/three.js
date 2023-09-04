import { Scene, Color, AmbientLight, HemisphereLight, DirectionalLight, PerspectiveCamera, WebGLRenderer, AnimationMixer, Vector2, AxesHelper, sRGBEncoding, SRGBColorSpace } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module.js';

// Enable color management
const scene = new Scene();
scene.add(new AxesHelper(5));

const ambientLight = new AmbientLight(0xB19CD9, 2);
scene.add(ambientLight);

const hemiLight = new HemisphereLight(0xFFD580, 0xB19CD9, 1);
scene.add(hemiLight);

const directionalLight = new DirectionalLight(0xFFD580, 4);
directionalLight.position.set(30, -20, 10);
scene.add(directionalLight);

scene.background = new Color(0xdddddd);

const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.set(0.8, 1.4, 1.0);

const renderer = new WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.LinearEncoding = SRGBColorSpace;

const mainElement = document.querySelector('main');
mainElement.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.target.set(0, 1, 0);

const gltfLoader = new GLTFLoader();

const draco = new DRACOLoader();
draco.setDecoderConfig({ type: 'js' });
draco.setDecoderPath('https://www.gstatic.com/draco/v1/decoders/');
gltfLoader.setDRACOLoader(draco);
gltfLoader.setMeshoptDecoder(MeshoptDecoder);

let avatar = null;
const mixer = new AnimationMixer(scene); // Create an animation mixer
let currentAnimation = null;

const container = document.getElementById('container');

const animationList = document.createElement('div');
animationList.style.visibility = 'hidden';
animationList.id = 'animationList';
container.appendChild(animationList);

const animationItems = document.createElement('div');
animationItems.id = 'animationItems';
animationList.appendChild(animationItems);

const playground = document.createElement('div');
playground.id = 'playground';
mainElement.appendChild(playground);

const overlay = document.createElement('div');
overlay.id = 'overlay';
document.body.appendChild(overlay);

const tryAgain = document.createElement('div');
tryAgain.id = 'tryAgain';
tryAgain.style.display = 'none';
tryAgain.textContent = 'Oops! Something went wrong.';
overlay.appendChild(tryAgain);

const button = document.createElement('div');
button.className = 'returnButton';
button.textContent = 'Try again';
tryAgain.appendChild(button);

button.addEventListener('click', () => {
  tryAgain.style.display = 'none';
  overlay.classList.remove('active');
  load();
});

const callReload = () => {
  overlay.classList.add('active');
  tryAgain.style.display = 'block';
};

const fileURL = '/load';

const playAnimation = (animation) => {
  const newAnimation = mixer.clipAction(animation);

  if (currentAnimation && currentAnimation !== newAnimation) {
    currentAnimation.fadeOut(0.3);

    // Reset and prepare the new animation
    newAnimation.reset()
      .setEffectiveTimeScale(1.5)
      .setEffectiveWeight(1)
      .fadeIn(0.3)
      .play();
  } else if (!currentAnimation) {
    // If no current animation, just play the new one
    newAnimation.setEffectiveTimeScale(1.5)
      .setEffectiveWeight(1)
      .play();
  }

  // Update the current animation reference
  currentAnimation = newAnimation;
};

const load = () => {
  console.log('Loading model...');

  fetch(fileURL)
    .then((response) => {
      if (response.status === 429) {
        throw new Error('Too many requests');
      }

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      return response.json();
    })
    .then((data) => {
      const modelURL = data.url;

      gltfLoader.load(
        modelURL,
        (object) => {
          avatar = object.scene;
          avatar.scale.set(1, 1, 1);
          // avatar.rotation.x = -Math.PI / 2;

          avatar.traverse((child) => {
            if (child.isMesh) {
              child.material.opacity = 0;
              child.material.transparent = true;
              child.material.envMapIntensity = 1;
              child.material.needsUpdate = true;
              // child.geometry.computeVertexNormals(); // Disabled for Meshopt compressed glTF
              child.material.lightMapIntensity = 1;
              child.material.emissiveIntensity = 1;
              child.material.aoMapIntensity = 1;
              child.material.normalScale = new Vector2(1, 1);
              child.material.vertexColors = false;
              child.material.visible = true;
              child.material.alphaTest = 0;
            }
          });

          scene.add(avatar);

          const animations = object.animations;

          if (animations && animations.length > 0) {
            animations.forEach((animation, index) => {
              const listItem = document.createElement('div');
              listItem.textContent = animation.name;
              listItem.dataset.index = index;
              listItem.addEventListener('click', () => playAnimation(animation));
              animationItems.appendChild(listItem);
            });

            animationList.style.visibility = 'visible';
            playAnimation(animations[6]);
          }
        },
        (xhr) => {
          console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
        },
        (error) => {
          console.log(error);

          return callReload();
        });
    })
    .catch((error) => {
      console.error(error);
      console.log('Retrying...');

      return callReload();
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
mainElement.appendChild(stats.dom);
stats.dom.style.left = 'auto';
stats.dom.style.right = '0';

function animate() {
  requestAnimationFrame(animate);

  controls.update();

  mixer.update(0.01); // Update the animation mixer with a fixed time step

  if (avatar) {
    avatar.traverse((child) => {
      if (child.isMesh && child.material.opacity < 1) {
        child.material.opacity += 0.05;
      }
    });
  };

  render();

  stats.update();
}

function render() {
  renderer.render(scene, camera);
}

animate();