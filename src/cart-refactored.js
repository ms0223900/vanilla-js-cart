/**
 * 重構後的購物車系統 - 遵循 SOLID 原則和 Clean Code
 * Refactored Shopping Cart System - Following SOLID Principles and Clean Code
 */

// ==================== 領域模型 / Domain Models ====================

/**
 * 商品模型 / Product Model
 */
class Product {
    constructor(id, name, price, image, description) {
        this.id = id;
        this.name = name;
        this.price = price;
        this.image = image;
        this.description = description;
    }

    /**
     * 驗證商品資料是否有效 / Validate if product data is valid
     */
    isValid() {
        return this.id && this.name && this.price > 0 && this.image;
    }

    /**
     * 計算商品總價 / Calculate total price for quantity
     */
    calculateTotal(quantity) {
        return this.price * quantity;
    }
}

/**
 * 購物車項目模型 / Cart Item Model
 */
class CartItem {
    constructor(product, quantity = 1) {
        this.id = product.id;
        this.name = product.name;
        this.price = product.price;
        this.image = product.image;
        this.quantity = quantity;
    }

    /**
     * 更新數量 / Update quantity
     */
    updateQuantity(newQuantity) {
        if (newQuantity <= 0) {
            throw new Error('Quantity must be greater than 0');
        }
        this.quantity = newQuantity;
    }

    /**
     * 增加數量 / Increase quantity
     */
    increaseQuantity(amount = 1) {
        this.quantity += amount;
    }

    /**
     * 減少數量 / Decrease quantity
     */
    decreaseQuantity(amount = 1) {
        if (this.quantity - amount <= 0) {
            throw new Error('Quantity cannot be less than 1');
        }
        this.quantity -= amount;
    }

    /**
     * 計算項目總價 / Calculate item total price
     */
    getTotalPrice() {
        return this.price * this.quantity;
    }

    /**
     * 轉換為 JSON 格式 / Convert to JSON format
     */
    toJSON() {
        return {
            id: this.id,
            name: this.name,
            price: this.price,
            image: this.image,
            quantity: this.quantity
        };
    }

    /**
     * 從 JSON 建立 CartItem / Create CartItem from JSON
     */
    static fromJSON(json) {
        const cartItem = new CartItem({
            id: json.id,
            name: json.name,
            price: json.price,
            image: json.image
        }, json.quantity);
        return cartItem;
    }
}

/**
 * 購物車模型 / Cart Model
 */
class Cart {
    constructor() {
        this.items = new Map();
    }

    /**
     * 添加商品到購物車 / Add product to cart
     */
    addProduct(product, quantity = 1) {
        if (!product.isValid()) {
            throw new Error('Invalid product data');
        }

        if (this.items.has(product.id)) {
            this.items.get(product.id).increaseQuantity(quantity);
        } else {
            this.items.set(product.id, new CartItem(product, quantity));
        }
    }

    /**
     * 移除商品 / Remove product from cart
     */
    removeProduct(productId) {
        return this.items.delete(productId);
    }

    /**
     * 更新商品數量 / Update product quantity
     */
    updateQuantity(productId, quantity) {
        if (quantity <= 0) {
            return this.removeProduct(productId);
        }

        const item = this.items.get(productId);
        if (item) {
            item.updateQuantity(quantity);
            return true;
        }
        return false;
    }

    /**
     * 清空購物車 / Clear cart
     */
    clear() {
        this.items.clear();
    }

    /**
     * 取得商品 / Get product by ID
     */
    getProduct(productId) {
        return this.items.get(productId);
    }

    /**
     * 取得所有商品 / Get all products
     */
    getAllProducts() {
        return Array.from(this.items.values());
    }

    /**
     * 計算總數量 / Calculate total quantity
     */
    getTotalQuantity() {
        return Array.from(this.items.values())
            .reduce((total, item) => total + item.quantity, 0);
    }

    /**
     * 計算總金額 / Calculate total price
     */
    getTotalPrice() {
        return Array.from(this.items.values())
            .reduce((total, item) => total + item.getTotalPrice(), 0);
    }

