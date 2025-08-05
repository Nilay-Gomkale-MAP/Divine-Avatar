Markerless AR WebXR Starter Template

To use this:
1. Place your optimized .glb model as 'model.glb' in this folder.
2. Host this folder on an HTTPS server (e.g., Netlify, GitHub Pages).
3. Open the page on a WebXR-compatible browser (e.g., Chrome on Android).
4. Move your device to detect planes, tap to place your model.

For animated models:
- Ensure the animation is baked and exported in the .glb.
- In script.js, after `gltf.scene`, access the animation and mixer like so:

    const mixer = new THREE.AnimationMixer(gltf.scene);
    gltf.animations.forEach((clip) => mixer.clipAction(clip).play());

- Then update the mixer in the animation loop:

    const clock = new THREE.Clock();
    function animate() {
        renderer.setAnimationLoop(() => {
            const delta = clock.getDelta();
            mixer.update(delta);
            renderer.render(scene, camera);
        });
    }