/**
 * SERAG FRAGRANCES - Interactive 3D WebGL Perfume Showcase (Three.js)
 * Clean, High-Fidelity 360° 3D Model of 9 PM Night Out (AFNAN Extrait de Parfum)
 * Smooth Continuous Auto-Rotation + Interactive Mouse/Touch 360° Drag
 */

class Serag3DHero {
  constructor(containerId = 'hero-canvas-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.bottleGroup = null;
    this.bodyMesh = null;
    this.frontMesh = null;
    this.backMesh = null;
    this.neckMesh = null;
    this.capMesh = null;
    this.podiumMesh = null;
    this.particleSystem = null;
    this.particleCount = 180;

    this.textureLoader = new THREE.TextureLoader();
    this.graniteBumpMap = null;

    // Dedicated Product: 9 PM Night Out
    this.product = {
      id: 0,
      slug: '9pm-night-out',
      nameAr: '9 بي إم نايت أوت',
      nameEn: '9 PM Night Out',
      brand: 'AFNAN Extrait de Parfum',
      price: 1850,
      volume: '100ml / 3.4 fl oz',
      image: 'assets/images/9pm-front-clean.png',
      thumbImage: 'assets/images/9pm-bottle-full.png'
    };

    // Interaction & Animation state
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0.06;
    this.targetRotationY = 0;
    this.currentRotationX = 0.06;
    this.currentRotationY = 0;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = true;
    this.autoRotateSpeed = 0.008;
    this.cameraDistance = 7.0;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 520;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera - sized so the entire bottle, cap, and podium fit comfortably
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.25, this.cameraDistance);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.3;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Procedural Textures
    this.graniteBumpMap = this.createGraniteBumpTexture();

    // 5. Lighting Setup
    this.setupLighting();

    // 6. Build 3D 9 PM Night Out Bottle
    this.create9pmBottleModel();

    // 7. Floating Aromatic Golden Dust
    this.createAromaticParticles();

    // 8. Event Listeners (Smooth Drag for Mouse & Touch)
    this.bindEvents();

    // 9. Clean UI Overlay (Bottom card with order buttons only, no clutter)
    this.renderUIControls();