    /**
     * 檢查購物車是否為空 / Check if cart is empty
     */
    isEmpty() {
        return this.items.size === 0;
    }

    /**
     * 取得購物車項目數量 / Get number of different products
     */
    getItemCount() {
        return this.items.size;
    }

    /**
     * 轉換為 JSON 格式 / Convert to JSON format
     */
    toJSON() {
        return Array.from(this.items.values()).map(item => item.toJSON());
    }

    /**
     * 從 JSON 建立 Cart / Create Cart from JSON
     */
    static fromJSON(jsonArray) {
        const cart = new Cart();
        jsonArray.forEach(itemJson => {
            const cartItem = CartItem.fromJSON(itemJson);
            cart.items.set(cartItem.id, cartItem);
        });
        return cart;
    }
}

// ==================== 服務介面 / Service Interfaces ====================

/**
 * 儲存服務介面 / Storage Service Interface
 */
class IStorageService {
    save(key, data) {
        throw new Error('Method must be implemented');
    }

    load(key) {
        throw new Error('Method must be implemented');
    }

    remove(key) {
        throw new Error('Method must be implemented');
    }

    clear() {
        throw new Error('Method must be implemented');
    }
}

/**
 * 通知服務介面 / Notification Service Interface
 */
class INotificationService {
    show(message) {
        throw new Error('Method must be implemented');
    }
}

/**
 * DOM 服務介面 / DOM Service Interface
 */
class IDOMService {
    updateCartCount(count) {
        throw new Error('Method must be implemented');
    }

    updateCartDisplay(cart) {
        throw new Error('Method must be implemented');
    }

    showEmptyCart() {
        throw new Error('Method must be implemented');
    }

    hideEmptyCart() {
        throw new Error('Method must be implemented');
    }
}

// ==================== 服務實作 / Service Implementations ====================

/**
 * LocalStorage 儲存服務 / LocalStorage Storage Service
 */
class LocalStorageService extends IStorageService {
    constructor() {
        super();
        this.storageKey = 'shoppingCart';
    }

    save(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error('Failed to save to localStorage:', error);
            throw new Error('Storage save failed');
        }
    }

    load(key) {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error('Failed to load from localStorage:', error);
            return null;
        }
    }

    remove(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error('Failed to remove from localStorage:', error);
        }
    }

    clear() {
        try {
            localStorage.clear();
        } catch (error) {
            console.error('Failed to clear localStorage:', error);
        }
    }

    saveCart(cart) {
        this.save(this.storageKey, cart.toJSON());
    }

    loadCart() {
        const data = this.load(this.storageKey);
        return data ? Cart.fromJSON(data) : new Cart();
    }
}

/**
 * 通知服務 / Notification Service
 */
class NotificationService extends INotificationService {
    constructor() {
        super();
        this.notificationDuration = 3000;
        this.animationDuration = 300;
    }

    show(message) {
        const notification = this.createNotificationElement(message);
        document.body.appendChild(notification);

        // 顯示動畫
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);

        // 自動隱藏
        setTimeout(() => {
            this.hideNotification(notification);
        }, this.notificationDuration);
    }

    createNotificationElement(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        return notification;
    }

    hideNotification(notification) {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, this.animationDuration);
    }
}

/**
 * DOM 服務 / DOM Service
 */
class DOMService extends IDOMService {
    constructor() {
        super();
        this.selectors = {
            cartCount: '#cart-count',
            cartItems: '#cart-items',
            cartTotal: '#cart-total',
            emptyCart: '#empty-cart'
        };
    }

    updateCartCount(count) {
        const countElement = document.querySelector(this.selectors.cartCount);
        if (countElement) {
            countElement.textContent = count;
        }
    }

    updateCartDisplay(cart) {
        const cartContainer = document.querySelector(this.selectors.cartItems);
        const cartTotalElement = document.querySelector(this.selectors.cartTotal);

        if (!cartContainer) return;

        if (cart.isEmpty()) {
            this.showEmptyCart();
            cartContainer.innerHTML = '';
            if (cartTotalElement) cartTotalElement.style.display = 'none';
            return;
        }

        this.hideEmptyCart();
        if (cartTotalElement) cartTotalElement.style.display = 'block';

        cartContainer.innerHTML = this.generateCartItemsHTML(cart);
        this.updateCartTotal(cart);
    }

