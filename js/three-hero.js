/**
 * SERAG FRAGRANCES - Interactive 3D WebGL Perfume Showcase (Three.js)
 * Real Product Image Texture Mapping, Interactive 360° Drag & Showcase Controller
 */

class Serag3DHero {
  constructor(containerId = 'hero-canvas-container') {
    this.container = document.getElementById(containerId);
    if (!this.container) return;

    this.scene = null;
    this.camera = null;
    this.renderer = null;
    this.bottleGroup = null;
    this.glassMesh = null;
    this.liquidMesh = null;
    this.capMesh = null;
    this.collarMesh = null;
    this.frontTextureMesh = null;
    this.podiumMesh = null;
    this.particleSystem = null;
    this.particleCount = 250;

    this.textureLoader = new THREE.TextureLoader();
    this.loadedTextures = {};

    // Showcase Products from real uploaded images
    this.showcaseProducts = [
      {
        id: 2,
        slug: 'crown-black',
        nameAr: 'كراون بلاك',
        nameEn: 'Crown Black',
        categoryAr: 'قسم دخوني (١,٧٠٠ ج.م)',
        price: 1700,
        image: 'assets/images/crown-black.jpg',
        liquidColor: 0x111625,
        capColor: 0x0A192F,
        glassTint: 0xFFFFFF,
        lightColor: 0xFFFFFF
      },
      {
        id: 1,
        slug: 'shiny',
        nameAr: 'شايني',
        nameEn: 'Shiny',
        categoryAr: 'قسم دخوني (١,٧٠٠ ج.م)',
        price: 1700,
        image: 'assets/images/shiny.jpg',
        liquidColor: 0xDF8C96,
        capColor: 0x0A192F,
        glassTint: 0xFFFAF0,
        lightColor: 0xFFFFFF
      },
      {
        id: 28,
        slug: 'emerald-soul',
        nameAr: 'ايمرلد سول',
        nameEn: 'Emerald Soul',
        categoryAr: 'قسم أبرق (١,٨٥٠ ج.م)',
        price: 1850,
        image: 'assets/images/emerald-soul.jpeg',
        liquidColor: 0x0F5257,
        capColor: 0x0A192F,
        glassTint: 0xEEF8F6,
        lightColor: 0xFFFFFF
      },
      {
        id: 37,
        slug: 'french-tobacco',
        nameAr: 'فرينش توباكو',
        nameEn: 'French Tobacco',
        categoryAr: 'قسم أبرق (١,٨٥٠ ج.م)',
        price: 1850,
        image: 'assets/images/french-tobacco.jpg',
        liquidColor: 0x6E3B1B,
        capColor: 0x0A192F,
        glassTint: 0xFFF5EC,
        lightColor: 0xFFFFFF
      },
      {
        id: 44,
        slug: 'diamond-collection',
        nameAr: 'دايموند كوليكشن',
        nameEn: 'Diamond Collection',
        categoryAr: 'البوكسات الملكية (٢,٦٠٠ ج.م)',
        price: 2600,
        image: 'assets/images/diamond-collection-blue-red-white.jpg',
        liquidColor: 0x0A192F,
        capColor: 0xFFFFFF,
        glassTint: 0xFFFFFF,
        lightColor: 0xFFFFFF
      },
      {
        id: 31,
        slug: 'blue-diamond-aqua',
        nameAr: 'بلو دايموند اكوا',
        nameEn: 'Blue Diamond Aqua',
        categoryAr: 'قسم أبرق (١,٨٥٠ ج.م)',
        price: 1850,
        image: 'assets/images/blue-diamond-aqua.jpg',
        liquidColor: 0x0B4F6C,
        capColor: 0x0A192F,
        glassTint: 0xE6F4F8,
        lightColor: 0xFFFFFF
      }
    ];

    this.currentIndex = 0;

    // Interaction & Animation state
    this.mouseX = 0;
    this.mouseY = 0;
    this.targetRotationX = 0;
    this.targetRotationY = 0;
    this.currentRotationX = 0;
    this.currentRotationY = 0;
    this.isDragging = false;
    this.previousMousePosition = { x: 0, y: 0 };
    this.autoRotateSpeed = 0.005;
    this.clock = new THREE.Clock();

    this.init();
  }

