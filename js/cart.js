/**
 * SERAG FRAGRANCES - Luxury Cart & WhatsApp Checkout System
 * Official Order Hotline: +201025996069
 */

const SERAG_PHONE = '201025996069';

class SeragCart {
  constructor() {
    this.items = this.loadCart();
    this.appliedCoupon = null;
    this.coupons = {
      'SERAG10': { type: 'percent', value: 10, code: 'SERAG10' },
      'WELCOME': { type: 'fixed', value: 100, code: 'WELCOME' },
      'VIP2026': { type: 'percent', value: 15, code: 'VIP2026' }
    };

    this.init();
  }

  init() {
    this.updateCartBadge();
    this.renderCartDrawer();
  }

  loadCart() {
    try {
      const saved = localStorage.getItem('serag_cart_items');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Failed to load cart:', e);
      return [];
    }
  }

  saveCart() {
    localStorage.setItem('serag_cart_items', JSON.stringify(this.items));
    this.updateCartBadge();
    this.renderCartDrawer();
  }

  addItem(product, quantity = 1) {
    const existingIndex = this.items.findIndex(item => item.id === product.id);
    if (existingIndex > -1) {
      this.items[existingIndex].quantity += quantity;
    } else {
      this.items.push({
        id: product.id,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        category: product.category,
        price: product.price,
        volume: product.volume,
        image: product.image,
        customImage: product.customImage,
        shape: product.shape,
        themeColor: product.themeColor,
        quantity: quantity
      });
    }

    this.saveCart();
    this.showToast((document.dir === 'rtl' ? 'تمت إضافة ' : 'Added ') + (document.dir === 'rtl' ? product.nameAr : product.nameEn) + (document.dir === 'rtl' ? ' إلى سلة التسوق' : ' to cart'));
    this.animateCartBadge();
  }

  removeItem(productId) {
    this.items = this.items.filter(item => item.id !== productId);
    this.saveCart();
    this.showToast(document.dir === 'rtl' ? 'تم حذف المنتج من السلة' : 'Item removed from cart');
  }

  updateQuantity(productId, delta) {
    const item = this.items.find(item => item.id === productId);
    if (!item) return;

    item.quantity += delta;
    if (item.quantity <= 0) {
      this.removeItem(productId);
    } else {
      this.saveCart();
    }
  }

  clearCart() {
    this.items = [];
    this.appliedCoupon = null;
    this.saveCart();
  }

  getSubtotal() {
    return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  }

  getDiscount() {
    if (!this.appliedCoupon) return 0;
    const subtotal = this.getSubtotal();
    if (this.appliedCoupon.type === 'percent') {
      return Math.round(subtotal * (this.appliedCoupon.value / 100));
    }
    return Math.min(subtotal, this.appliedCoupon.value);
  }

  getTotal() {
    return Math.max(0, this.getSubtotal() - this.getDiscount());
  }

  getTotalItemsCount() {
    return this.items.reduce((sum, item) => sum + item.quantity, 0);
  }

  applyCoupon(code) {
    const cleanCode = (code || '').trim().toUpperCase();
    if (this.coupons[cleanCode]) {
      this.appliedCoupon = this.coupons[cleanCode];
      this.saveCart();
      this.showToast(document.dir === 'rtl' ? 'تم تطبيق كود الخصم بنجاح!' : 'Coupon applied successfully!');
      return true;
    }
    this.showToast(document.dir === 'rtl' ? 'كود الخصم غير صالح' : 'Invalid coupon code');
    return false;
  }

  removeCoupon() {
    this.appliedCoupon = null;
    this.saveCart();
  }

  updateCartBadge() {
    const count = this.getTotalItemsCount();
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(badge => {
      badge.textContent = count;
      badge.classList.toggle('hidden', count === 0);
    });
  }

  animateCartBadge() {
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach(badge => {
      badge.classList.add('scale-125', 'bg-amber-400');
      setTimeout(() => {
        badge.classList.remove('scale-125', 'bg-amber-400');
      }, 300);
    });
  }

