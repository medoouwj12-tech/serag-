/**
 * SERAG FRAGRANCES - Interactive 3D WebGL Perfume Bottle (Three.js)
 */

class Serag3DHero {
  constructor(containerId = 'hero-canvas-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.bottleGroup = null;
    this.liquidMesh = null;
    this.glassMesh = null;
    this.capMesh = null;
    this.collarMesh = null;
    this.labelMesh = null;
    this.particleSystem = null;
    this.particleCount = 350;

    // Mouse & Interaction state
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.currentRotationX = 0;
    this.currentRotationY = 0;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotateSpeed = 0.003;
    this.clock = new THREE.Clock();

    // Theme presets
    this.themes = {
      dokhoony: {
        liquidColor: 0xD4AF37,
        glassTint: 0xFFFFFF,
        capColor: 0xD4AF37,
        labelColor: 0x0A192F,
        lightColor: 0xFFF5DD,
        name: 'Dokhoony Crystal'
      },
      abraaq: {
        liquidColor: 0x004B87,
        glassTint: 0xE6F0FA,
        capColor: 0xC5A059,
        labelColor: 0x001B30,
        lightColor: 0xCCE4FF,
        name: 'Abraaq Royal Blue'
      },
      diamond: {
        liquidColor: 0xE2E8F0,
        glassTint: 0xFFFFFF,
        capColor: 0xF4E7C3,
        labelColor: 0x0A192F,
        lightColor: 0xFFFFFF,
        name: 'Diamond Edition'
      },
      tobacco: {
        liquidColor: 0x7F4F24,
        glassTint: 0xFFF8F0,
        capColor: 0x9A7B38,
        labelColor: 0x2A150A,
        lightColor: 0xFFE8D6,
        name: 'Tobacco Master'
      }
    };

    this.currentTheme = 'dokhoony';

    this.init();
  }

  init() {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 500;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.5, 7.5);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.15;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Bottle Object
    this.createPerfumeBottle();

    // 6. Particles
    this.createAromaticParticles();

    // 7. Event Listeners
    this.bindEvents();

    // 8. Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient Soft Warm Light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.85);
    this.scene.add(ambientLight);

    // Main Golden Key Light
    this.keyLight = new THREE.DirectionalLight(0xFFF2D1, 1.8);
    this.keyLight.position.set(4, 5, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    // Cool Rim Light
    this.rimLight = new THREE.DirectionalLight(0x7395AE, 1.2);
    this.rimLight.position.set(-4, 3, -3);
    this.scene.add(this.rimLight);

    // Bottom Specular Uplight
    this.upLight = new THREE.PointLight(0xD4AF37, 1.5, 10);
    this.upLight.position.set(0, -3, 2);
    this.scene.add(this.upLight);
  }