  init() {
    const width = this.container.clientWidth || 400;
    const height = this.container.clientHeight || 520;

    // 1. Scene
    this.scene = new THREE.Scene();

    // 2. Camera
    this.camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
    this.camera.position.set(0, 0.6, 7.8);

    // 3. Renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.2;
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.container.innerHTML = '';
    this.container.appendChild(this.renderer.domElement);

    // 4. Lighting
    this.setupLighting();

    // 5. Build 3D Perfume Bottle Model with Real Texture
    this.createShowcaseModel();

    // 6. Floating Aromatic Golden Dust
    this.createAromaticParticles();

    // 7. Event Listeners (Drag, Touch, Resize)
    this.bindEvents();

    // 8. Inject UI Switcher & Details Overlay
    this.renderUIControls();

    // 9. Load Initial Product Texture
    this.loadProduct(0);

    // 10. Start Animation Loop
    this.animate();
  }

  setupLighting() {
    // Ambient Soft Warm Light
    const ambientLight = new THREE.AmbientLight(0xFFFFFF, 0.95);
    this.scene.add(ambientLight);

    // Main Golden Key Light
    this.keyLight = new THREE.DirectionalLight(0xFFFFFF, 2.0);
    this.keyLight.position.set(4, 6, 4);
    this.keyLight.castShadow = true;
    this.keyLight.shadow.mapSize.width = 1024;
    this.keyLight.shadow.mapSize.height = 1024;
    this.scene.add(this.keyLight);

    // Cool Rim Light
    this.rimLight = new THREE.DirectionalLight(0x88A0B8, 1.4);
    this.rimLight.position.set(-4, 3, -3);
    this.scene.add(this.rimLight);

    // Gold Uplight
    this.upLight = new THREE.PointLight(0x0A192F, 2.0, 12);
    this.upLight.position.set(0, -2.5, 2.5);
    this.scene.add(this.upLight);
  }

