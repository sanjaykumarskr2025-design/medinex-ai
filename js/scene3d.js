/**
 * VitaNex AI — Three.js 3D Medical Visualization Scene
 */

function init3DScene(containerId, isMini = false) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion || typeof THREE === 'undefined') {
    container.classList.add('fallback-2d');
    container.innerHTML = '<div class="css-health-orb"></div>';
    return;
  }

  let scene, camera, renderer, particles, dnaGroup;
  let width = container.clientWidth || 300;
  let height = container.clientHeight || 300;

  try {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, width / height, 0.1, 1000);
    camera.position.z = isMini ? 4 : 6;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // Create glowing health orb / DNA structure
    dnaGroup = new THREE.Group();
    scene.add(dnaGroup);

    const sphereGeometry = new THREE.SphereGeometry(isMini ? 1.2 : 1.8, 32, 32);
    const sphereMaterial = new THREE.MeshBasicMaterial({
      color: 0x00d4ff,
      wireframe: true,
      transparent: true,
      opacity: 0.25
    });
    const coreSphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    dnaGroup.add(coreSphere);

    // Inner glowing sphere
    const innerGeo = new THREE.SphereGeometry(isMini ? 0.9 : 1.3, 16, 16);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0x0088ff,
      transparent: true,
      opacity: 0.15
    });
    dnaGroup.add(new THREE.Mesh(innerGeo, innerMat));

    // Particle cloud
    const particleCount = isMini ? 100 : 300;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount * 3; i += 3) {
      positions[i] = (Math.random() - 0.5) * 8;
      positions[i + 1] = (Math.random() - 0.5) * 8;
      positions[i + 2] = (Math.random() - 0.5) * 8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const material = new THREE.PointsMaterial({
      color: 0x00d4ff,
      size: 0.06,
      transparent: true,
      opacity: 0.7
    });

    particles = new THREE.Points(geometry, material);
    scene.add(particles);

    // Animation loop
    let animationFrameId;
    function animate() {
      animationFrameId = requestAnimationFrame(animate);
      if (dnaGroup) {
        dnaGroup.rotation.y += 0.005;
        dnaGroup.rotation.x += 0.002;
      }
      if (particles) {
        particles.rotation.y -= 0.002;
      }
      renderer.render(scene, camera);
    }
    animate();

    // Resize handler
    function handleResize() {
      if (!container || !renderer || !camera) return;
      width = container.clientWidth || 300;
      height = container.clientHeight || 300;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height);
    }
    window.addEventListener('resize', handleResize);

    // Cleanup on unload
    window.addEventListener('beforeunload', () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      if (renderer && renderer.domElement) {
        renderer.dispose();
      }
    });

  } catch (e) {
    console.warn('WebGL initialization failed, falling back to 2D:', e);
    container.classList.add('fallback-2d');
    container.innerHTML = '<div class="css-health-orb"></div>';
  }
}

export { init3DScene };
