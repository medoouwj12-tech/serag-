/**
 * SERAG FRAGRANCES - Interactive 3D WebGL Perfume Showcase (Three.js)
 * High-Fidelity 360° 3D Model of 9 PM Night Out (AFNAN Extrait de Parfum)
 * Featuring Real Textured Label, Extruded Beveled Stone Body, Spherical Ball Cap, and Full Multi-Angle Controls
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
    this.particleCount = 200;

    this.textureLoader = new THREE.TextureLoader();
    this.graniteBumpMap = null;

    // Dedicated Single Product: 9 PM Night Out
    this.product = {
      id: 0,
      slug: '9pm-night-out',
      nameAr: '9 بي إم نايت أوت',
      nameEn: '9 PM Night Out',
      brand: 'AFNAN Extrait de Parfum',
      categoryAr: 'العطور الملكية الخاصة',
      price: 1850,
      volume: '100ml / 3.4 fl oz',
      scentFamilyAr: 'توباكو وعنبر دافئ وفانيلا مدخنة',
      image: 'assets/images/9pm-night-out.webp'
    };

    // Interaction & Animation state
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0.05;
    this.targetRotationY = 0;
    this.currentRotationX = 0.05;
    this.currentRotationY = 0;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotate = true;
    this.autoRotateSpeed = 0.007;
    this.targetZoom = 7.5;
    this.currentZoom = 7.5;
    this.lastInteractionTime = Date.now();
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 420;
    const height = this.container.clientHeight || 540;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(38, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.5, this.currentZoom);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.35;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Generate Procedural Textures (Granite Bump + Back Face)
    this.graniteBumpMap = this.createGraniteBumpTexture();

    // 5. Lighting Setup
    this.setupLighting();

    // 6. Build 3D 9 PM Night Out Bottle
    this.create9pmBottleModel();

    // 7. Floating Aromatic Golden Dust
    this.createAromaticParticles();

    // 8. Event Listeners (360° Drag, Touch, Zoom, Resize)
    this.bindEvents();

    // 9. Inject Dedicated 360° UI Controls & Details Overlay
    this.renderUIControls();

    // 10. Load Real Artwork Texture
    this.loadFrontTexture();

    // 11. Start Animation Loop
    this.animate();
  }

  createGraniteBumpTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');

    // Base noise and speckles
    ctx.fillStyle = '#808080';
    ctx.fillRect(0, 0, 512, 512);

    for (let i = 0; i < 40000; i++) {
      const x = Math.random() * 512;
      const y = Math.random() * 512;
      const radius = Math.random() * 2.2 + 0.5;
      const brightness = Math.floor(Math.random() * 255);
      ctx.fillStyle = `rgb(${brightness}, ${brightness}, ${brightness})`;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(3, 3);
    return texture;
  }

  createBackPanelTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 1024;
    canvas.height = 1400;
    const ctx = canvas.getContext('2d');

    // 1. Dark weathered stone background
    ctx.fillStyle = '#1A1C20';
    ctx.fillRect(0, 0, 1024, 1400);

    // Caviar speckled texture on back
    for (let i = 0; i < 50000; i++) {
      const x = Math.random() * 1024;
      const y = Math.random() * 1400;
      const r = Math.random() * 2.5 + 0.5;
      const shade = Math.floor(Math.random() * 60 + 10);
      ctx.fillStyle = `rgb(${shade}, ${shade}, ${shade})`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }

    // Outer Weathered Stone Border
    ctx.lineWidth = 36;
    ctx.strokeStyle = '#5E636A';
    this.drawRoundedRect(ctx, 45, 45, 1024 - 90, 1400 - 90, 80);
    ctx.stroke();

    ctx.lineWidth = 12;
    ctx.strokeStyle = '#8B919A';
    this.drawRoundedRect(ctx, 60, 60, 1024 - 120, 1400 - 120, 65);
    ctx.stroke();

    // Luxury Monogram & Crest
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Crown / Crest Icon
    ctx.fillStyle = '#D6D9DE';
    ctx.font = 'bold 54px "Cinzel", "Times New Roman", serif';
    ctx.fillText('👑', 512, 280);

    // Monogram
    ctx.font = '900 80px "Cinzel", "Playfair Display", serif';
    ctx.fillStyle = '#ECEEF2';
    ctx.shadowColor = 'rgba(0,0,0,0.8)';
    ctx.shadowBlur = 12;
    ctx.fillText('AFNAN', 512, 380);

    ctx.font = '600 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#9FA5B0';
    ctx.fillText('HAUTE PARFUMERIE', 512, 435);

    // Divider Line
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#686E78';
    ctx.beginPath();
    ctx.moveTo(250, 490);
    ctx.lineTo(774, 490);
    ctx.stroke();

    // Large 9 PM Night Out Serif Branding
    ctx.font = 'bold 150px "Cinzel", "Playfair Display", serif';
    ctx.fillStyle = '#F5F6F8';
    ctx.fillText('9 PM', 512, 630);

    ctx.font = '600 48px "Playfair Display", serif';
    ctx.fillStyle = '#D0D4DC';
    ctx.fillText('NIGHT OUT', 512, 730);

    // Details
    ctx.font = '700 32px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#B0B6C0';
    ctx.fillText('EXTRAIT DE PARFUM', 512, 830);

    ctx.font = '500 28px "Plus Jakarta Sans", sans-serif';
    ctx.fillStyle = '#8E94A0';
    ctx.fillText('e 100 ML • 3.4 FL. OZ.', 512, 885);
    ctx.fillText('NATURAL SPRAY • VAPORISATEUR', 512, 930);

    // Batch & Origin Info Box
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#4A4F57';
    this.drawRoundedRect(ctx, 220, 1010, 584, 160, 20);
    ctx.stroke();

    ctx.font = 'bold 22px "Plus Jakarta Sans", monospace';
    ctx.fillStyle = '#7C828E';
    ctx.fillText('BATCH NO: AFN-2026-NIGHT', 512, 1060);
    ctx.fillText('MADE IN U.A.E. • SERAG ROYAL EDITION', 512, 1100);
    ctx.fillText('360° AUTHENTIC VERIFIED', 512, 1135);

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
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1.1);
    this.scene.add(ambientLight);

    // 2. Main Key Light (Top-Right)
    this.keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.2);
    this.keyLight.position.set(4.5, 7, 4.5);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 2048;
    this.keyLight.shadow.mapSize.height = 2048;
    this.keyLight.shadow.camera.near = 0.5;
    this.keyLight.shadow.camera.far = 25;
    this.keyLight.shadow.bias = -0.001;
    this.scene.add(this.keyLight);

    // 3. Crisp Rim Light (Back-Left) for sharp 360° stone edges and spherical cap
    this.rimLight = new THREE.DirectionalLight(0x9BB8D3, 1.8);
    this.rimLight.position.set(-5, 4, -4.5);
    this.scene.add(this.rimLight);

    // 4. Fill Light (Front-Left)
    this.fillLight = new THREE.DirectionalLight(0xE8F0FE, 1.2);
    this.fillLight.position.set(-3.5, 1, 4);
    this.scene.add(this.fillLight);

    // 5. Back Light for 360 view
    this.backLight = new THREE.DirectionalLight(0xFFFFFF, 1.4);
    this.backLight.position.set(0, 3, -6);
    this.scene.add(this.backLight);

    // 6. Upward Soft Glow
    this.upLight = new THREE.PointLight(0x162C4E, 1.8, 10);
    this.upLight.position.set(0, -2.5, 2);
    this.scene.add(this.upLight);
  }

  create9pmBottleModel() {
    this.bottleGroup = new THREE.Group();
    this.bottleGroup.position.set(0, -0.2, 0);

    // ----------------------------------------------------
    // 1. Extruded Rounded Stone Body (Main Physical Solid)
    // ----------------------------------------------------
    const bottleW = 2.15;
    const bottleH = 3.35;
    const cornerR = 0.32;
    const halfW = bottleW / 2;
    const halfH = bottleH / 2;

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
      depth: 0.85,
      bevelEnabled: true,
      bevelSegments: 6,
      steps: 1,
      bevelSize: 0.08,
      bevelThickness: 0.08
    };

    const bodyGeo = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    bodyGeo.center();

    // Weathered Granite / Mottled Stone Material
    this.bodyMat = new THREE.MeshStandardMaterial({
      color: 0x484B52,
      roughness: 0.65,
      metalness: 0.22,
      bumpMap: this.graniteBumpMap,
      bumpScale: 0.06
    });

    this.bodyMesh = new THREE.Mesh(bodyGeo, this.bodyMat);
    this.bodyMesh.castShadow = true;
    this.bodyMesh.receiveShadow = true;
    this.bottleGroup.add(this.bodyMesh);

    // ----------------------------------------------------
    // 2. Front Face Inset (Real 9 PM Night Out Artwork)
    // ----------------------------------------------------
    const frontW = 1.95;
    const frontH = 3.12;
    const frontR = 0.26;
    const fHW = frontW / 2;
    const fHH = frontH / 2;

    const frontShape = new THREE.Shape();
    frontShape.moveTo(-fHW + frontR, -fHH);
    frontShape.lineTo(fHW - frontR, -fHH);
    frontShape.quadraticCurveTo(fHW, -fHH, fHW, -fHH + frontR);
    frontShape.lineTo(fHW, fHH - frontR);
    frontShape.quadraticCurveTo(fHW, fHH, fHW - frontR, fHH);
    frontShape.lineTo(-fHW + frontR, fHH);
    frontShape.quadraticCurveTo(-fHW, fHH, -fHW, fHH - frontR);
    frontShape.lineTo(-fHW, -fHH + frontR);
    frontShape.quadraticCurveTo(-fHW, -fHH, -fHW + frontR, -fHH);

    const frontGeo = new THREE.ShapeGeometry(frontShape, 32);
    this.adjustUVsForShape(frontGeo, frontW, frontH);

    this.frontMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.35,
      metalness: 0.12,
      bumpMap: this.graniteBumpMap,
      bumpScale: 0.02,
      side: THREE.FrontSide
    });

    this.frontMesh = new THREE.Mesh(frontGeo, this.frontMat);
    this.frontMesh.position.set(0, 0, (0.85 / 2) + 0.082);
    this.frontMesh.castShadow = true;
    this.bottleGroup.add(this.frontMesh);

    // ----------------------------------------------------
    // 3. Back Face Inset (High-Resolution 360° Back Label)
    // ----------------------------------------------------
    const backGeo = new THREE.ShapeGeometry(frontShape, 32);
    this.adjustUVsForShape(backGeo, frontW, frontH);

    const backTexture = this.createBackPanelTexture();
    this.backMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      map: backTexture,
      roughness: 0.45,
      metalness: 0.18,
      bumpMap: this.graniteBumpMap,
      bumpScale: 0.025,
      side: THREE.FrontSide
    });

    this.backMesh = new THREE.Mesh(backGeo, this.backMat);
    this.backMesh.rotation.y = Math.PI; // Face backwards
    this.backMesh.position.set(0, 0, -((0.85 / 2) + 0.082));
    this.backMesh.castShadow = true;
    this.bottleGroup.add(this.backMesh);

    // ----------------------------------------------------
    // 4. Atomizer Neck & Metallic Collar
    // ----------------------------------------------------
    const collarGeo = new THREE.CylinderGeometry(0.36, 0.40, 0.32, 36);
    this.collarMat = new THREE.MeshStandardMaterial({
      color: 0x2A2E35,
      metalness: 0.95,
      roughness: 0.18
    });
    this.collarMesh = new THREE.Mesh(collarGeo, this.collarMat);
    this.collarMesh.position.set(0, halfH + 0.22, 0);
    this.collarMesh.castShadow = true;
    this.bottleGroup.add(this.collarMesh);

    // Silver Sprayer Ring Under Cap
    const ringGeo = new THREE.TorusGeometry(0.37, 0.035, 16, 36);
    const ringMat = new THREE.MeshStandardMaterial({
      color: 0xD6DAE0,
      metalness: 0.98,
      roughness: 0.1
    });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, halfH + 0.12, 0);
    this.bottleGroup.add(ringMesh);

    // ----------------------------------------------------
    // 5. Spherical Ball Cap (Exact 9 PM Night Out Cap)
    // ----------------------------------------------------
    const capRadius = 0.65;
    const capGeo = new THREE.SphereGeometry(capRadius, 64, 64);
    this.capMat = new THREE.MeshStandardMaterial({
      color: 0x282B30,
      roughness: 0.72,
      metalness: 0.15,
      bumpMap: this.graniteBumpMap,
      bumpScale: 0.07
    });

    this.capMesh = new THREE.Mesh(capGeo, this.capMat);
    this.capMesh.position.set(0, halfH + 0.32 + capRadius - 0.08, 0);
    this.capMesh.castShadow = true;
    this.bottleGroup.add(this.capMesh);

    // ----------------------------------------------------
    // 6. Rotating Podium Pedestal & Base Shadow
    // ----------------------------------------------------
    const podiumGeo = new THREE.CylinderGeometry(2.3, 2.55, 0.28, 64);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      metalness: 0.88,
      roughness: 0.2
    });
    this.podiumMesh = new THREE.Mesh(podiumGeo, podiumMat);
    this.podiumMesh.position.set(0, -1.95, 0);
    this.podiumMesh.receiveShadow = true;

    // Outer Silver Accent Ring
    const podiumRingGeo = new THREE.TorusGeometry(2.35, 0.035, 16, 64);
    const podiumRingMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      metalness: 0.95,
      roughness: 0.15
    });
    const podiumRingMesh = new THREE.Mesh(podiumRingGeo, podiumRingMat);
    podiumRingMesh.rotation.x = Math.PI / 2;
    podiumRingMesh.position.set(0, -1.82, 0);
    this.podiumMesh.add(podiumRingMesh);

    this.scene.add(this.podiumMesh);
    this.scene.add(this.bottleGroup);
  }

  adjustUVsForShape(geometry, width, height) {
    const pos = geometry.attributes.position;
    const uvs = [];
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const y = pos.getY(i);
      const u = (x / width) + 0.5;
      const v = (y / height) + 0.5;
      uvs.push(u, v);
    }
    geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  }

  createAromaticParticles() {
    const geo = new THREE.BufferGeometry();
    const positions = new Float32Array(this.particleCount * 3);
    const scales = new Float32Array(this.particleCount);

    for (let i = 0; i < this.particleCount; i++) {
      const i3 = i * 3;
      const radius = 2.2 + Math.random() * 3.2;
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
      color: 0xD8E2EC,
      size: 0.07,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.particleSystem);
  }

  loadFrontTexture() {
    this.textureLoader.load(
      this.product.image,
      (texture) => {
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        texture.anisotropy = this.renderer.capabilities.getMaxAnisotropy();
        if (this.frontMat) {
          this.frontMat.map = texture;
          this.frontMat.needsUpdate = true;
        }
      },
      undefined,
      (err) => {
        console.warn('Could not load front texture from image, fallback to procedural front', err);
      }
    );
  }

  setAngle(view) {
    this.autoRotate = false;
    this.lastInteractionTime = Date.now();

    if (view === 'front') {
      this.targetRotationY = 0;
      this.targetRotationX = 0.05;
    } else if (view === 'side') {
      this.targetRotationY = Math.PI / 2;
      this.targetRotationX = 0;
    } else if (view === 'back') {
      this.targetRotationY = Math.PI;
      this.targetRotationX = 0.05;
    } else if (view === 'top') {
      this.targetRotationY = 0.2;
      this.targetRotationX = 0.65;
    } else if (view === 'angle45') {
      this.targetRotationY = 0.78;
      this.targetRotationX = 0.15;
    }
  }

  toggleAutoRotate() {
    this.autoRotate = !this.autoRotate;
    const btn = document.getElementById('hero-3d-autorotate-btn');
    if (btn) {
      btn.classList.toggle('bg-white', this.autoRotate);
      btn.classList.toggle('text-[#0A192F]', this.autoRotate);
      btn.classList.toggle('text-white', !this.autoRotate);
    }
  }

  zoomCamera(delta) {
    this.targetZoom = Math.max(5.5, Math.min(10.0, this.targetZoom + delta));
  }

  renderUIControls() {
    let controlsWrap = document.getElementById('hero-3d-controls');
    if (!controlsWrap) {
      controlsWrap = document.createElement('div');
      controlsWrap.id = 'hero-3d-controls';
      controlsWrap.className = 'absolute inset-3 z-20 flex flex-col justify-between pointer-events-none';
      this.container.parentElement.appendChild(controlsWrap);
    }

    // Top Header & Multi-Angle Quick Switchers
    const topBarHTML = `
      <div class="flex flex-col gap-2 pointer-events-auto">
        
        <!-- Top Badge & 360 Indicator -->
        <div class="flex items-center justify-between gap-2">
          <div class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-950/85 backdrop-blur-md rounded-xl border border-white/20 text-white text-xs font-bold shadow-lg">
            <span class="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>3D 360° تفاعلي بالكامل</span>
          </div>

          <div class="flex items-center gap-1.5 bg-slate-950/85 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-lg text-white">
            <button onclick="window.seragHero3D.zoomCamera(-0.8)" class="px-2 py-1 hover:bg-white/20 rounded-lg text-xs font-bold transition" title="تكبير">+</button>
            <button onclick="window.seragHero3D.zoomCamera(0.8)" class="px-2 py-1 hover:bg-white/20 rounded-lg text-xs font-bold transition" title="تصغير">-</button>
            <button id="hero-3d-autorotate-btn" onclick="window.seragHero3D.toggleAutoRotate()" class="px-2.5 py-1 bg-white text-[#0A192F] rounded-lg text-xs font-bold transition flex items-center gap-1" title="تشغيل/إيقاف التدوير التلقائي">
              <span>🔄</span>
              <span class="hidden sm:inline">تدوير</span>
            </button>
          </div>
        </div>

        <!-- 360° Quick Angle Buttons -->
        <div class="flex items-center justify-center gap-1.5 overflow-x-auto py-1.5 px-2 bg-slate-950/85 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
          <span class="text-[11px] text-slate-300 font-bold px-1.5 hidden sm:inline">الزوايا:</span>
          <button onclick="window.seragHero3D.setAngle('front')" class="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition">
            👁️ أمامية
          </button>
          <button onclick="window.seragHero3D.setAngle('angle45')" class="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition">
            📐 زاوية ٤٥°
          </button>
          <button onclick="window.seragHero3D.setAngle('side')" class="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition">
            ↔️ جانبية
          </button>
          <button onclick="window.seragHero3D.setAngle('back')" class="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition">
            🔄 خلفية
          </button>
          <button onclick="window.seragHero3D.setAngle('top')" class="px-2.5 py-1 rounded-xl text-xs font-bold text-slate-200 hover:text-white hover:bg-slate-800 transition">
            🔝 علوية
          </button>
        </div>

      </div>
    `;

    // Bottom Luxury Info Card
    const bottomCardHTML = `
      <div class="pointer-events-auto mt-auto flex flex-col gap-2">
        
        <!-- Drag & Rotate Instruction Tooltip -->
        <div class="text-center">
          <span class="inline-block bg-slate-950/75 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] text-slate-300 font-semibold border border-white/10 shadow-md">
            💡 اسحب بالماوس أو اللمس لتدوير الزجاجة ٣٦٠° من كافة الزوايا
          </span>
        </div>

        <!-- Product Details Card -->
        <div class="bg-slate-950/95 backdrop-blur-md p-4 rounded-2xl border border-white/20 shadow-2xl flex flex-col sm:flex-row items-center justify-between gap-4 text-white">
          
          <div class="flex items-center gap-3.5 w-full sm:w-auto">
            <div class="w-13 h-13 rounded-xl overflow-hidden bg-slate-900 border border-white/20 p-1 shrink-0">
              <img src="${this.product.image}" alt="${this.product.nameEn}" class="w-full h-full object-contain" />
            </div>
            <div>
              <div class="flex items-center gap-2">
                <h3 class="font-black text-base text-white font-arabic tracking-wide">${this.product.nameAr}</h3>
                <span class="text-[10px] uppercase font-bold bg-white text-[#0A192F] px-2 py-0.5 rounded-full font-sans">Extrait</span>
              </div>
              <div class="text-xs text-slate-300 font-medium mt-0.5">
                ${this.product.brand} • ${this.product.volume}
              </div>
              <div class="text-[11px] text-slate-400 mt-0.5">
                ${this.product.scentFamilyAr}
              </div>
            </div>
          </div>

          <div class="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button onclick="window.seragHero3D.orderOnWhatsApp()" 
                    class="btn-whatsapp flex-1 sm:flex-initial px-4 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-lg hover:scale-105 transition cursor-pointer">
              <span>طلب عبر واتساب ⚡</span>
            </button>
            <button onclick="window.seragHero3D.addToCart()" 
                    class="btn-serag-secondary flex-1 sm:flex-initial px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:scale-105 transition cursor-pointer">
              <span>+ السلة</span>
            </button>
          </div>

        </div>

      </div>
    `;

    controlsWrap.innerHTML = topBarHTML + bottomCardHTML;
  }

  orderOnWhatsApp() {
    const text = encodeURIComponent(
      `مرحباً سراج للعطور، أرغب في طلب عطر (9 PM Night Out - Extrait de Parfum 100ml) بسعر 1850 ج.م.`
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
        image: 'assets/images/9pm-night-out.webp',
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
      this.autoRotate = false;
      this.lastInteractionTime = Date.now();
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

        // Clamp vertical tilt to prevent unnatural flipping
        this.targetRotationX = Math.max(-0.6, Math.min(0.8, this.targetRotationX));

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
        this.lastInteractionTime = Date.now();
      } else {
        const rect = this.container.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        this.mouseX = (clientX / rect.width) * 2 - 1;
        this.mouseY = -(clientY / rect.height) * 2 + 1;
      }
    });

    // Touch Drag Listeners
    el.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        this.isDragging = true;
        this.autoRotate = false;
        this.lastInteractionTime = Date.now();
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
        this.targetRotationX = Math.max(-0.6, Math.min(0.8, this.targetRotationX));

        this.previousMousePosition = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        this.lastInteractionTime = Date.now();
      }
    }, { passive: true });

    // Mouse Wheel Zoom
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      this.zoomCamera(e.deltaY * 0.003);
    }, { passive: false });
  }

  onWindowResize() {
    if (!this.container || !this.renderer || !this.camera) return;
    const width = this.container.clientWidth;
    const height = this.container.clientHeight || 540;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    // Smooth Auto-Rotate when idle
    if (!this.isDragging) {
      if (this.autoRotate) {
        this.targetRotationY += this.autoRotateSpeed;
      } else if (Date.now() - this.lastInteractionTime > 6000) {
        // Resume gentle auto-rotate after 6 seconds of idle
        this.autoRotate = true;
      }
    }

    // Smooth Inertia Interpolation
    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.065;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.065;
    this.currentZoom += (this.targetZoom - this.currentZoom) * 0.08;
    this.camera.position.z = this.currentZoom;

    // Apply Rotation & Floating Levitation to Bottle
    if (this.bottleGroup) {
      this.bottleGroup.rotation.y = this.currentRotationY;
      this.bottleGroup.rotation.x = this.currentRotationX;
      this.bottleGroup.position.y = -0.2 + Math.sin(elapsedTime * 1.6) * 0.07;
    }

    // Slow base rotation
    if (this.podiumMesh) {
      this.podiumMesh.rotation.y = elapsedTime * 0.035;
    }

    // Ambient floating dust particles
    if (this.particleSystem) {
      this.particleSystem.rotation.y = elapsedTime * 0.06;
      this.particleSystem.rotation.x = Math.sin(elapsedTime * 0.4) * 0.04;
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
