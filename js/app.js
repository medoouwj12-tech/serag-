/**
 * SERAG FRAGRANCES - Main Frontend Application Orchestrator
 */

class SeragApp {
  constructor() {
    this.products = getProductsCatalog();
    this.currentCategory = 'all';
    this.currentFamily = 'all';
    this.currentSort = 'featured';
    this.searchQuery = '';
    this.currentLang = localStorage.getItem('serag_lang') || 'ar';

    this.init();
  }

  init() {
    this.applyLanguage(this.currentLang);
    this.renderProductsGrid();
    this.renderSpecialSetsSection();
    this.bindNavigation();
    this.bindFilters();
    this.bindSearch();
    this.bindScentQuiz();
  }

  applyLanguage(lang) {
    this.currentLang = lang;
    localStorage.setItem('serag_lang', lang);
    const html = document.documentElement;

    if (lang === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
    }

    // Toggle lang switcher buttons
    const langBtns = document.querySelectorAll('.lang-toggle-btn');
    langBtns.forEach(btn => {
      btn.textContent = lang === 'ar' ? 'English' : 'العربية';
    });

    this.updateStaticTranslations();
    this.renderProductsGrid();
    this.renderSpecialSetsSection();
  }

  toggleLanguage() {
    const nextLang = this.currentLang === 'ar' ? 'en' : 'ar';
    this.applyLanguage(nextLang);
  }

  updateStaticTranslations() {
    const isRtl = this.currentLang === 'ar';
    
    document.querySelectorAll('[data-i18n-ar]').forEach(el => {
      const arText = el.getAttribute('data-i18n-ar');
      const enText = el.getAttribute('data-i18n-en');
      if (isRtl && arText) {
        el.textContent = arText;
      } else if (!isRtl && enText) {
        el.textContent = enText;
      }
    });

    document.querySelectorAll('[data-i18n-placeholder-ar]').forEach(el => {
      const arPlaceholder = el.getAttribute('data-i18n-placeholder-ar');
      const enPlaceholder = el.getAttribute('data-i18n-placeholder-en');
      el.placeholder = isRtl ? arPlaceholder : enPlaceholder;
    });
  }

  getFilteredProducts() {
    let list = [...this.products];

    // Category filter
    if (this.currentCategory !== 'all') {
      list = list.filter(p => p.category === this.currentCategory);
    }

    // Fragrance Family filter
    if (this.currentFamily !== 'all') {
      const fam = this.currentFamily.toLowerCase();
      list = list.filter(p => {
        const pFam = (p.scentFamily || '').toLowerCase();
        const pTop = (p.topNotes || '').toLowerCase();
        const pHeart = (p.heartNotes || '').toLowerCase();
        const pBase = (p.baseNotes || '').toLowerCase();
        return pFam.includes(fam) || pTop.includes(fam) || pHeart.includes(fam) || pBase.includes(fam);
      });
    }

    // Search query
    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      list = list.filter(p => 
        p.nameEn.toLowerCase().includes(q) || 
        p.nameAr.includes(q) || 
        (p.scentFamily && p.scentFamily.toLowerCase().includes(q)) ||
        (p.topNotes && p.topNotes.toLowerCase().includes(q)) ||
        (p.heartNotes && p.heartNotes.toLowerCase().includes(q)) ||
        (p.baseNotes && p.baseNotes.toLowerCase().includes(q))
      );
    }

    // Sort
    if (this.currentSort === 'price-low') {
      list.sort((a, b) => a.price - b.price);
    } else if (this.currentSort === 'price-high') {
      list.sort((a, b) => b.price - a.price);
    } else if (this.currentSort === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    } else if (this.currentSort === 'name') {
      const key = this.currentLang === 'ar' ? 'nameAr' : 'nameEn';
      list.sort((a, b) => a[key].localeCompare(b[key]));
    }

