/* ===== Galaxy Background Script =====
   Yêu cầu: three.js (r128) load trước file này. Dùng div#bg có sẵn trong index.html.
   <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
   <link rel="stylesheet" href="galaxy.css">
   <div id="bg"></div>
   <div id="glowOverlay"></div>
   <script src="galaxy.js"></script>
*/

(function () {
  const mount = document.getElementById('bg');
  if (!mount || typeof THREE === 'undefined') return;

  // ===== Scene, Camera, Renderer =====
  const scene = new THREE.Scene();
  scene.fog = new THREE.FogExp2(0x05010a, 0.045);

  const camera = new THREE.PerspectiveCamera(
    60,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 3, 6);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);
  mount.appendChild(renderer.domElement);

  // ===== Soft glow sprite texture =====
  function makeGlowTexture() {
    const size = 128;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    const gradient = ctx.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, 'rgba(255,255,255,1)');
    gradient.addColorStop(0.2, 'rgba(255,255,255,0.9)');
    gradient.addColorStop(0.4, 'rgba(255,255,255,0.35)');
    gradient.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, size, size);
    return new THREE.CanvasTexture(canvas);
  }
  const glowTexture = makeGlowTexture();

  // ===== Galaxy Parameters =====
  const parameters = {
    count: 60000,
    size: 0.055,
    radius: 5.5,
    branches: 5,
    spin: 1.4,
    randomness: 0.55,
    randomnessPower: 3,
    insideColor: '#ffe9b0',   // rực sáng gần tâm
    midColor: '#ff7847',      // cam ấm giữa
    outsideColor: '#5c6bff'   // xanh tím ở rìa
  };

  const galaxyGeometry = new THREE.BufferGeometry();
  const positions = new Float32Array(parameters.count * 3);
  const colors = new Float32Array(parameters.count * 3);
  const sizes = new Float32Array(parameters.count);

  const colorInside = new THREE.Color(parameters.insideColor);
  const colorMid = new THREE.Color(parameters.midColor);
  const colorOutside = new THREE.Color(parameters.outsideColor);

  for (let i = 0; i < parameters.count; i++) {
    const i3 = i * 3;
    const radius = Math.pow(Math.random(), 0.7) * parameters.radius;
    const spinAngle = radius * parameters.spin;
    const branchAngle = ((i % parameters.branches) / parameters.branches) * Math.PI * 2;

    const randomX = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;
    const randomY = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius * 0.4;
    const randomZ = Math.pow(Math.random(), parameters.randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * parameters.randomness * radius;

    positions[i3] = Math.cos(branchAngle + spinAngle) * radius + randomX;
    positions[i3 + 1] = randomY;
    positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radius + randomZ;

    const t = radius / parameters.radius;
    const mixedColor = colorInside.clone();
    if (t < 0.5) {
      mixedColor.lerp(colorMid, t / 0.5);
    } else {
      mixedColor.copy(colorMid).lerp(colorOutside, (t - 0.5) / 0.5);
    }
    colors[i3] = mixedColor.r;
    colors[i3 + 1] = mixedColor.g;
    colors[i3 + 2] = mixedColor.b;

    sizes[i] = Math.random() < 0.03 ? Math.random() * 2.5 + 1.5 : Math.random() * 1.0 + 0.3;
  }

  galaxyGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  galaxyGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
  galaxyGeometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));

  const galaxyMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uSize: { value: parameters.size },
      uTexture: { value: glowTexture },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uSize;
      uniform float uPixelRatio;
      attribute float aSize;
      varying vec3 vColor;
      void main() {
        vColor = color;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        float twinkle = sin(uTime * 2.0 + position.x * 10.0 + position.z * 10.0) * 0.25 + 0.85;
        gl_PointSize = uSize * aSize * twinkle * uPixelRatio * (300.0 / -mvPosition.z);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying vec3 vColor;
      void main() {
        vec4 tex = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vec4(vColor, 1.0) * tex;
      }
    `,
    vertexColors: true,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const galaxyPoints = new THREE.Points(galaxyGeometry, galaxyMaterial);
  scene.add(galaxyPoints);

  // ===== Bright core glow at galaxy center =====
  const coreGeometry = new THREE.BufferGeometry();
  coreGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0, 0, 0]), 3));
  const coreMaterial = new THREE.PointsMaterial({
    size: 3.2,
    map: glowTexture,
    color: 0xfff2d0,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
  const core = new THREE.Points(coreGeometry, coreMaterial);
  scene.add(core);

  // ===== Twinkling background stars =====
  const starCount = 2200;
  const starPositions = new Float32Array(starCount * 3);
  const starSizes = new Float32Array(starCount);
  const starPhases = new Float32Array(starCount);

  for (let i = 0; i < starCount; i++) {
    const i3 = i * 3;
    const r = 25 + Math.random() * 45;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos((Math.random() * 2) - 1);
    starPositions[i3] = r * Math.sin(phi) * Math.cos(theta);
    starPositions[i3 + 1] = r * Math.cos(phi);
    starPositions[i3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    starSizes[i] = Math.random() * 1.5 + 0.3;
    starPhases[i] = Math.random() * Math.PI * 2;
  }

  const starGeometry = new THREE.BufferGeometry();
  starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
  starGeometry.setAttribute('aSize', new THREE.BufferAttribute(starSizes, 1));
  starGeometry.setAttribute('aPhase', new THREE.BufferAttribute(starPhases, 1));

  const starMaterial = new THREE.ShaderMaterial({
    uniforms: {
      uTime: { value: 0 },
      uTexture: { value: glowTexture },
      uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) }
    },
    vertexShader: `
      uniform float uTime;
      uniform float uPixelRatio;
      attribute float aSize;
      attribute float aPhase;
      varying float vTwinkle;
      void main() {
        vTwinkle = sin(uTime * 1.5 + aPhase) * 0.5 + 0.5;
        vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
        gl_PointSize = aSize * uPixelRatio * (300.0 / -mvPosition.z) * (0.5 + vTwinkle * 0.8);
        gl_Position = projectionMatrix * mvPosition;
      }
    `,
    fragmentShader: `
      uniform sampler2D uTexture;
      varying float vTwinkle;
      void main() {
        vec4 tex = texture2D(uTexture, gl_PointCoord);
        gl_FragColor = vec4(vec3(0.9, 0.95, 1.0), (0.4 + vTwinkle * 0.6)) * tex;
      }
    `,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });

  const stars = new THREE.Points(starGeometry, starMaterial);
  scene.add(stars);

  // ===== Mouse / touch parallax =====
  let mouseX = 0, mouseY = 0;
  window.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    mouseY = (e.clientY / window.innerHeight - 0.5) * 2;
  });
  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      mouseX = (e.touches[0].clientX / window.innerWidth - 0.5) * 2;
      mouseY = (e.touches[0].clientY / window.innerHeight - 0.5) * 2;
    }
  });

  // ===== Resize handling =====
  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    const pr = Math.min(window.devicePixelRatio, 2);
    renderer.setPixelRatio(pr);
    galaxyMaterial.uniforms.uPixelRatio.value = pr;
    starMaterial.uniforms.uPixelRatio.value = pr;
  });

  // ===== Animation loop =====
  const clock = new THREE.Clock();

  function tick() {
    const elapsedTime = clock.getElapsedTime();

    galaxyMaterial.uniforms.uTime.value = elapsedTime;
    starMaterial.uniforms.uTime.value = elapsedTime;

    galaxyPoints.rotation.y = elapsedTime * 0.06;
    stars.rotation.y = -elapsedTime * 0.015;

    camera.position.x += (Math.sin(elapsedTime * 0.04) * 6 + mouseX * 1.5 - camera.position.x) * 0.03;
    camera.position.z += (Math.cos(elapsedTime * 0.04) * 6 - mouseY * 1.0 - camera.position.z) * 0.03;
    camera.position.y += (2.2 + Math.sin(elapsedTime * 0.09) * 0.4 - mouseY * 0.6 - camera.position.y) * 0.03;
    camera.lookAt(0, 0, 0);

    renderer.render(scene, camera);
    requestAnimationFrame(tick);
  }

  tick();
})();
