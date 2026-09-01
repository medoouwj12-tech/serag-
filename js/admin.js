/**
 * SERAG FRAGRANCES - Admin Dashboard Controller
 * Full Inventory Management, Real Image Uploader, Analytics & Data Export
 */

class SeragAdmin {
  constructor() {
    this.isAuthenticated = localStorage.getItem('serag_admin_auth') === 'true';
    this.products = getProductsCatalog();
    this.editingProduct = null;
    this.currentFilter = 'all';
    this.searchQuery = '';

    this.init();
  }

  init() {
    this.checkAuthUI();
    this.updateStats();
    this.renderProductsTable();
    this.bindEvents();
  }

  authenticate(pin) {
    if (pin === 'serag2026' || pin === 'admin') {
      this.isAuthenticated = true;
      localStorage.setItem('serag_admin_auth', 'true');
      this.checkAuthUI();
      this.showToast('تم تسجيل الدخول بنجاح إلى لوحة التحكم');
      return true;
    } else {
      this.showToast('رمز المرور غير صحيح! حاول مرة أخرى');
      return false;
    }
  }

  logout() {
    this.isAuthenticated = false;
    localStorage.removeItem('serag_admin_auth');
    this.checkAuthUI();
    this.showToast('تم تسجيل الخروج من لوحة التحكم');
  }

  checkAuthUI() {
    const lockScreen = document.getElementById('admin-lock-screen');
    const dashboardView = document.getElementById('admin-dashboard-content');

    if (lockScreen && dashboardView) {
      if (this.isAuthenticated) {
        lockScreen.classList.add('hidden');
        dashboardView.classList.remove('hidden');
        this.updateStats();
        this.renderProductsTable();
      } else {
        lockScreen.classList.remove('hidden');
        dashboardView.classList.add('hidden');
      }
    }
  }

  updateStats() {
    const totalCountEl = document.getElementById('stat-total-products');
    const dkhoniCountEl = document.getElementById('stat-dkhoni-products');
    const ibraqCountEl = document.getElementById('stat-ibraq-products');
    const totalValueEl = document.getElementById('stat-total-value');
    const totalStockUnitsEl = document.getElementById('stat-total-stock');

    const totalCount = this.products.length;
    const dkhoniCount = this.products.filter(p => p.category === 'dkhoni').length;
    const ibraqCount = this.products.filter(p => p.category === 'ibraq' || p.category === 'special').length;
    
    // Total retail value calculation (Price * Stock count)
    const totalValue = this.products.reduce((sum, p) => sum + (p.price * (p.stockCount || 20)), 0);
    const totalUnits = this.products.reduce((sum, p) => sum + (p.stockCount || 20), 0);

    if (totalCountEl) totalCountEl.textContent = totalCount;
    if (dkhoniCountEl) dkhoniCountEl.textContent = dkhoniCount;
    if (ibraqCountEl) ibraqCountEl.textContent = ibraqCount;
    if (totalValueEl) totalValueEl.textContent = totalValue.toLocaleString() + ' EGP';
    if (totalStockUnitsEl) totalStockUnitsEl.textContent = totalUnits.toLocaleString() + ' قطعة';
  }