    return list;
  }

  renderProductsGrid() {
    const grid = document.getElementById('products-grid');
    const countEl = document.getElementById('products-count-label');
    if (!grid) return;

    // Sync active category button in UI
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-cat') === this.currentCategory);
    });

    const list = this.getFilteredProducts();
    const isRtl = this.currentLang === 'ar';

    if (countEl) {
      countEl.textContent = isRtl ? `عرض ${list.length} من أصل ${this.products.length} عطر فاخر` : `Showing ${list.length} of ${this.products.length} luxury perfumes`;
    }

    if (list.length === 0) {
      grid.innerHTML = `
        <div class="col-span-full py-16 text-center">
          <div class="w-16 h-16 mx-auto mb-4 rounded-full bg-[#0A192F] dark:bg-slate-800 flex items-center justify-center text-[#0A192F]">
            <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          </div>
          <h3 class="text-xl font-bold text-[#002B49] dark:text-white mb-1">
            ${isRtl ? 'لا توجد نتائج مطابقة' : 'No Fragrances Found'}
          </h3>
          <p class="text-[#162C4E] text-sm">
            ${isRtl ? 'جرب البحث بكلمات أخرى أو إعادة ضبط الفلاتر' : 'Try searching with different terms or reset your filters.'}
          </p>
          <button onclick="window.seragApp.resetFilters()" class="mt-4 px-5 py-2 bg-slate-900 text-white rounded-full text-sm font-semibold hover:bg-[#0A192F] transition">
            ${isRtl ? 'إعادة ضبط الفلاتر' : 'Reset Filters'}
          </button>
        </div>
      `;
      return;
    }

    grid.innerHTML = list.map(product => {
      const badgeClass = 'badge-serag';
      const badgeText = product.badge || (product.category === 'dkhoni' ? 'Dkhoni' : (product.category === 'almas' ? 'ALMAS' : 'IBRAQ'));

      return `
        <div class="glass-card rounded-2xl p-5 relative flex flex-col justify-between group transition-all duration-300 card-tilt-container">
          <!-- Top Badge -->
          <span class="badge-serag ${badgeClass}">${badgeText}</span>
          
          <!-- Scent Family Tag -->
          <div class="text-right ${isRtl ? 'text-left' : 'text-right'} mb-1">
            <span class="text-[11px] font-semibold tracking-wider text-[#0A192F] font-bold uppercase bg-[#F0F5FA] border border-[#0A192F]/10 px-2.5 py-1 rounded-full">
              ${product.scentFamily}
            </span>
          </div>

          <!-- 3D Bottle Visual Container -->
          <div class="bottle-visual-wrapper my-3 cursor-pointer" onclick="window.seragApp.openQuickView(${product.id})">
            ${getBottleSVG(product)}
          </div>

          <!-- Info Section -->
          <div class="pt-2">
            <div class="flex items-center justify-between gap-2 mb-1">
              <h3 class="font-bold text-lg text-[#0A192F] dark:text-white group-hover:text-[#0A192F] transition truncate">
                ${isRtl ? product.nameAr : product.nameEn}
              </h3>
              <div class="flex items-center gap-1 text-[#0A192F] text-xs font-black shrink-0">
                <span>★</span>
                <span>${product.rating}</span>
              </div>
            </div>

            <p class="text-xs text-[#162C4E] dark:text-[#162C4E] mb-3 truncate">
              ${isRtl ? product.nameEn : product.nameAr} • ${product.volume}
            </p>

            <!-- Olfactory Note Chips -->
            <div class="flex flex-wrap gap-1.5 mb-4">
              <span class="notes-pill">${product.topNotes.split(',')[0]}</span>
              <span class="notes-pill">${product.heartNotes.split(',')[0]}</span>
              <span class="notes-pill">${product.baseNotes.split(',')[0]}</span>
            </div>

            <!-- Price & Actions -->
            <div class="pt-3 border-t border-[#0A192F]/10 dark:border-slate-800/80 flex items-center justify-between gap-2">
              <div>
                <span class="text-xs text-[#162C4E] block">${isRtl ? 'السعر' : 'Price'}</span>
                <span class="font-extrabold text-lg text-[#0A192F] dark:text-white">
                  ${product.price.toLocaleString()} <span class="text-xs font-bold text-[#0A192F]">${isRtl ? 'ج.م' : 'EGP'}</span>
                </span>
              </div>

              <div class="flex items-center gap-2">
                <!-- Direct WhatsApp Order Button -->
                <button onclick="window.seragCart.orderSingleOnWhatsApp(window.seragApp.getProductById(${product.id}))" 
                        class="btn-whatsapp px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm"
                        title="${isRtl ? 'طلب مباشر عبر واتساب' : 'Order via WhatsApp'}">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.058-2.115-.534-1.802-.752-2.955-2.587-3.045-2.707-.09-.12-.733-.974-.733-1.859 0-.885.466-1.32.631-1.499.166-.179.362-.224.484-.224.12 0 .241.002.348.006.113.004.263-.042.412.316.155.373.53 1.291.576 1.385.046.094.077.204.015.328-.063.125-.094.204-.188.314-.094.11-.198.246-.283.33-.094.094-.192.196-.083.383.11.188.487.804 1.045 1.301.718.639 1.323.836 1.511.929.188.094.298.083.408-.042.11-.125.471-.548.597-.736.125-.188.251-.157.422-.094.171.063 1.088.513 1.275.607.188.094.313.141.36.22.046.078.046.452-.098.857z"/></svg>
                  <span class="font-bold">${isRtl ? 'طلب واتساب' : 'WhatsApp'}</span>
                </button>

                <!-- Add to Cart Button -->
                <button onclick="window.seragCart.addItem(window.seragApp.getProductById(${product.id}))" 
                        class="btn-serag-primary p-2.5 rounded-xl hover:scale-105 transition"
                        title="${isRtl ? 'إضافة إلى السلة' : 'Add to Cart'}">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  renderSpecialSetsSection() {
    const container = document.getElementById('special-sets-container');
    if (!container) return;

    const specialProducts = this.products.filter(p => p.category === 'special');
    const isRtl = this.currentLang === 'ar';

    container.innerHTML = specialProducts.map(item => `
      <div class="glass-dark rounded-3xl p-6 sm:p-8 flex flex-col lg:flex-row items-center gap-8 relative overflow-hidden gold-shimmer border border-[#0A192F]/20">
        <div class="w-full lg:w-1/3 flex justify-center shrink-0">
          <div class="w-56 h-64 bg-[#001428] rounded-2xl p-4 flex items-center justify-center border border-[#0A192F]/20 shadow-2xl">
            ${getBottleSVG(item)}
          </div>
        </div>
        <div class="flex-1 text-center lg:text-left ${isRtl ? 'lg:text-right' : ''}">
          <div class="inline-block px-3 py-1 rounded-full bg-[#0A192F] text-white text-xs font-bold uppercase tracking-wider mb-3 border border-[#0A192F]/20">
            ${item.badge} • ${item.volume}
          </div>
          <h3 class="text-2xl sm:text-3xl font-extrabold text-white mb-2">
            ${isRtl ? item.nameAr : item.nameEn}
          </h3>
          <p class="text-white/90 text-sm mb-4 leading-relaxed">
            ${item.topNotes}
          </p>
          <div class="flex flex-wrap items-center justify-center ${isRtl ? 'lg:justify-start' : 'lg:justify-start'} gap-4 pt-2">
            <div class="text-2xl font-black text-white">
              ${item.price.toLocaleString()} <span class="text-sm font-bold text-white">${isRtl ? 'ج.م' : 'EGP'}</span>
            </div>
            <button onclick="window.seragCart.orderSingleOnWhatsApp(window.seragApp.getProductById(${item.id}))" 
                    class="btn-whatsapp px-6 py-3 rounded-full font-bold text-sm flex items-center gap-2 shadow-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.058-2.115-.534-1.802-.752-2.955-2.587-3.045-2.707-.09-.12-.733-.974-.733-1.859 0-.885.466-1.32.631-1.499.166-.179.362-.224.484-.224.12 0 .241.002.348.006.113.004.263-.042.412.316.155.373.53 1.291.576 1.385.046.094.077.204.015.328-.063.125-.094.204-.188.314-.094.11-.198.246-.283.33-.094.094-.192.196-.083.383.11.188.487.804 1.045 1.301.718.639 1.323.836 1.511.929.188.094.298.083.408-.042.11-.125.471-.548.597-.736.125-.188.251-.157.422-.094.171.063 1.088.513 1.275.607.188.094.313.141.36.22.046.078.046.452-.098.857z"/></svg>
              <span>${isRtl ? 'طلب البوكس الفاخر عبر واتساب' : 'Order Box via WhatsApp'}</span>
            </button>
            <button onclick="window.seragCart.addItem(window.seragApp.getProductById(${item.id}))" 
                    class="btn-serag-gold px-5 py-3 rounded-full font-bold text-sm">
              ${isRtl ? 'إضافة للسلة' : 'Add to Cart'}
            </button>
          </div>
        </div>
      </div>
    `).join('');
  }

  openQuickView(productId) {
    const product = this.getProductById(productId);
    if (!product) return;

    const modal = document.getElementById('quick-view-modal');
    const content = document.getElementById('quick-view-content');
    if (!modal || !content) return;

    const isRtl = this.currentLang === 'ar';

    content.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div class="bottle-visual-wrapper bg-[#F0F5FA] dark:bg-slate-900/80 p-8 rounded-3xl flex items-center justify-center border border-[#0A192F]/20 min-h-[340px]">
          ${getBottleSVG(product)}
        </div>
        <div>
          <div class="inline-block px-3 py-1 rounded-full bg-[#0A192F] dark:bg-[#0A192F] text-[#0A192F] dark:text-white text-xs font-bold mb-3">
            ${product.categoryNameAr || product.category} • ${product.volume}
          </div>
          <h2 class="text-2xl sm:text-3xl font-black text-[#0A192F] dark:text-white mb-1">
            ${isRtl ? product.nameAr : product.nameEn}
          </h2>
          <p class="text-sm text-[#162C4E] dark:text-[#162C4E] mb-4">
            ${isRtl ? product.nameEn : product.nameAr}
          </p>

          <div class="space-y-3 mb-6 bg-[#F0F5FA] dark:bg-slate-800/60 p-4 rounded-2xl border border-[#0A192F]/10 dark:border-slate-700/60">
            <h4 class="font-bold text-xs uppercase tracking-wider text-[#0A192F] dark:text-[#0A192F]">
              ${isRtl ? 'الهرم العطري (Olfactory Pyramid)' : 'Olfactory Pyramid'}
            </h4>
            <div class="text-xs text-[#002B49] dark:text-slate-300">
              <span class="font-bold text-[#0A192F] dark:text-white">${isRtl ? 'القمة العطرية (Top):' : 'Top Notes:'}</span> ${product.topNotes}
            </div>
            <div class="text-xs text-[#002B49] dark:text-slate-300">
              <span class="font-bold text-[#0A192F] dark:text-white">${isRtl ? 'قلب العطر (Heart):' : 'Heart Notes:'}</span> ${product.heartNotes}
            </div>
            <div class="text-xs text-[#002B49] dark:text-slate-300">
              <span class="font-bold text-[#0A192F] dark:text-white">${isRtl ? 'القاعدة العطرية (Base):' : 'Base Notes:'}</span> ${product.baseNotes}
            </div>
          </div>

          <div class="flex items-center justify-between mb-6">
            <div>
              <span class="text-xs text-[#162C4E] block">${isRtl ? 'السعر الرسمي' : 'Official Price'}</span>
              <span class="text-3xl font-black text-[#0A192F] dark:text-white">
                ${product.price.toLocaleString()} <span class="text-sm font-bold text-[#0A192F]">${isRtl ? 'ج.م' : 'EGP'}</span>
              </span>
            </div>
            <div class="text-emerald-600 font-bold text-xs bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full">
              ✓ ${isRtl ? 'متوفر للتسليم الفوري' : 'In Stock & Ready'}
            </div>
          </div>

          <div class="flex flex-col sm:flex-row gap-3">
            <button onclick="window.seragCart.orderSingleOnWhatsApp(window.seragApp.getProductById(${product.id}))" 
                    class="btn-whatsapp flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg">
              <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.771-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.698.058-2.115-.534-1.802-.752-2.955-2.587-3.045-2.707-.09-.12-.733-.974-.733-1.859 0-.885.466-1.32.631-1.499.166-.179.362-.224.484-.224.12 0 .241.002.348.006.113.004.263-.042.412.316.155.373.53 1.291.576 1.385.046.094.077.204.015.328-.063.125-.094.204-.188.314-.094.11-.198.246-.283.33-.094.094-.192.196-.083.383.11.188.487.804 1.045 1.301.718.639 1.323.836 1.511.929.188.094.298.083.408-.042.11-.125.471-.548.597-.736.125-.188.251-.157.422-.094.171.063 1.088.513 1.275.607.188.094.313.141.36.22.046.078.046.452-.098.857z"/></svg>
              <span>${isRtl ? 'طلب مباشر عبر واتساب' : 'Order via WhatsApp'}</span>
            </button>
            <button onclick="window.seragCart.addItem(window.seragApp.getProductById(${product.id}))" 
                    class="btn-serag-primary flex-1 py-3.5 px-6 rounded-2xl font-bold text-sm flex items-center justify-center gap-2">
              <span>${isRtl ? 'إضافة إلى السلة' : 'Add to Cart'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  getProductById(id) {
    return this.products.find(p => p.id === id);
  }

  resetFilters() {
    this.currentCategory = 'all';
    this.currentFamily = 'all';
    this.currentSort = 'featured';
    this.searchQuery = '';

    document.querySelectorAll('.cat-filter-btn').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-cat') === 'all');
    });

    document.querySelectorAll('.family-pill').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-family') === 'all');
    });

    const searchInput = document.getElementById('search-input');
    if (searchInput) searchInput.value = '';

    this.renderProductsGrid();
  }

  bindNavigation() {
    // Cart Drawer Toggle
    const cartToggles = document.querySelectorAll('.cart-drawer-toggle');
    const drawer = document.getElementById('cart-drawer');
    const overlay = document.getElementById('cart-drawer-overlay');

    const openCart = () => {
      if (drawer && overlay) {
        drawer.classList.remove('translate-x-full', '-translate-x-full');
        overlay.classList.remove('hidden');
      }
    };

    const closeCart = () => {
      if (drawer && overlay) {
        const isRtl = document.dir === 'rtl';
        drawer.classList.add(isRtl ? '-translate-x-full' : 'translate-x-full');
        overlay.classList.add('hidden');
      }
    };

    cartToggles.forEach(btn => btn.addEventListener('click', openCart));
    if (overlay) overlay.addEventListener('click', closeCart);

    const closeBtn = document.getElementById('close-cart-drawer-btn');
    if (closeBtn) closeBtn.addEventListener('click', closeCart);

    // Cart Checkout WhatsApp Button in Drawer
    const checkoutBtn = document.getElementById('cart-whatsapp-checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        const name = document.getElementById('checkout-customer-name')?.value;
        const phone = document.getElementById('checkout-customer-phone')?.value;
        const city = document.getElementById('checkout-customer-city')?.value;
        const address = document.getElementById('checkout-customer-address')?.value;
        const notes = document.getElementById('checkout-customer-notes')?.value;

        window.seragCart.checkoutCartWhatsApp({ name, phone, city, address, notes });
      });
    }

    // Coupon Apply Button
    const applyCouponBtn = document.getElementById('apply-coupon-btn');
    if (applyCouponBtn) {
      applyCouponBtn.addEventListener('click', () => {
        const input = document.getElementById('coupon-input');
        if (input && input.value) {
          window.seragCart.applyCoupon(input.value);
        }
      });
    }

    // 3D Hero Edition Switcher Buttons
    document.querySelectorAll('.hero-theme-pill').forEach(pill => {
      pill.addEventListener('click', () => {
        document.querySelectorAll('.hero-theme-pill').forEach(p => p.classList.remove('bg-[#0A192F]', 'text-[#0A192F]'));
        pill.classList.add('bg-[#0A192F]', 'text-[#0A192F]');
        const theme = pill.getAttribute('data-theme');
        if (window.seragHero3D) {
          window.seragHero3D.setTheme(theme);
        }
      });
    });
  }

  bindFilters() {
    // Category tabs
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.cat-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentCategory = btn.getAttribute('data-cat') || 'all';
        this.renderProductsGrid();
      });
    });

    // Fragrance family pills
    document.querySelectorAll('.family-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.family-pill').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentFamily = btn.getAttribute('data-family') || 'all';
        this.renderProductsGrid();
      });
    });

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.currentSort = e.target.value;
        this.renderProductsGrid();
      });
    }
  }

  bindSearch() {
    const searchInputs = document.querySelectorAll('.app-search-input');
    searchInputs.forEach(input => {
      input.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderProductsGrid();
      });
    });
  }

  bindScentQuiz() {
    const quizBtn = document.getElementById('submit-scent-quiz-btn');
    if (quizBtn) {
      quizBtn.addEventListener('click', () => {
        const occasion = document.querySelector('input[name="quiz-occasion"]:checked')?.value || 'royal';
        const preference = document.querySelector('input[name="quiz-pref"]:checked')?.value || 'oud';

        let recommendation = this.products.find(p => p.slug === 'crown-black');
        if (preference === 'tobacco') recommendation = this.products.find(p => p.slug === 'french-tobacco');
        else if (preference === 'floral') recommendation = this.products.find(p => p.slug === 'la-bella');
        else if (preference === 'fresh') recommendation = this.products.find(p => p.slug === 'emerald-soul');
        else if (preference === 'amber') recommendation = this.products.find(p => p.slug === 'khayal');

        if (recommendation) {
          this.openQuickView(recommendation.id);
        }
      });
    }
  }
}

// Instantiate on load
document.addEventListener('DOMContentLoaded', () => {
  window.seragApp = new SeragApp();
});