    // 10. Start Animation Loop
    this.animate();
  }

  createGraniteBumpTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 35000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 2.0 + 0.5;
      const brightness = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(2, 2);
    return texture;
  }

  createBackPanelTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    // 1. Dark weathered stone background
    ctx.fillStyle = '#181A1E';
    ctx.fillRect(0, 0, 1024, 1600);

    // Caviar speckled texture on back
    for (let i = 0; i < 60000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1600;
      const r = Math.random() * 2.2 + 0.5;
      const shade = Math.floor(Math.random() * 55 + 15);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer Weathered Stone Border
    ctx.lineWidth = 44;
    ctx.strokeStyle = '#525760';
    this.drawRoundedRect(ctx, 40, 40, 1024 - 80, 1600 - 80, 75);
    ctx.stroke();

    ctx.lineWidth = 14;
    ctx.strokeStyle = '#7D848F';
    this.drawRoundedRect(ctx, 62, 62, 1024 - 124, 1600 - 124, 60);
    ctx.stroke();

    // Luxury Monogram & Crest
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Crown Icon
    ctx.fillStyle = '#D6D9DE';
    ctx.font = 'bold 56px "Cinzel", "Times New Roman", serif';
    ctx.fillText('👑', 512, 300);

    // Monogram
    ctx.font = '900 84px "Cinzel", "Playfair Display", serif';
    ctx.fillStyle = '#EDEDF2';
    ctx.shadowColor = 'rgba(0,0,0,0.85)';
    ctx.shadowBlur = 14;
    ctx.fillText('AFNAN', 512, 410);

    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#A0A7B4';
    ctx.fillText('HAUTE PARFUMERIE', 512, 470);

    // Divider Line
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#636A76';
    ctx.beginPath();
    ctx.moveTo(240, 530);
    ctx.lineTo(784, 530);
    ctx.stroke();

    // Large 9 PM Night Out Serif Branding
    ctx.font = 'bold 165px "Cinzel", "Playfair Display", serif';
    ctx.fillStyle = '#F5F6F8';
    ctx.fillText('9 PM', 512, 700);

    ctx.font = '700 52px "Playfair Display", serif';
    ctx.fillStyle = '#D2D6DE';
    ctx.fillText('NIGHT OUT', 512, 815);

    // Details
    ctx.font = '700 34px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#B4BAC6';
    ctx.fillText('EXTRAIT DE PARFUM', 512, 930);

    ctx.font = '500 30px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#9097A4';
    ctx.fillText('e 100 ML • 3.4 FL. OZ.', 512, 995);
    ctx.fillText('NATURAL SPRAY • VAPORISATEUR', 512, 1045);

    // Batch & Origin Info Box
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#474C55';
    this.drawRoundedRect(ctx, 200, 1140, 624, 190, 24);
    ctx.stroke();

    ctx.font = 'bold 24px "Plus Jakarta Sans", monospace';
    ctx.fillStyle = '#828996';
    ctx.fillText('BATCH NO: AFN-2026-NIGHT', 512, 1200);
    ctx.fillText('MADE IN U.A.E. • SERAG ROYAL COLLECTION', 512, 1245);
    ctx.fillText('360° VERIFIED AUTHENTIC LUXURY', 512, 1285);

    const texture = new THREE.CanvasTexture(canvas);
    texture.colorSpace = THREE.SRGBColorSpace;
    return texture;
  }

  drawRoundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  setupLighting() {
    // 1. Ambient Warm Light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.25);
    this.scene.add(ambientLight);

    // 2. Main Key Light (Top-Right)
    this.keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.2);
    this.keyLight.position.set(4.5, 6.5, 4.5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // 3. Crisp Rim Light (Back-Left) for 360° stone edges and spherical cap
    this.rimLight = new THREE.DirectionalLight(0xA8C4DC, 1.8);
    this.rimLight.position.set(-4.5, 3.5, -4.5);
    this.scene.add(this.rimLight);

    // 4. Fill Light (Front-Left)
    this.fillLight = new THREE.DirectionalLight(0xFFFFFF, 1.1);
    this.fillLight.position.set(-3.5, 1.5, 4);
    this.scene.add(this.fillLight);

    // 5. Back Light for back panel illumination
    this.backLight = new THREE.DirectionalLight(0xFFFFFF, 1.5);
    this.backLight.position.set(0, 3, -5.5);
    this.scene.add(this.backLight);

    // 6. Soft Upward Light
    this.upLight = new THREE.PointLight(0x162C4E, 1.5, 8);
    this.upLight.position.set(0, -2.5, 2);
    this.scene.add(this.upLight);
  }

  create9pmBottleModel() {
    this.bottleGroup = new THREE.Group();
    this.bottleGroup.position.set(0, -0.15, 0);

    // ----------------------------------------------------
    // 1. Extruded Rounded Stone Body (Main Physical Solid)
    // ----------------------------------------------------
    const bottleW = 1.95;
    const bottleH = 3.0;
    const cornerR = 0.28;
    const halfW = bottleW / 2;
    const halfH = bottleH / 2;
    const depth = 0.82;

    const shape = new THREE.Shape();
    shape.moveTo(-halfW + cornerR, -halfH);
    shape.lineTo(halfW - cornerR, -halfH);
    shape.quadraticCurveTo(halfW, -halfH, halfW, -halfH + cornerR);
    shape.lineTo(halfW, halfH - cornerR);
    shape.quadraticCurveTo(halfW, halfH, halfW - cornerR, halfH);
    shape.lineTo(-halfW + cornerR, halfH);
    shape.quadraticCurveTo(-halfW, halfH, -halfW, halfH - cornerR);
    shape.lineTo(-halfW, -halfH + cornerR);
    shape.quadraticCurveTo(-halfW, -halfH, -halfW + cornerR, -halfH);

    const extrudeSettings = {
      depth: depth,
      bevelEnabled: true,
      bevelSegments: 5,
      steps: 1,
      bevelSize: 0.07,
      bevelThickness: 0.07
    };

    const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeo.center();

    this.bodyMat = new THREE.MeshStandardMaterial({
      color: 0x3E4148,
      roughness: 0.65,
      metalness: 0.2,
      bumpMap: this.graniteBumpMap,
      bumpScale: 0.05
    });

    this.bodyMesh = new THREE.Mesh(bodyGeo, this.bodyMat);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.bottleGroup.add(this.bodyMesh);

    // ----------------------------------------------------
    // 2. Front Face Inset (Real Cropped 9 PM Artwork)
    // ----------------------------------------------------
    const frontPlaneW = 1.84;
    const frontPlaneH = 2.88;
    const frontGeo = new THREE.PlaneGeometry(frontPlaneW, frontPlaneH);

    this.frontMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.35,
      metalness: 0.1,
      transparent: true,
      side: THREE.FrontSide
    });

    // Load clean cropped front texture
    this.textureLoader.load(
      this.product.image,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        this.frontMat.map = texture;
        this.frontMat.needsUpdate = true;
      },
      undefined,
      (err) => console.warn('Front texture load error', err)
    );

    this.frontMesh = new THREE.Mesh(frontGeo, this.frontMat);
    this.frontMesh.position.set(0, 0, (depth / 2) + 0.072);
    this.frontMesh.castShadow = true;
    this.bottleGroup.add(this.frontMesh);

    // ----------------------------------------------------
    // 3. Back Face Inset (High-Resolution 360° Back Label)
    // ----------------------------------------------------
    const backGeo = new THREE.PlaneGeometry(frontPlaneW, frontPlaneH);
    const backTexture = this.createBackPanelTexture();

    this.backMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      map: backTexture,
      roughness: 0.45,
      metalness: 0.15,
      side: THREE.FrontSide
    });

    this.backMesh = new THREE.Mesh(backGeo, this.backMat);
    this.backMesh.rotation.y = Math.PI; // Face backward
    this.backMesh.position.set(0, 0, -((depth / 2) + 0.072));
    this.backMesh.castShadow = true;
    this.bottleGroup.add(this.backMesh);

    // ----------------------------------------------------
    // 4. Atomizer Neck & Metallic Collar
    // ----------------------------------------------------
    const collarGeo = new THREE.CylinderGeometry(0.32, 0.36, 0.28, 32);
    this.collarMat = new THREE.MeshStandardMaterial({
      color: 0x22252C,
      metalness: 0.95,
      roughness: 0.18
    });
    this.collarMesh = new THREE.Mesh(collarGeo, this.collarMat);
    this.collarMesh.position.set(0, halfH + 0.2, 0);
    this.collarMesh.castShadow = true;
    this.bottleGroup.add(this.collarMesh);

    // Chrome Collar Ring
    const ringGeo = new THREE.TorusGeometry(0.33, 0.03, 16, 32);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xD8DCE2,
      metalness: 0.98,
      roughness: 0.1
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, halfH + 0.1, 0);
    this.bottleGroup.add(ringMesh);

    // ----------------------------------------------------
    // 5. Spherical Ball Cap (Exact 9 PM Night Out Ball Cap)
    // ----------------------------------------------------
    const capRadius = 0.58;
    const capGeo = new THREE.SphereGeometry(capRadius, 64, 64);
    this.capMat = new THREE.MeshStandardMaterial({
      color: 0x25282E,
      roughness: 0.72,
      metalness: 0.15,
      bumpMap: this.graniteBumpMap,
      bumpScale: 0.06
    });

    this.capMesh = new THREE.Mesh(capGeo, this.capMat);
    this.capMesh.position.set(0, halfH + 0.28 + capRadius - 0.06, 0);
    this.capMesh.castShadow = true;
    this.bottleGroup.add(this.capMesh);

    // ----------------------------------------------------
    // 6. Rotating Podium Pedestal & Base Shadow
    // ----------------------------------------------------
    const podiumGeo = new THREE.CylinderGeometry(2.1, 2.35, 0.22, 64);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      metalness: 0.88,
      roughness: 0.2
    });
    this.podiumMesh = new THREE.Mesh(podiumGeo, podiumMat);
    this.podiumMesh.position.set(0, -1.8, 0);
    this.podiumMesh.receiveShadow = true;

    // Outer Silver Accent Ring on Podium
    const podiumRingGeo = new THREE.TorusGeometry(2.15, 0.03, 16, 64);
    const podiumRingMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      metalness: 0.95,
      roughness: 0.15
    });
    const podiumRingMesh = new THREE.Mesh(podiumRingGeo, podiumRingMat);
    podiumRingMesh.rotation.x = Math.PI / 2;
    podiumRingMesh.position.set(0, -1.68, 0);
    this.podiumMesh.add(podiumRingMesh);

    this.scene.add(this.podiumMesh);
    this.scene.add(this.bottleGroup);
  }

  createAromaticParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const scales = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const radius = 2.0 + Math.random() * 2.8;
      const theta = Math.random() * Math.PI * 2;
      const phi = (Math.random() - 0.5) * Math.PI;

      positions[i3] = radius * Math.cos(theta) * Math.cos(phi);
      positions[i3 + 1] = radius * Math.sin(phi) + 0.4;
      positions[i3 + 2] = radius * Math.sin(theta) * Math.cos(phi);

      scales[i] = Math.random() * 0.07 + 0.02;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('scale', new THREE.BufferAttribute(scales, 1));

    const mat = new THREE.PointsMaterial({
      color: 0xE0E8F0,
      size: 0.065,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.particleSystem);
  }

  renderUIControls() {
    let controlsWrap = document.getElementById('hero-3d-controls');
    if (!controlsWrap) {
      controlsWrap = document.createElement('div');
      controlsWrap.id = 'hero-3d-controls';
      controlsWrap.className = 'absolute inset-3 z-20 flex flex-col justify-end pointer-events-none';
      this.container.parentElement.appendChild(controlsWrap);
    } else {
      controlsWrap.className = 'absolute inset-3 z-20 flex flex-col justify-end pointer-events-none';
    }

    // Clean bottom card with direct WhatsApp order and Add to Cart
    controlsWrap.innerHTML = `
      <div class="pointer-events-auto bg-slate-950/90 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-3 text-white">
        <div class="flex items-center gap-3 w-full sm:w-auto">
          <div class="w-12 h-12 rounded-xl overflow-hidden bg-slate-900 border border-white/20 p-1 shrink-0 flex items-center justify-center">
            <img src="${this.product.thumbImage}" alt="${this.product.nameEn}" class="max-h-full max-w-full object-contain" />
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 class="font-black text-sm sm:text-base text-white font-arabic">${this.product.nameAr}</h3>
              <span class="text-[10px] uppercase font-bold bg-white text-[#0A192F] px-2 py-0.5 rounded-full font-sans">Extrait</span>
            </div>
            <div class="text-[11px] text-slate-300 font-medium">
              ${this.product.brand} • ${this.product.volume}
            </div>
          </div>
        </div>

        <div class="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button onclick="window.seragHero3D.orderOnWhatsApp()" 
                  class="btn-whatsapp flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-lg hover:scale-105 transition cursor-pointer">
            <span>طلب عبر واتساب ⚡</span>
          </button>
          <button onclick="window.seragHero3D.addToCart()" 
                  class="btn-serag-secondary flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 transition cursor-pointer">
            <span>+ السلة</span>
          </button>
        </div>
      </div>
    `;
  }

  orderOnWhatsApp() {
    const text = encodeURIComponent(
      `مرحباً، أرغب في طلب عطر (9 PM Night Out - Extrait de Parfum 100ml) بسعر 1850 ج.م.`
    );
    window.open(`https://wa.me/201025996069?text=${text}`, '_blank');
  }

  addToCart() {
    if (window.seragCart) {
      window.seragCart.addItem({
        id: 0,
        slug: '9pm-night-out',
        nameAr: '9 بي إم نايت أوت',
        nameEn: '9 PM Night Out',
        price: 1850,
        image: 'assets/images/9pm-front-clean.png',
        volume: '100ml'
      });
    }
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    const el = this.renderer.domElement;

    // Mouse Drag Listeners
    el.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
      this.isDragging = false;
    });

    window.addEventListener('mousemove', (e) => {
      if (this.isDragging) {
        const deltaX = e.clientX - this.previousMousePosition.x;
        const deltaY = e.clientY - this.previousMousePosition.y;

        this.targetRotationY += deltaX * 0.009;
        this.targetRotationX += deltaY * 0.009;
        this.targetRotationX = Math.max(-0.6, Math.min(0.7, this.targetRotationX));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      }
    });

    // Touch Drag Listeners (Mobile & Tablet)
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

        this.targetRotationY += deltaX * 0.009;
        this.targetRotationX += deltaY * 0.009;
        this.targetRotationX = Math.max(-0.6, Math.min(0.7, this.targetRotationX));

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    }, { passive: true });
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 520;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Continuous smooth auto-rotation
    if (!this.isDragging) {
      this.targetRotationY += this.autoRotateSpeed;
    }

    // Smooth inertia interpolation
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.06;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.06;

    if (this.bottleGroup) {
      this.bottleGroup.rotation.y = this.currentRotationY;
      this.bottleGroup.rotation.x = this.currentRotationX;
      this.bottleGroup.position.y = -0.15 + Math.sin(elapsedTime * 1.5) * 0.06;
    }

    if (this.podiumMesh) {
      this.podiumMesh.rotation.y = elapsedTime * 0.03;
    }

    if (this.particleSystem) {
      this.particleSystem.rotation.y = elapsedTime * 0.05;
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
