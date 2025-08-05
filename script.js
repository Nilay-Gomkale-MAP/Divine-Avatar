window.onload = () => {
  console.log("Window loaded. Checking GLTFLoader...");

  if (typeof GLTFLoader === 'undefined') {
    alert("❌ GLTFLoader is not defined. Check your script loading order.");
    return;
  }

  const loader = new GLTFLoader();
  console.log("✅ GLTFLoader is working:", loader);

  // Dummy scene just to confirm no crash
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
  const renderer = new THREE.WebGLRenderer({ alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);
  camera.position.z = 5;

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  animate();
};