  renderProductsTable() {
    const tbody = document.getElementById('admin-products-tbody');
    if (!tbody) return;

    let filtered = this.products;

    if (this.currentFilter !== 'all') {
      filtered = filtered.filter(p => p.category === this.currentFilter);
    }

    if (this.searchQuery.trim()) {
      const q = this.searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.nameEn.toLowerCase().includes(q) || 
        p.nameAr.includes(q) || 
        (p.scentFamily && p.scentFamily.toLowerCase().includes(q))
      );
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="px-6 py-8 text-center text-slate-500">
            لا توجد عطور مطابقة للبحث أو الفلتر المحدد
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filtered.map(p => {
      const isLowStock = (p.stockCount || 0) < 15;
      const stockBadge = isLowStock 
        ? '<span class="px-2 py-1 text-xs rounded-full bg-[#0A192F] text-white font-bold">مخزون منخفض (' + (p.stockCount || 0) + ')</span>'
        : '<span class="px-2 py-1 text-xs rounded-full bg-[#0A192F] text-white font-bold">متوفر (' + (p.stockCount || 0) + ')</span>';

      return `
        <tr class="hover:bg-slate-50/80 transition-colors border-b border-slate-100">
          <td class="px-4 py-3 font-mono text-xs text-slate-500">#${p.id}</td>
          <td class="px-4 py-3">
            <div class="flex items-center gap-3">
              <div class="w-12 h-14 bg-slate-100 rounded-lg flex items-center justify-center p-1 border border-[#0A192F]/20 shrink-0">
                ${getBottleSVG(p)}
              </div>
              <div>
                <div class="font-bold text-slate-900 text-sm">${p.nameAr}</div>
                <div class="text-xs text-slate-500">${p.nameEn}</div>
              </div>
            </div>
          </td>
          <td class="px-4 py-3">
            <span class="px-2.5 py-1 text-xs rounded-full ${p.category === 'dkhoni' ? 'bg-[#0A192F] text-white' : 'bg-[#0A192F] text-white'} font-semibold">
              ${p.categoryNameAr || p.category}
            </span>
          </td>
          <td class="px-4 py-3 font-bold text-slate-900 text-sm">
            ${p.price.toLocaleString()} <span class="text-xs font-normal text-slate-500">ج.م</span>
          </td>
          <td class="px-4 py-3">
            ${stockBadge}
          </td>
          <td class="px-4 py-3 text-xs text-slate-600">
            ${p.volume || '100ml'}
          </td>
          <td class="px-4 py-3 text-left">
            <div class="flex items-center justify-end gap-2">
              <button onclick="window.seragAdmin.openImageUploadModal(${p.id})" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="رفع صورة">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </button>
              <button onclick="window.seragAdmin.openEditModal(${p.id})" class="p-1.5 text-[#0A192F] hover:bg-amber-50 rounded-lg transition" title="تعديل">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
              </button>
              <button onclick="window.seragAdmin.deleteProduct(${p.id})" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition" title="حذف">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path></svg>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  openAddModal() {
    this.editingProduct = null;
    const form = document.getElementById('product-form');
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');

    if (form) form.reset();
    if (title) title.textContent = 'إضافة عطر جديد للكتالوج';
    if (modal) modal.classList.remove('hidden');
  }

  openEditModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.editingProduct = product;
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');

    if (title) title.textContent = 'تعديل بيانات: ' + product.nameAr;

    // Pre-fill inputs
    document.getElementById('prod-name-en').value = product.nameEn || '';
    document.getElementById('prod-name-ar').value = product.nameAr || '';
    document.getElementById('prod-category').value = product.category || 'dkhoni';
    document.getElementById('prod-price').value = product.price || 1700;
    document.getElementById('prod-volume').value = product.volume || '100ml / 3.4 fl oz';
    document.getElementById('prod-family').value = product.scentFamily || '';
    document.getElementById('prod-top').value = product.topNotes || '';
    document.getElementById('prod-heart').value = product.heartNotes || '';
    document.getElementById('prod-base').value = product.baseNotes || '';
    document.getElementById('prod-stock').value = product.stockCount || 30;
    document.getElementById('prod-badge').value = product.badge || '';

    if (modal) modal.classList.remove('hidden');
  }

  saveProductFromForm(formData) {
    if (this.editingProduct) {
      // Update
      const index = this.products.findIndex(p => p.id === this.editingProduct.id);
      if (index > -1) {
        this.products[index] = {
          ...this.products[index],
          ...formData
        };
        this.showToast('تم تحديث العطر بنجاح');
      }
    } else {
      // New item
      const newId = this.products.length > 0 ? Math.max(...this.products.map(p => p.id)) + 1 : 1;
      const slug = (formData.nameEn || 'perfume').toLowerCase().replace(/\s+/g, '-');
      const newProduct = {
        id: newId,
        slug: slug,
        rating: 5.0,
        reviewsCount: 1,
        inStock: true,
        image: `assets/images/${slug}.png`,
        customImage: null,
        themeColor: formData.category === 'dkhoni' ? '#D4AF37' : '#0A192F',
        shape: 'shine',
        ...formData
      };
      this.products.push(newProduct);
      this.showToast('تمت إضافة العطر الجديد بنجاح');
    }

    saveProductsCatalog(this.products);
    this.updateStats();
    this.renderProductsTable();
    this.closeModal('product-modal');
  }

  deleteProduct(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    if (confirm(`هل أنت متأكد من حذف عطر "${product.nameAr}" من الكتالوج؟`)) {
      this.products = this.products.filter(p => p.id !== productId);
      saveProductsCatalog(this.products);
      this.updateStats();
      this.renderProductsTable();
      this.showToast('تم حذف العطر من الكتالوج');
    }
  }

  openImageUploadModal(productId) {
    const product = this.products.find(p => p.id === productId);
    if (!product) return;

    this.uploadingProductId = productId;
    const modal = document.getElementById('image-upload-modal');
    const preview = document.getElementById('image-upload-preview');
    const nameEl = document.getElementById('image-upload-prod-name');

    if (nameEl) nameEl.textContent = `${product.nameAr} (${product.nameEn})`;
    if (preview) {
      preview.innerHTML = getBottleSVG(product);
    }

    if (modal) modal.classList.remove('hidden');
  }

  handleImageFileSelected(file) {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const index = this.products.findIndex(p => p.id === this.uploadingProductId);
      if (index > -1) {
        this.products[index].customImage = dataUrl;
        saveProductsCatalog(this.products);
        this.renderProductsTable();
        this.closeModal('image-upload-modal');
        this.showToast('تم رفع وتحديث صورة العطر بنجاح!');
      }
    };
    reader.readAsDataURL(file);
  }

  exportCatalogJSON() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.products, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `serag_fragrances_catalog_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    this.showToast('تم تصدير نسخة احتياطية من الكتالوج بصيغة JSON');
  }

  importCatalogJSON(jsonFile) {
    if (!jsonFile) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target.result);
        if (Array.isArray(imported)) {
          this.products = imported;
          saveProductsCatalog(this.products);
          this.updateStats();
          this.renderProductsTable();
          this.showToast(`تم استيراد ${imported.length} عطر بنجاح!`);
        } else {
          alert('ملف JSON غير صالح');
        }
      } catch (err) {
        alert('حدث خطأ أثناء قراءة ملف JSON: ' + err.message);
      }
    };
    reader.readAsText(jsonFile);
  }

  resetToDefaults() {
    if (confirm('هل أنت متأكد من استعادة بيانات الكتالوج الافتراضية الأصلية (٤٥ عطر بأسعارها المحددة)؟ سيتم إلغاء أي تعديلات محلية.')) {
      this.products = resetProductsCatalog();
      this.updateStats();
      this.renderProductsTable();
      this.showToast('تمت استعادة الكتالوج الافتراضي بالكامل بنجاح!');
    }
  }

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) modal.classList.add('hidden');
  }

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('admin-search-input');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value;
        this.renderProductsTable();
      });
    }

    // Category filter tabs
    const tabs = document.querySelectorAll('.admin-filter-tab');
    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        tabs.forEach(t => t.classList.remove('active', 'bg-slate-900', 'text-white'));
        tab.classList.add('active', 'bg-slate-900', 'text-white');
        this.currentFilter = tab.getAttribute('data-category') || 'all';
        this.renderProductsTable();
      });
    });

    // Form submit
    const form = document.getElementById('product-form');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const categoryVal = document.getElementById('prod-category').value;
        const data = {
          nameEn: document.getElementById('prod-name-en').value,
          nameAr: document.getElementById('prod-name-ar').value,
          category: categoryVal,
          categoryNameEn: categoryVal === 'afnan' ? 'AFNAN Collection' : (categoryVal === 'rasasi' ? 'Rasasi Collection' : (categoryVal === 'qasida' ? 'QASIDA Collection' : (categoryVal === 'dkhoni' ? 'Dkhoni Collection' : (categoryVal === 'ibraq' ? 'IBRAQ Collection' : 'Special Gift Sets')))),
          categoryNameAr: categoryVal === 'afnan' ? 'قسم أفنان' : (categoryVal === 'rasasi' ? 'قسم الرصاصي' : (categoryVal === 'qasida' ? 'قسم قصيدة (QASIDA)' : (categoryVal === 'dkhoni' ? 'قسم دخوني' : (categoryVal === 'ibraq' ? 'قسم أبرق' : 'المجموعات الخاصة')))),
          price: parseFloat(document.getElementById('prod-price').value) || 1700,
          volume: document.getElementById('prod-volume').value,
          scentFamily: document.getElementById('prod-family').value,
          topNotes: document.getElementById('prod-top').value,
          heartNotes: document.getElementById('prod-heart').value,
          baseNotes: document.getElementById('prod-base').value,
          stockCount: parseInt(document.getElementById('prod-stock').value) || 20,
          badge: document.getElementById('prod-badge').value
        };
        this.saveProductFromForm(data);
      });
    }

    // Image file input
    const fileInput = document.getElementById('image-file-input');
    if (fileInput) {
      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) {
          this.handleImageFileSelected(e.target.files[0]);
        }
      });
    }
  }

  showToast(text) {
    if (window.seragCart && window.seragCart.showToast) {
      window.seragCart.showToast(text);
    } else {
      alert(text);
    }
  }
}

// Global instance
window.seragAdmin = new SeragAdmin();
