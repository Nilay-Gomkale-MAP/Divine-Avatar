import * as THREE from 'https://cdn.skypack.dev/three@0.152.2';
import { GLTFLoader } from 'https://cdn.skypack.dev/three/examples/jsm/loaders/GLTFLoader.js';

let camera, scene, renderer;
let controller, reticle, mixer, clock;
let model = null;
let isAnimating = false;
let currentAnimation = null;

init();
animate();

async function init() {
  // Renderer
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.xr.enabled = true;
  document.body.appendChild(renderer.domElement);

  // UI Button
  const btn = document.createElement('button');
  btn.textContent = 'Toggle Animation';
  btn.style.position = 'absolute';
  btn.style.bottom = '20px';
  btn.style.left = '50%';
  btn.style.transform = 'translateX(-50%)';
  btn.style.padding = '12px 24px';
  btn.style.fontSize = '16px';
  btn.style.zIndex = '1';
  btn.style.background = '#000';
  btn.style.color = '#fff';
  btn.style.border = 'none';
  btn.style.borderRadius = '5px';
  btn.onclick = () => {
    if (currentAnimation) {
      isAnimating = !isAnimating;
      if (isAnimating) {
        currentAnimation.play();
      } else {
        currentAnimation.stop();
      }
    }
  };
  document.body.appendChild(btn);

  // Scene & Camera
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera();

  const light = new THREE.HemisphereLight(0xffffff, 0xbbbbff, 1);
  scene.add(light);

  clock = new THREE.Clock();

  // Load model
  const loader = new GLTFLoader();
  loader.load('model.glb', function (gltf) {
    model = gltf.scene;
    model.scale.set(0.2, 0.2, 0.2);

    mixer = new THREE.AnimationMixer(model);
    if (gltf.animations.length > 0) {
      currentAnimation = mixer.clipAction(gltf.animations[0]);
    }
  });

  // Reticle
  const geometry = new THREE.RingGeometry(0.1, 0.15, 32).rotateX(-Math.PI / 2);
  const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
  reticle = new THREE.Mesh(geometry, material);
  reticle.visible = false;
    scene.add(reticle);

    if (!navigator.xr) {
        alert("WebXR not supported on this device/browser.");
    } else {
        navigator.xr.isSessionSupported('immersive-ar').then((supported) => {
            if (!supported) {
                alert("AR not supported on this device.");
            }
        });
    }

  const session = await navigator.xr.requestSession('immersive-ar', {
    requiredFeatures: ['hit-test', 'dom-overlay'],
    domOverlay: { root: document.body }
  });
  renderer.xr.setSession(session);

  const referenceSpace = await session.requestReferenceSpace('local');
  const viewerSpace = await session.requestReferenceSpace('viewer');
  const hitTestSource = await session.requestHitTestSource({ space: viewerSpace });

  controller = renderer.xr.getController(0);
  controller.addEventListener('select', () => {
    if (reticle.visible && model) {
      const placed = model.clone();
      placed.position.setFromMatrixPosition(reticle.matrix);
      placed.quaternion.setFromRotationMatrix(reticle.matrix);

      if (currentAnimation) {
        const placedMixer = new THREE.AnimationMixer(placed);
        const action = placedMixer.clipAction(currentAnimation.getClip());
        action.play();
        mixers.push(placedMixer);
      }

      scene.add(placed);
    }
  });
  scene.add(controller);

  // Store multiple mixers for each placed instance
  window.mixers = [];

  renderer.setAnimationLoop((timestamp, frame) => {
    if (frame) {
      const hitTestResults = frame.getHitTestResults(hitTestSource);
      if (hitTestResults.length > 0) {
        const hit = hitTestResults[0];
        const pose = hit.getPose(referenceSpace);
        reticle.visible = true;
        reticle.matrix.fromArray(pose.transform.matrix);
      } else {
        reticle.visible = false;
      }
    }
    const delta = clock.getDelta();
    if (mixer && isAnimating) mixer.update(delta);
    for (const m of window.mixers) m.update(delta);
    renderer.render(scene, camera);
  });
}

function animate() {
  renderer.setAnimationLoop(() => {
    renderer.render(scene, camera);
  });
}