    showEmptyCart() {
        const emptyCartElement = document.querySelector(this.selectors.emptyCart);
        if (emptyCartElement) {
            emptyCartElement.style.display = 'block';
        }
    }

    hideEmptyCart() {
        const emptyCartElement = document.querySelector(this.selectors.emptyCart);
        if (emptyCartElement) {
            emptyCartElement.style.display = 'none';
        }
    }

    generateCartItemsHTML(cart) {
        return cart.getAllProducts()
            .map(item => this.generateCartItemHTML(item))
            .join('');
    }

    generateCartItemHTML(item) {
        return `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-details">
                    <h3>${item.name}</h3>
                    <p class="item-price">NT$ ${item.price.toLocaleString()}</p>
                </div>
                <div class="item-controls">
                    <button class="quantity-btn" onclick="changeQuantity('${item.id}', ${item.quantity - 1})">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="changeQuantity('${item.id}', ${item.quantity + 1})">+</button>
                </div>
                <div class="item-total">
                    NT$ ${item.getTotalPrice().toLocaleString()}
                </div>
                <button class="remove-btn" onclick="removeFromCart('${item.id}')">移除</button>
            </div>
        `;
    }

    updateCartTotal(cart) {
        const cartTotalElement = document.querySelector(this.selectors.cartTotal);
        if (cartTotalElement) {
            const total = cart.getTotalPrice();
            cartTotalElement.innerHTML = `
                <div class="total-summary">
                    <h3>總計: NT$ ${total.toLocaleString()}</h3>
                    <button class="clear-cart-btn" onclick="clearAllCart()">清空購物車</button>
                </div>
            `;
        }
    }
}

// ==================== 購物車服務 / Cart Service ====================

/**
 * 購物車服務 / Cart Service
 * 遵循單一職責原則，只負責購物車業務邏輯
 */
class CartService {
    constructor(storageService, notificationService, domService) {
        this.cart = new Cart();
        this.storageService = storageService;
        this.notificationService = notificationService;
        this.domService = domService;
    }

    /**
     * 初始化購物車 / Initialize cart
     */
    initialize() {
        try {
            this.cart = this.storageService.loadCart();
            this.updateDisplay();
        } catch (error) {
            console.error('Failed to initialize cart:', error);
            this.cart = new Cart();
        }
    }

    /**
     * 添加商品到購物車 / Add product to cart
     */
    addToCart(productData) {
        try {
            const product = new Product(
                productData.id,
                productData.name,
                productData.price,
                productData.image,
                productData.description
            );

            this.cart.addProduct(product);
            this.saveAndUpdate();
            this.notificationService.show(`${product.name} 已添加到購物車`);
        } catch (error) {
            console.error('Failed to add product to cart:', error);
            this.notificationService.show('添加商品失敗');
        }
    }

    /**
     * 從購物車移除商品 / Remove product from cart
     */
    removeFromCart(productId) {
        try {
            const removed = this.cart.removeProduct(productId);
            if (removed) {
                this.saveAndUpdate();
                this.notificationService.show('商品已從購物車移除');
            }
        } catch (error) {
            console.error('Failed to remove product from cart:', error);
        }
    }

    /**
     * 更新商品數量 / Update product quantity
     */
    changeQuantity(productId, newQuantity) {
        try {
            const updated = this.cart.updateQuantity(productId, newQuantity);
            if (updated) {
                this.saveAndUpdate();
            }
        } catch (error) {
            console.error('Failed to update quantity:', error);
        }
    }

    /**
     * 清空購物車 / Clear cart
     */
    clearAllCart() {
        try {
            this.cart.clear();
            this.saveAndUpdate();
            this.notificationService.show('購物車已清空');
        } catch (error) {
            console.error('Failed to clear cart:', error);
        }
    }

