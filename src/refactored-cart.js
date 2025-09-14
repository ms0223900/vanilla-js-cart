// 購物車核心功能
class ShoppingCart {
    constructor() {
        this.items = this.loadCart();
        this.updateCartDisplay();
    }

    // 從 localStorage 載入購物車資料
    loadCart() {
        const savedCart = localStorage.getItem('shoppingCart');
        return savedCart ? JSON.parse(savedCart) : [];
    }

    // 儲存購物車資料到 localStorage
    saveCart() {
        localStorage.setItem('shoppingCart', JSON.stringify(this.items));
    }

    // 添加商品到購物車
    addItem(product) {
        const existingItem = this.items.find(item => item.id === product.id);

        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }

        this.saveCart();
        this.updateCartDisplay();
        this.showNotification(`${product.name} 已添加到購物車`);
    }

    // 從購物車移除商品
    removeItem(productId) {
        this.items = this.items.filter(item => item.id !== productId);
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('商品已從購物車移除');
    }

    // 更新商品數量
    updateQuantity(productId, newQuantity) {
        const item = this.items.find(item => item.id === productId);
        if (item) {
            if (newQuantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = newQuantity;
                this.saveCart();
                this.updateCartDisplay();
            }
        }
    }

    // 清空購物車
    clearCart() {
        this.items = [];
        this.saveCart();
        this.updateCartDisplay();
        this.showNotification('購物車已清空');
    }

    // 計算總金額
    getTotal() {
        return this.items.reduce((total, item) => total + (item.price * item.quantity), 0);
    }

    // 計算商品總數
    getItemCount() {
        return this.items.reduce((count, item) => count + item.quantity, 0);
    }

    // 更新購物車顯示
    updateCartDisplay() {
        // 更新購物車圖標上的數量
        const cartCount = document.getElementById('cart-count');
        if (cartCount) {
            cartCount.textContent = this.getItemCount();
        }

        // 更新購物車頁面內容
        this.renderCartPage();
    }

    // 渲染購物車頁面
    renderCartPage() {
        const cartContainer = document.getElementById('cart-items');
        const cartTotal = document.getElementById('cart-total');
        const emptyCart = document.getElementById('empty-cart');

        if (!cartContainer) return;

        if (this.items.length === 0) {
            cartContainer.innerHTML = '';
            if (emptyCart) emptyCart.style.display = 'block';
            if (cartTotal) cartTotal.style.display = 'none';
            return;
        }

        if (emptyCart) emptyCart.style.display = 'none';
        if (cartTotal) cartTotal.style.display = 'block';

        cartContainer.innerHTML = this.items.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">NT$ ${item.price.toLocaleString()}</p>
                </div>
                <div class="item-controls">
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="cart.updateQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">
                    NT$ ${(item.price * item.quantity).toLocaleString()}
                </div>
                <button class="remove-btn" onclick="cart.removeItem('${item.id}')">移除</button>
            </div>
        `).join('');

        if (cartTotal) {
            cartTotal.innerHTML = `
                <div class="total-summary">
                    <h3>總計: NT$ ${this.getTotal().toLocaleString()}</h3>
                    <button class="clear-cart-btn" onclick="cart.clearCart()">清空購物車</button>
                </div>
            `;
        }
    }

    // 顯示通知訊息
    showNotification(message) {
        // 創建通知元素
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;

        // 添加到頁面
        document.body.appendChild(notification);

        // 顯示動畫
        setTimeout(() => notification.classList.add('show'), 100);

        // 3秒後移除
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => document.body.removeChild(notification), 300);
        }, 3000);
    }
}

// 商品資料
const products = [
    {
        id: '1',
        name: 'iPhone 15 Pro',
        price: 36900,
        image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro',
        description: '最新的 iPhone 15 Pro，搭載 A17 Pro 晶片'
    },
    {
        id: '2',
        name: 'MacBook Air M2',
        price: 37900,
        image: 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook+Air',
        description: '輕薄便攜的 MacBook Air，搭載 M2 晶片'
    },
    {
        id: '3',
        name: 'AirPods Pro',
        price: 7490,
        image: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro',
        description: '主動降噪的無線耳機'
    },
    {
        id: '4',
        name: 'Apple Watch Series 9',
        price: 12900,
        image: 'https://via.placeholder.com/200x200/FF9500/FFFFFF?text=Apple+Watch',
        description: '健康監測與運動追蹤的智慧手錶'
    },
    {
        id: '5',
        name: 'iPad Air',
        price: 18900,
        image: 'https://via.placeholder.com/200x200/5856D6/FFFFFF?text=iPad+Air',
        description: '多功能平板電腦，適合工作與娛樂'
    },
    {
        id: '6',
        name: 'Magic Keyboard',
        price: 10900,
        image: 'https://via.placeholder.com/200x200/8E8E93/FFFFFF?text=Magic+Keyboard',
        description: '為 iPad 設計的鍵盤保護套'
    }
];

// 初始化購物車
let cart;

// 當頁面載入完成時初始化
document.addEventListener('DOMContentLoaded', function () {
    cart = new ShoppingCart();

    // 如果是商品頁面，渲染商品列表
    if (document.getElementById('products-container')) {
        renderProducts();
    }
});

// 渲染商品列表
function renderProducts() {
    const container = document.getElementById('products-container');
    if (!container) return;

    container.innerHTML = products.map(product => `
        <div class="product-card">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}">
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-description">${product.description}</p>
                <p class="product-price">NT$ ${product.price.toLocaleString()}</p>
                <button class="add-to-cart-btn" onclick="cart.addItem(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                    加入購物車
                </button>
            </div>
        </div>
    `).join('');
}