  renderCartDrawer() {
    const container = document.getElementById('cart-items-list');
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const totalEl = document.getElementById('cart-total');
    const discountRow = document.getElementById('cart-discount-row');
    const emptyState = document.getElementById('cart-empty-state');
    const footerState = document.getElementById('cart-footer-section');

    if (!container) return;

    if (this.items.length === 0) {
      if (emptyState) emptyState.classList.remove('hidden');
      if (footerState) footerState.classList.add('hidden');
      container.innerHTML = '';
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (footerState) footerState.classList.remove('hidden');

    const isRtl = document.dir === 'rtl';

    container.innerHTML = this.items.map(item => {
      return `
        <div class="flex items-center gap-4 py-4 border-b border-gray-100 dark:border-slate-800">
          <div class="w-16 h-20 bg-slate-50 dark:bg-slate-900 rounded-lg flex items-center justify-center p-1 border border-amber-200/40 shrink-0">
            ${getBottleSVG(item)}
          </div>
          <div class="flex-1 min-w-0">
            <h4 class="font-bold text-sm text-slate-900 dark:text-white truncate">${isRtl ? item.nameAr : item.nameEn}</h4>
            <p class="text-xs text-amber-700 dark:text-amber-400 font-semibold mt-0.5">${item.price.toLocaleString()} EGP</p>
            <div class="flex items-center gap-3 mt-2">
              <div class="flex items-center border border-slate-200 dark:border-slate-700 rounded-full px-2 py-0.5 bg-white dark:bg-slate-800">
                <button onclick="window.seragCart.updateQuantity(${item.id}, -1)" class="text-xs text-slate-500 hover:text-slate-900 px-1 font-bold">-</button>
                <span class="text-xs font-bold px-2 text-slate-800 dark:text-slate-200">${item.quantity}</span>
                <button onclick="window.seragCart.updateQuantity(${item.id}, 1)" class="text-xs text-slate-500 hover:text-slate-900 px-1 font-bold">+</button>
              </div>
              <button onclick="window.seragCart.removeItem(${item.id})" class="text-xs text-red-500 hover:text-red-700 font-medium">
                ${isRtl ? 'حذف' : 'Remove'}
              </button>
            </div>
          </div>
          <div class="text-right font-bold text-sm text-slate-900 dark:text-white">
            ${(item.price * item.quantity).toLocaleString()} <span class="text-xs text-slate-500 font-normal">EGP</span>
          </div>
        </div>
      `;
    }).join('');

    const subtotal = this.getSubtotal();
    const discount = this.getDiscount();
    const total = this.getTotal();

    if (subtotalEl) subtotalEl.textContent = subtotal.toLocaleString() + ' EGP';
    if (discountEl) discountEl.textContent = '- ' + discount.toLocaleString() + ' EGP';
    if (totalEl) totalEl.textContent = total.toLocaleString() + ' EGP';
    if (discountRow) discountRow.classList.toggle('hidden', discount === 0);
  }

  // Single Item Direct WhatsApp Order
  orderSingleOnWhatsApp(product) {
    const isRtl = document.dir === 'rtl';
    let message = '';

    if (isRtl) {
      message = `مرحباً سراج للعطور، أود طلب:

✨ *${product.nameAr} (${product.nameEn})*
💰 السعر: *${product.price.toLocaleString()} ج.م*
💎 الحجم: *${product.volume}*

يرجى تأكيد توفر المنتج وتفاصيل التوصيل. شكراً لكم!`;
    } else {
      message = `Hello Serag Fragrances, I would like to order: ${product.nameEn} (${product.nameAr}) - ${product.price.toLocaleString()} EGP.
Volume: ${product.volume}.
Please confirm availability and delivery. Thank you!`;
    }

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${SERAG_PHONE}?text=${encoded}`, '_blank');
  }

  // Full Cart WhatsApp Checkout
  checkoutCartWhatsApp(customerDetails = {}) {
    if (this.items.length === 0) {
      this.showToast(document.dir === 'rtl' ? 'السلة فارغة حالياً!' : 'Your cart is empty!');
      return;
    }

    const isRtl = document.dir === 'rtl';
    const name = customerDetails.name || (isRtl ? 'عميل سراج' : 'Valued Customer');
    const phone = customerDetails.phone || '-';
    const city = customerDetails.city || (isRtl ? 'المنوفية / مصر' : 'Egypt');
    const address = customerDetails.address || '-';
    const notes = customerDetails.notes || (isRtl ? 'لا توجد' : 'None');

    let msg = '';

    if (isRtl) {
      msg += `✨ *طلب جديد من متجر SERAG FRAGRANCES* ✨
`;
      msg += `━━━━━━━━━━━━━━━━━━━━━
`;
      msg += `👤 *اسم العميل:* ${name}
`;
      msg += `📞 *رقم الهاتف:* ${phone}
`;
      msg += `📍 *المحافظة / المدينة:* ${city}
`;
      msg += `🏠 *العنوان بالتفصيل:* ${address}
`;
      if (notes && notes !== 'لا توجد') {
        msg += `📝 *ملاحظات إضافية:* ${notes}
`;
      }
      msg += `━━━━━━━━━━━━━━━━━━━━━
`;
      msg += `🛍️ *المنتجات المطلوبة:*
`;

      this.items.forEach((item, index) => {
        msg += `${index + 1}. *${item.nameAr}* (${item.nameEn})
`;
        msg += `   الكمية: ${item.quantity} × ${item.price.toLocaleString()} ج.م = *${(item.quantity * item.price).toLocaleString()} ج.م*
`;
      });

      msg += `━━━━━━━━━━━━━━━━━━━━━
`;
      msg += `💰 *المجموع:* ${this.getSubtotal().toLocaleString()} ج.م
`;
      if (this.getDiscount() > 0) {
        msg += `🎟️ *الخصم (${this.appliedCoupon.code}):* -${this.getDiscount().toLocaleString()} ج.م
`;
      }
      msg += `🚚 *الشحن:* مجاناً لكافة المحافظات
`;
      msg += `💎 *الإجمالي النهائي:* *${this.getTotal().toLocaleString()} ج.م*
`;
      msg += `━━━━━━━━━━━━━━━━━━━━━
`;
      msg += `🌟 *سراج للعطور - SERAG FRAGRANCES*`;
    } else {
      msg += `✨ *New Order - SERAG FRAGRANCES* ✨
`;
      msg += `━━━━━━━━━━━━━━━━━━━━━
`;
      msg += `👤 *Customer Name:* ${name}
`;
      msg += `📞 *Phone:* ${phone}
`;
      msg += `📍 *City / Governorate:* ${city}
`;
      msg += `🏠 *Address:* ${address}
`;
      if (notes && notes !== 'None') {
        msg += `📝 *Notes:* ${notes}
`;
      }
      msg += `━━━━━━━━━━━━━━━━━━━━━
`;
      msg += `🛍️ *Order Items:*
`;

      this.items.forEach((item, index) => {
        msg += `${index + 1}. *${item.nameEn}* (${item.nameAr})
`;
        msg += `   Qty: ${item.quantity} × ${item.price.toLocaleString()} EGP = *${(item.quantity * item.price).toLocaleString()} EGP*
`;
      });

      msg += `━━━━━━━━━━━━━━━━━━━━━
`;
      msg += `💰 *Subtotal:* ${this.getSubtotal().toLocaleString()} EGP
`;
      if (this.getDiscount() > 0) {
        msg += `🎟️ *Discount (${this.appliedCoupon.code}):* -${this.getDiscount().toLocaleString()} EGP
`;
      }
      msg += `🚚 *Shipping:* Free Delivery across Egypt
`;
      msg += `💎 *Grand Total:* *${this.getTotal().toLocaleString()} EGP*
`;
      msg += `━━━━━━━━━━━━━━━━━━━━━
`;
      msg += `🌟 *SERAG FRAGRANCES - Your Scent Never Fades*`;
    }

    const encoded = encodeURIComponent(msg);
    window.open(`https://wa.me/${SERAG_PHONE}?text=${encoded}`, '_blank');
  }

  showToast(text) {
    let container = document.getElementById('toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = 'toast-message';
    toast.innerHTML = `
      <div class="w-8 h-8 rounded-full bg-amber-400/20 flex items-center justify-center text-amber-400 shrink-0">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg>
      </div>
      <div class="text-sm font-medium text-white flex-1">${text}</div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }
}

// Global instance
window.seragCart = new SeragCart();