  createPerfumeBottle() {
    this.bottleGroup = new THREE.Group();
    this.bottleGroup.position.set(0, -0.2, 0);

    const theme = this.themes[this.currentTheme];

    // Glass Outer Body
    const glassGeo = new THREE.CylinderGeometry(1.15, 1.25, 2.7, 36, 1);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: theme.glassTint,
      metalness: 0.05,
      roughness: 0.08,
      transmission: 0.92,
      thickness: 1.2,
      ior: 1.52,
      transparent: true,
      opacity: 0.85,
      reflectivity: 0.9,
      clearcoat: 1.0,
      clearcoatRoughness: 0.05
    });
    this.glassMesh = new THREE.Mesh(glassGeo, glassMat);
    this.glassMesh.castShadow = true;
    this.bottleGroup.add(this.glassMesh);

    // Inner Liquid
    const liquidGeo = new THREE.CylinderGeometry(1.02, 1.12, 2.35, 32);
    this.liquidMat = new THREE.MeshPhysicalMaterial({
      color: theme.liquidColor,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.65,
      transparent: true,
      opacity: 0.92,
      clearcoat: 0.8
    });
    this.liquidMesh = new THREE.Mesh(liquidGeo, this.liquidMat);
    this.liquidMesh.position.set(0, -0.15, 0);
    this.bottleGroup.add(this.liquidMesh);

    // Bottle Neck / Shoulder
    const neckGeo = new THREE.CylinderGeometry(0.55, 1.05, 0.45, 32);
    const neckMesh = new THREE.Mesh(neckGeo, glassMat);
    neckMesh.position.set(0, 1.55, 0);
    this.bottleGroup.add(neckMesh);

    // Gold Metallic Collar
    const collarGeo = new THREE.CylinderGeometry(0.52, 0.52, 0.4, 32);
    this.collarMat = new THREE.MeshStandardMaterial({
      color: theme.capColor,
      metalness: 0.92,
      roughness: 0.18
    });
    this.collarMesh = new THREE.Mesh(collarGeo, this.collarMat);
    this.collarMesh.position.set(0, 1.85, 0);
    this.bottleGroup.add(this.collarMesh);

    // Gold / Crystal Cap
    const capGeo = new THREE.CylinderGeometry(0.7, 0.65, 0.95, 8);
    this.capMat = new THREE.MeshStandardMaterial({
      color: theme.capColor,
      metalness: 0.88,
      roughness: 0.22
    });
    this.capMesh = new THREE.Mesh(capGeo, this.capMat);
    this.capMesh.position.set(0, 2.45, 0);
    this.bottleGroup.add(this.capMesh);

    // Front Brand Label Plaque
    const labelGeo = new THREE.PlaneGeometry(1.3, 1.6);
    this.labelMat = new THREE.MeshStandardMaterial({
      color: theme.labelColor,
      metalness: 0.3,
      roughness: 0.4,
      side: THREE.DoubleSide
    });
    this.labelMesh = new THREE.Mesh(labelGeo, this.labelMat);
    this.labelMesh.position.set(0, -0.1, 1.28);
    this.bottleGroup.add(this.labelMesh);

    // Gold Border Trim on Label
    const borderGeo = new THREE.RingGeometry(0.5, 0.52, 4);
    const borderMat = new THREE.MeshBasicMaterial({ color: 0xD4AF37, side: THREE.DoubleSide });
    const borderMesh = new THREE.Mesh(borderGeo, borderMat);
    borderMesh.position.set(0, -0.1, 1.285);
    this.bottleGroup.add(borderMesh);

    this.scene.add(this.bottleGroup);
  }

  createAromaticParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const scales = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const radius = 2.0 + Math.random() * 3.5;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i3 + 1] = radius * Math.sin(phi) + 0.5;
      positions[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      scales[i] = Math.random() * 0.08 + 0.02;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xD4AF37,
      size: 0.09,
      transparent: true,
      opacity: 0.65,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.particleSystem);
  }

  setTheme(themeKey) {
    if (!this.themes[themeKey]) return;
    this.currentTheme = themeKey;
    const t = this.themes[themeKey];

    if (this.liquidMat) {
      this.liquidMat.color.setHex(t.liquidColor);
    }
    if (this.capMat) {
      this.capMat.color.setHex(t.capColor);
    }
    if (this.collarMat) {
      this.collarMat.color.setHex(t.capColor);
    }
    if (this.labelMat) {
      this.labelMat.color.setHex(t.labelColor);
    }
    if (this.keyLight) {
      this.keyLight.color.setHex(t.lightColor);
    }

    // Trigger subtle rotation burst
    this.targetRotationY += 0.8;
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    // Mouse Parallax & Dragging
    const el = this.renderer.domElement;

    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      const rect = this.container.getBoundingClientRect();
      const clientX = e.clientX - rect.left;
      const clientY = e.clientY - rect.top;

      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetRotationY += deltaX * 0.008;
        this.targetRotationX += deltaY * 0.008;

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        // Subtle Parallax
        const normX = (clientX / rect.width) * 2 - 1;
        const normY = -(clientY / rect.height) * 2 + 1;
        this.mouseX = normX;
        this.mouseY = normY;
      }
    });

    // Touch Support
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      this.isDragging = false;
    });

    window.addEventListener('touchmove', (e) => {
      if (this.isDragging && e.touches.length === 1) {
        const deltaX = e.touches[0].clientX - this.previousMousePosition.x;
        const deltaY = e.touches[0].clientY - this.previousMousePosition.y;

        this.targetRotationY += deltaX * 0.008;
        this.targetRotationX += deltaY * 0.008;

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 500;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth inertia interpolation (Lerp)
    if (!this.isDragging) {
      this.targetRotationY += this.autoRotateSpeed;
      this.targetRotationX = this.mouseY * 0.25;
    }

    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;

    if (this.bottleGroup) {
      this.bottleGroup.rotation.y = this.currentRotationY;
      this.bottleGroup.rotation.x = this.currentRotationX;
      // Gentle floating bob
      this.bottleGroup.position.y = -0.2 + Math.sin(elapsedTime * 1.5) * 0.08;
    }

    // Liquid slight wave slosh
    if (this.liquidMesh) {
      this.liquidMesh.rotation.z = Math.sin(elapsedTime * 2.0) * 0.03;
    }

    // Rotate Aromatic Particles
    if (this.particleSystem) {
      this.particleSystem.rotation.y = elapsedTime * 0.08;
      this.particleSystem.rotation.x = Math.sin(elapsedTime * 0.5) * 0.05;
    }

    this.renderer.render(this.scene, this.camera);
  }
}

// Auto instantiate on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('hero-canvas-container') && typeof THREE !== 'undefined') {
    window.seragHero3D = new Serag3DHero('hero-canvas-container');
  }
});