    /**
     * 取得購物車狀態 / Get cart status
     */
    getCartStatus() {
        return {
            items: this.cart.getAllProducts(),
            totalQuantity: this.cart.getTotalQuantity(),
            totalPrice: this.cart.getTotalPrice(),
            isEmpty: this.cart.isEmpty(),
            itemCount: this.cart.getItemCount()
        };
    }

    /**
     * 儲存並更新顯示 / Save and update display
     */
    saveAndUpdate() {
        this.storageService.saveCart(this.cart);
        this.updateDisplay();
    }

    /**
     * 更新顯示 / Update display
     */
    updateDisplay() {
        this.domService.updateCartCount(this.cart.getTotalQuantity());
        this.domService.updateCartDisplay(this.cart);
    }

    /**
     * 重置購物車 / Reset cart
     */
    reset() {
        this.cart.clear();
        this.storageService.clear();
        this.updateDisplay();
    }
}

// ==================== 商品服務 / Product Service ====================

/**
 * 商品服務 / Product Service
 */
class ProductService {
    constructor() {
        this.products = [
            new Product('1', 'iPhone 15 Pro', 36900, 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro', '最新的 iPhone 15 Pro，搭載 A17 Pro 晶片'),
            new Product('2', 'MacBook Air M2', 37900, 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook+Air', '輕薄便攜的 MacBook Air，搭載 M2 晶片'),
            new Product('3', 'AirPods Pro', 7490, 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro', '主動降噪的無線耳機'),
            new Product('4', 'Apple Watch Series 9', 12900, 'https://via.placeholder.com/200x200/FF9500/FFFFFF?text=Apple+Watch', '健康監測與運動追蹤的智慧手錶'),
            new Product('5', 'iPad Air', 18900, 'https://via.placeholder.com/200x200/5856D6/FFFFFF?text=iPad+Air', '多功能平板電腦，適合工作與娛樂'),
            new Product('6', 'Magic Keyboard', 10900, 'https://via.placeholder.com/200x200/8E8E93/FFFFFF?text=Magic+Keyboard', '為 iPad 設計的鍵盤保護套')
        ];
    }

    /**
     * 取得所有商品 / Get all products
     */
    async getAllProducts() {
        // 模擬非同步操作
        await new Promise(resolve => setTimeout(resolve, 1300));
        return this.products;
    }

    /**
     * 根據 ID 取得商品 / Get product by ID
     */
    getProductById(id) {
        return this.products.find(product => product.id === id);
    }
}

// ==================== 應用程式初始化 / Application Initialization ====================

/**
 * 應用程式類別 / Application Class
 * 負責依賴注入和初始化
 */
class ShoppingCartApp {
    constructor() {
        this.initializeServices();
        this.initializeCartService();
    }

    /**
     * 初始化服務 / Initialize services
     */
    initializeServices() {
        this.storageService = new LocalStorageService();
        this.notificationService = new NotificationService();
        this.domService = new DOMService();
        this.productService = new ProductService();
    }

    /**
     * 初始化購物車服務 / Initialize cart service
     */
    initializeCartService() {
        this.cartService = new CartService(
            this.storageService,
            this.notificationService,
            this.domService
        );
    }

    /**
     * 啟動應用程式 / Start application
     */
    start() {
        this.cartService.initialize();
        this.renderProducts();
    }

    /**
     * 渲染商品列表 / Render products list
     */
    async renderProducts() {
        const container = document.getElementById('products-container');
        if (!container) return;

        try {
            container.innerHTML = '<div class="loading">載入中...</div>';
            const products = await this.productService.getAllProducts();
            container.innerHTML = this.generateProductsHTML(products);
        } catch (error) {
            console.error('Failed to load products:', error);
            container.innerHTML = '<div class="error">載入商品失敗</div>';
        }
    }

    /**
     * 生成商品 HTML / Generate products HTML
     */
    generateProductsHTML(products) {
        return products.map(product => `
            <div class="product-card">
                <div class="product-image">
                    <img src="${product.image}" alt="${product.name}">
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p class="product-description">${product.description}</p>
                    <p class="product-price">NT$ ${product.price.toLocaleString()}</p>
                    <button class="add-to-cart-btn" onclick="cartService.addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                        加入購物車
                    </button>
                </div>
            </div>
        `).join('');
    }
}

// ==================== 全域變數和初始化 / Global Variables and Initialization ====================

// 建立應用程式實例 / Create application instance
let shoppingCartApp;
let cartService;

// 頁面載入完成後初始化 / Initialize when page loads
function initializeApp() {
    try {
        shoppingCartApp = new ShoppingCartApp();
        cartService = shoppingCartApp.cartService;
        shoppingCartApp.start();
    } catch (error) {
        console.error('Failed to initialize shopping cart app:', error);
    }
}

// 檢查是否在瀏覽器環境中 / Check if in browser environment
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeApp);
    } else {
        initializeApp();
    }
}