  createShowcaseModel() {
    this.bottleGroup = new THREE.Group();
    this.bottleGroup.position.set(0, -0.15, 0);

    // 1. Crystal Glass Body (Rounded luxury cuboid)
    const glassGeo = new THREE.BoxGeometry(2.1, 2.7, 0.95);
    const glassMat = new THREE.MeshPhysicalMaterial({
      color: 0xFFFFFF,
      metalness: 0.05,
      roughness: 0.05,
      transmission: 0.92,
      thickness: 1.1,
      ior: 1.52,
      transparent: true,
      opacity: 0.82,
      reflectivity: 0.95,
      clearcoat: 1.0,
      clearcoatRoughness: 0.03
    });
    this.glassMesh = new THREE.Mesh(glassGeo, glassMat);
    this.glassMesh.castShadow = true;
    this.bottleGroup.add(this.glassMesh);

    // 2. Inner Liquid Mesh
    const liquidGeo = new THREE.BoxGeometry(1.9, 2.45, 0.8);
    this.liquidMat = new THREE.MeshPhysicalMaterial({
      color: 0x111625,
      metalness: 0.1,
      roughness: 0.15,
      transmission: 0.7,
      transparent: true,
      opacity: 0.9,
      clearcoat: 0.8
    });
    this.liquidMesh = new THREE.Mesh(liquidGeo, this.liquidMat);
    this.liquidMesh.position.set(0, -0.05, 0);
    this.bottleGroup.add(this.liquidMesh);

    // 3. Real Product Art Display Plaque (Front Panel)
    const frontGeo = new THREE.PlaneGeometry(1.85, 2.45);
    this.frontTextureMat = new THREE.MeshStandardMaterial({
      color: 0xFFFFFF,
      roughness: 0.25,
      metalness: 0.1,
      side: THREE.FrontSide
    });
    this.frontTextureMesh = new THREE.Mesh(frontGeo, this.frontTextureMat);
    this.frontTextureMesh.position.set(0, -0.05, 0.485);
    this.bottleGroup.add(this.frontTextureMesh);

    // 4. Back Panel with SERAG Seal
    const backGeo = new THREE.PlaneGeometry(1.85, 2.45);
    this.backTextureMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      roughness: 0.3,
      metalness: 0.6,
      side: THREE.BackSide
    });
    this.backTextureMesh = new THREE.Mesh(backGeo, this.backTextureMat);
    this.backTextureMesh.position.set(0, -0.05, -0.485);
    this.bottleGroup.add(this.backTextureMesh);

    // 5. Gold Metallic Frame Trim
    const frameGeo = new THREE.BoxGeometry(2.14, 2.74, 0.97);
    const frameMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      metalness: 0.92,
      roughness: 0.2,
      wireframe: true
    });
    const frameMesh = new THREE.Mesh(frameGeo, frameMat);
    this.bottleGroup.add(frameMesh);

    // 6. Bottle Neck / Shoulder
    const neckGeo = new THREE.CylinderGeometry(0.48, 0.75, 0.45, 32);
    const neckMesh = new THREE.Mesh(neckGeo, glassMat);
    neckMesh.position.set(0, 1.55, 0);
    this.bottleGroup.add(neckMesh);

    // 7. Gold Metallic Collar
    const collarGeo = new THREE.CylinderGeometry(0.46, 0.46, 0.35, 32);
    this.collarMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      metalness: 0.95,
      roughness: 0.15
    });
    this.collarMesh = new THREE.Mesh(collarGeo, this.collarMat);
    this.collarMesh.position.set(0, 1.82, 0);
    this.bottleGroup.add(this.collarMesh);

    // 8. Regal Crown / Crystal Cap
    const capGeo = new THREE.CylinderGeometry(0.68, 0.58, 0.9, 8);
    this.capMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      metalness: 0.9,
      roughness: 0.2
    });
    this.capMesh = new THREE.Mesh(capGeo, this.capMat);
    this.capMesh.position.set(0, 2.4, 0);
    this.bottleGroup.add(this.capMesh);

    // 9. Luxury Rotating Podium / Base
    const podiumGeo = new THREE.CylinderGeometry(2.3, 2.5, 0.25, 48);
    const podiumMat = new THREE.MeshStandardMaterial({
      color: 0x0A192F,
      metalness: 0.85,
      roughness: 0.25
    });
    this.podiumMesh = new THREE.Mesh(podiumGeo, podiumMat);
    this.podiumMesh.position.set(0, -1.65, 0);
    this.podiumMesh.receiveShadow = true;

    // Podium Gold Ring Rim
    const ringGeo = new THREE.TorusGeometry(2.32, 0.04, 16, 64);
    const ringMat = new THREE.MeshStandardMaterial({ color: 0x0A192F, metalness: 0.95, roughness: 0.1 });
    const ringMesh = new THREE.Mesh(ringGeo, ringMat);
    ringMesh.rotation.x = Math.PI / 2;
    ringMesh.position.set(0, -1.52, 0);
    this.podiumMesh.add(ringMesh);

    this.scene.add(this.podiumMesh);
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
      color: 0xFFFFFF,
      size: 0.08,
      transparent: true,
      opacity: 0.75,
      blending: THREE.AdditiveBlending
    });

    this.particleSystem = new THREE.Points(geo, mat);
    this.scene.add(this.particleSystem);
  }

  loadProduct(index) {
    if (index < 0 || index >= this.showcaseProducts.length) return;
    this.currentIndex = index;
    const prod = this.showcaseProducts[index];

    // 1. Load Texture
    if (!this.loadedTextures[prod.image]) {
      this.textureLoader.load(
        prod.image,
        (texture) => {
          texture.colorSpace = THREE.SRGBColorSpace;
          texture.wrapS = THREE.ClampToEdgeWrapping;
          texture.wrapT = THREE.ClampToEdgeWrapping;
          this.loadedTextures[prod.image] = texture;
          this.applyProductTexture(prod, texture);
        },
        undefined,
        (err) => {
          console.warn('Could not load 3D image texture, using material color fallback', err);
          this.applyProductTexture(prod, null);
        }
      );
    } else {
      this.applyProductTexture(prod, this.loadedTextures[prod.image]);
    }

    // 2. Update Overlay Info
    this.updateProductInfoOverlay(prod);

    // 3. Trigger 3D Spin Burst
    this.targetRotationY += 1.2;
  }

  applyProductTexture(prod, texture) {
    if (this.frontTextureMat) {
      this.frontTextureMat.map = texture;
      this.frontTextureMat.needsUpdate = true;
    }
    if (this.liquidMat) {
      this.liquidMat.color.setHex(prod.liquidColor);
    }
    if (this.capMat) {
      this.capMat.color.setHex(prod.capColor);
    }
    if (this.collarMat) {
      this.collarMat.color.setHex(prod.capColor);
    }
    if (this.keyLight) {
      this.keyLight.color.setHex(prod.lightColor);
    }
  }

  renderUIControls() {
    let controlsWrap = document.getElementById('hero-3d-controls');
    if (!controlsWrap) {
      controlsWrap = document.createElement('div');
      controlsWrap.id = 'hero-3d-controls';
      controlsWrap.className = 'absolute top-3 inset-x-3 z-20 flex flex-col gap-2 pointer-events-auto';
      this.container.parentElement.appendChild(controlsWrap);
    }

    // Top Selector Pills
    const pillsHTML = `
      <div class="flex items-center justify-center gap-1.5 overflow-x-auto py-1 px-2 bg-slate-900/85 backdrop-blur-md rounded-2xl border border-white/20 shadow-lg">
        ${this.showcaseProducts.map((p, idx) => `
          <button onclick="window.seragHero3D.loadProduct(${idx})" 
                  id="hero-pill-${idx}"
                  class="hero-3d-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 ${idx === this.currentIndex ? 'bg-white text-[#0A192F] font-black shadow-md' : 'text-slate-300 hover:text-white hover:bg-slate-800'}">
            ${p.nameAr}
          </button>
        `).join('')}
      </div>
    `;

    // Bottom Info Card
    const infoCardHTML = `
      <div id="hero-3d-info-card" class="mt-auto bg-slate-950/90 backdrop-blur-md p-3.5 rounded-2xl border border-white/20 shadow-2xl flex items-center justify-between gap-3 text-white transition-all">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-xl overflow-hidden bg-slate-900 border border-white/20 p-0.5 shrink-0">
            <img id="hero-3d-thumb" src="${this.showcaseProducts[0].image}" alt="Perfume" class="w-full h-full object-contain" />
          </div>
          <div>
            <div id="hero-3d-title" class="font-bold text-sm text-white font-bold font-arabic">كراون بلاك • Crown Black</div>
            <div id="hero-3d-sub" class="text-[11px] text-slate-400">قسم دخوني (١,٧٠٠ ج.م)</div>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button id="hero-3d-order-btn" 
                  onclick="window.seragCart ? window.seragCart.orderSingleOnWhatsApp(window.seragApp.getProductById(window.seragHero3D.showcaseProducts[window.seragHero3D.currentIndex].id)) : null" 
                  class="btn-whatsapp px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md">
            <span>طلب واتساب ⚡</span>
          </button>
        </div>
      </div>
    `;

    controlsWrap.innerHTML = pillsHTML + infoCardHTML;
  }

  updateProductInfoOverlay(prod) {
    const titleEl = document.getElementById('hero-3d-title');
    const subEl = document.getElementById('hero-3d-sub');
    const thumbEl = document.getElementById('hero-3d-thumb');

    if (titleEl) titleEl.textContent = `${prod.nameAr} • ${prod.nameEn}`;
    if (subEl) subEl.textContent = `${prod.categoryAr}`;
    if (thumbEl) thumbEl.src = prod.image;

    // Highlight active pill
    this.showcaseProducts.forEach((_, idx) => {
      const pill = document.getElementById(`hero-pill-${idx}`);
      if (pill) {
        if (idx === this.currentIndex) {
          pill.className = 'hero-3d-pill px-3 py-1.5 rounded-xl text-xs font-black transition-all shrink-0 bg-white text-[#0A192F] font-black shadow-md scale-105';
        } else {
          pill.className = 'hero-3d-pill px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 text-slate-300 hover:text-white hover:bg-slate-800';
        }
      }
    });
  }

  bindEvents() {
    window.addEventListener('resize', () => this.onWindowResize());

    const el = this.renderer.domElement;

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

        this.targetRotationY += deltaX * 0.008;
        this.targetRotationX += deltaY * 0.008;

        this.previousMousePosition = { x: e.clientX, y: e.clientY };
      } else {
        const rect = this.container.getBoundingClientRect();
        const clientX = e.clientX - rect.left;
        const clientY = e.clientY - rect.top;
        const normX = (clientX / rect.width) * 2 - 1;
        const normY = -(clientY / rect.height) * 2 + 1;
        this.mouseX = normX;
        this.mouseY = normY;
      }
    });

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
    const height = this.container.clientHeight || 520;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(width, height);
  }

  animate() {
    requestAnimationFrame(() => this.animate());

    const elapsedTime = this.clock.getElapsedTime();

    if (!this.isDragging) {
      this.targetRotationY += this.autoRotateSpeed;
      this.targetRotationX = this.mouseY * 0.22;
    }

    this.currentRotationX += (this.targetRotationX - this.currentRotationX) * 0.05;
    this.currentRotationY += (this.targetRotationY - this.currentRotationY) * 0.05;

    if (this.bottleGroup) {
      this.bottleGroup.rotation.y = this.currentRotationY;
      this.bottleGroup.rotation.x = this.currentRotationX;
      this.bottleGroup.position.y = -0.15 + Math.sin(elapsedTime * 1.5) * 0.08;
    }

    if (this.podiumMesh) {
      this.podiumMesh.rotation.y = elapsedTime * 0.04;
    }

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