// 確保在測試環境中也能正常運作 / Ensure it works in test environment
if (typeof cartService === 'undefined') {
    try {
        shoppingCartApp = new ShoppingCartApp();
        cartService = shoppingCartApp.cartService;
    } catch (error) {
        console.error('Failed to initialize for testing:', error);
    }
}

// 為了向後相容，建立全域變數 / Create global variables for backward compatibility
let cartItems = [];
let cartCount = 0;
let cartTotal = 0;

// 同步全域變數與購物車服務 / Sync global variables with cart service
function syncGlobalVariables() {
    if (cartService) {
        const status = cartService.getCartStatus();
        cartItems = status.items;
        cartCount = status.totalQuantity;
        cartTotal = status.totalPrice;
    }
}

// 為了向後相容，保留原有的全域函數 / Keep original global functions for backward compatibility
function addToCart(product) {
    if (cartService) {
        cartService.addToCart(product);
        syncGlobalVariables();
    }
}

function removeFromCart(productId) {
    if (cartService) {
        cartService.removeFromCart(productId);
        syncGlobalVariables();
    }
}

function changeQuantity(productId, newQuantity) {
    if (cartService) {
        cartService.changeQuantity(productId, newQuantity);
        syncGlobalVariables();
    }
}

function clearAllCart() {
    if (cartService) {
        cartService.clearAllCart();
        syncGlobalVariables();
    }
}

function updateCartCount() {
    if (cartService) {
        cartService.updateDisplay();
        syncGlobalVariables();
    }
}

function updateCartDisplay() {
    if (cartService) {
        cartService.updateDisplay();
        syncGlobalVariables();
    }
}

function calculateTotal() {
    if (cartService) {
        const total = cartService.getCartStatus().totalPrice;
        cartTotal = total;
        return total;
    }
    return 0;
}

function showMessage(message) {
    if (shoppingCartApp && shoppingCartApp.notificationService) {
        shoppingCartApp.notificationService.show(message);
    }
}

// 除錯和重置函數 / Debug and reset functions
function debugCart() {
    if (cartService) {
        const status = cartService.getCartStatus();
        console.log('購物車內容:', status.items);
        console.log('總數量:', status.totalQuantity);
        console.log('總金額:', status.totalPrice);
    }
}

function resetEverything() {
    if (cartService) {
        cartService.reset();
        syncGlobalVariables();
    }
}

// 其他向後相容的函數 / Other backward compatibility functions
function forceUpdate() {
    if (cartService) {
        cartService.updateDisplay();
    }
}

function validateCart() {
    if (cartService) {
        const status = cartService.getCartStatus();
        return status.items.every(item => item.id && item.name && item.price > 0);
    }
    return true;
}

function getCartItemCount() {
    if (cartService) {
        return cartService.getCartStatus().totalQuantity;
    }
    return 0;
}

function getCartTotalPrice() {
    if (cartService) {
        return cartService.getCartStatus().totalPrice;
    }
    return 0;
}

// 商品相關函數 / Product related functions
async function fetchProducts() {
    if (shoppingCartApp && shoppingCartApp.productService) {
        return await shoppingCartApp.productService.getAllProducts();
    }
    return [];
}

async function renderProductsList() {
    if (shoppingCartApp) {
        await shoppingCartApp.renderProducts();
    }
}

// 頁面載入完成事件 / Page load complete event
window.onload = function () {
    console.log('頁面載入完成');
    debugCart();
    validateCart();
    forceUpdate();
};
