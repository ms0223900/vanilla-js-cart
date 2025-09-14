// 函數式購物車重構版本 - 遵循 Clean Code 和函數式程式設計原則

// ============================================================================
// 資料結構和常數定義
// ============================================================================

/**
 * 商品資料結構
 * @typedef {Object} Product
 * @property {string} id - 商品 ID
 * @property {string} name - 商品名稱
 * @property {number} price - 商品價格
 * @property {string} image - 商品圖片 URL
 * @property {string} description - 商品描述
 */

/**
 * 購物車項目資料結構
 * @typedef {Object} CartItem
 * @property {string} id - 商品 ID
 * @property {string} name - 商品名稱
 * @property {number} price - 商品價格
 * @property {string} image - 商品圖片 URL
 * @property {number} quantity - 數量
 */

/**
 * 購物車狀態資料結構
 * @typedef {Object} CartState
 * @property {CartItem[]} items - 購物車項目
 * @property {number} totalCount - 總數量
 * @property {number} totalPrice - 總價格
 */

// 商品資料
const PRODUCTS = [
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

// 本地儲存鍵值
const STORAGE_KEYS = {
    CART: 'shoppingCart'
};

// DOM 元素 ID
const DOM_IDS = {
    CART_COUNT: 'cart-count',
    CART_ITEMS: 'cart-items',
    CART_TOTAL: 'cart-total',
    EMPTY_CART: 'empty-cart',
    PRODUCTS_CONTAINER: 'products-container'
};

// ============================================================================
// 純函數 - 購物車邏輯運算
// ============================================================================

/**
 * 創建空的購物車狀態
 * @returns {CartState} 空的購物車狀態
 */
const createEmptyCart = () => ({
    items: [],
    totalCount: 0,
    totalPrice: 0
});

/**
 * 計算購物車項目的總數量
 * @param {CartItem[]} items - 購物車項目陣列
 * @returns {number} 總數量
 */
const calculateTotalCount = (items) =>
    items.reduce((total, item) => total + item.quantity, 0);

/**
 * 計算購物車項目的總價格
 * @param {CartItem[]} items - 購物車項目陣列
 * @returns {number} 總價格
 */
const calculateTotalPrice = (items) =>
    items.reduce((total, item) => total + (item.price * item.quantity), 0);

/**
 * 更新購物車狀態的計算屬性
 * @param {CartState} cartState - 購物車狀態
 * @returns {CartState} 更新後的購物車狀態
 */
const updateCartCalculations = (cartState) => ({
    ...cartState,
    totalCount: calculateTotalCount(cartState.items),
    totalPrice: calculateTotalPrice(cartState.items)
});

/**
 * 根據商品 ID 查找購物車項目
 * @param {CartItem[]} items - 購物車項目陣列
 * @param {string} productId - 商品 ID
 * @returns {CartItem|undefined} 找到的購物車項目
 */
const findCartItemById = (items, productId) =>
    items.find(item => item.id === productId);

/**
 * 創建購物車項目
 * @param {Product} product - 商品資料
 * @param {number} quantity - 數量
 * @returns {CartItem} 購物車項目
 */
const createCartItem = (product, quantity = 1) => ({
    id: product.id,
    name: product.name,
    price: product.price,
    image: product.image,
    quantity
});

/**
 * 添加商品到購物車（純函數）
 * @param {CartState} cartState - 當前購物車狀態
 * @param {Product} product - 要添加的商品
 * @returns {CartState} 更新後的購物車狀態
 */
const addItemToCart = (cartState, product) => {
    const existingItem = findCartItemById(cartState.items, product.id);

    if (existingItem) {
        // 如果商品已存在，增加數量
        const updatedItems = cartState.items.map(item =>
            item.id === product.id
                ? { ...item, quantity: item.quantity + 1 }
                : item
        );
        return updateCartCalculations({ ...cartState, items: updatedItems });
    } else {
        // 如果商品不存在，添加新項目
        const newItem = createCartItem(product, 1);
        const updatedItems = [...cartState.items, newItem];
        return updateCartCalculations({ ...cartState, items: updatedItems });
    }
};

/**
 * 從購物車移除商品（純函數）
 * @param {CartState} cartState - 當前購物車狀態
 * @param {string} productId - 要移除的商品 ID
 * @returns {CartState} 更新後的購物車狀態
 */
const removeItemFromCart = (cartState, productId) => {
    const updatedItems = cartState.items.filter(item => item.id !== productId);
    return updateCartCalculations({ ...cartState, items: updatedItems });
};

/**
 * 更新購物車中商品的數量（純函數）
 * @param {CartState} cartState - 當前購物車狀態
 * @param {string} productId - 商品 ID
 * @param {number} newQuantity - 新數量
 * @returns {CartState} 更新後的購物車狀態
 */
const updateItemQuantity = (cartState, productId, newQuantity) => {
    if (newQuantity <= 0) {
        return removeItemFromCart(cartState, productId);
    }

    const updatedItems = cartState.items.map(item =>
        item.id === productId
            ? { ...item, quantity: newQuantity }
            : item
    );

    return updateCartCalculations({ ...cartState, items: updatedItems });
};

/**
 * 清空購物車（純函數）
 * @param {CartState} cartState - 當前購物車狀態
 * @returns {CartState} 空的購物車狀態
 */
const clearCart = (cartState) => createEmptyCart();

/**
 * 驗證購物車項目是否有效
 * @param {CartItem} item - 購物車項目
 * @returns {boolean} 是否有效
 */
const isValidCartItem = (item) =>
    item &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.quantity === 'number' &&
    item.quantity > 0;

/**
 * 驗證購物車狀態是否有效
 * @param {CartState} cartState - 購物車狀態
 * @returns {boolean} 是否有效
 */
const isValidCartState = (cartState) =>
    cartState &&
    Array.isArray(cartState.items) &&
    cartState.items.every(isValidCartItem);

// ============================================================================
// 純函數 - 資料轉換和格式化
// ============================================================================

/**
 * 格式化價格顯示
 * @param {number} price - 價格
 * @returns {string} 格式化後的價格字串
 */
const formatPrice = (price) => `NT$ ${price.toLocaleString()}`;

/**
 * 將購物車項目轉換為 HTML 字串
 * @param {CartItem} item - 購物車項目
 * @returns {string} HTML 字串
 */
const cartItemToHtml = (item) => `
    <div class="cart-item" data-id="${item.id}">
        <div class="item-image">
            <img src="${item.image}" alt="${item.name}">
        </div>
        <div class="item-details">
            <h3>${item.name}</h3>
            <p class="item-price">${formatPrice(item.price)}</p>
        </div>
        <div class="item-controls">
            <button class="quantity-btn" onclick="changeQuantity('${item.id}', ${item.quantity - 1})">-</button>
            <span class="quantity">${item.quantity}</span>
            <button class="quantity-btn" onclick="changeQuantity('${item.id}', ${item.quantity + 1})">+</button>
        </div>
        <div class="item-total">
            ${formatPrice(item.price * item.quantity)}
        </div>
        <button class="remove-btn" onclick="removeFromCart('${item.id}')">移除</button>
    </div>
`;

/**
 * 將商品轉換為 HTML 字串
 * @param {Product} product - 商品資料
 * @returns {string} HTML 字串
 */
const productToHtml = (product) => `
    <div class="product-card">
        <div class="product-image">
            <img src="${product.image}" alt="${product.name}">
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="product-description">${product.description}</p>
            <p class="product-price">${formatPrice(product.price)}</p>
            <button class="add-to-cart-btn" onclick="addToCart(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                加入購物車
            </button>
        </div>
    </div>
`;

// ============================================================================
// 副作用函數 - 本地儲存操作
// ============================================================================

/**
 * 安全地從本地儲存讀取資料
 * @param {string} key - 儲存鍵值
 * @param {*} defaultValue - 預設值
 * @returns {*} 讀取的資料或預設值
 */
const safeGetFromStorage = (key, defaultValue = null) => {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
        console.warn(`讀取本地儲存失敗 (${key}):`, error);
        return defaultValue;
    }
};

/**
 * 安全地儲存資料到本地儲存
 * @param {string} key - 儲存鍵值
 * @param {*} value - 要儲存的資料
 * @returns {boolean} 是否儲存成功
 */
const safeSetToStorage = (key, value) => {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (error) {
        console.warn(`儲存到本地儲存失敗 (${key}):`, error);
        return false;
    }
};

/**
 * 從本地儲存載入購物車狀態
 * @returns {CartState} 載入的購物車狀態
 */
const loadCartFromStorage = () => {
    const savedItems = safeGetFromStorage(STORAGE_KEYS.CART, []);
    const cartState = { items: savedItems, totalCount: 0, totalPrice: 0 };
    return isValidCartState(cartState) ? updateCartCalculations(cartState) : createEmptyCart();
};

/**
 * 儲存購物車狀態到本地儲存
 * @param {CartState} cartState - 購物車狀態
 * @returns {boolean} 是否儲存成功
 */
const saveCartToStorage = (cartState) => {
    return safeSetToStorage(STORAGE_KEYS.CART, cartState.items);
};

// ============================================================================
// 副作用函數 - DOM 操作
// ============================================================================

/**
 * 安全地取得 DOM 元素
 * @param {string} id - 元素 ID
 * @returns {HTMLElement|null} DOM 元素或 null
 */
const safeGetElement = (id) => {
    const element = document.getElementById(id);
    if (!element) {
        console.warn(`找不到 DOM 元素: ${id}`);
    }
    return element;
};

/**
 * 更新購物車計數顯示
 * @param {number} count - 購物車項目總數
 */
const updateCartCountDisplay = (count) => {
    const countElement = safeGetElement(DOM_IDS.CART_COUNT);
    if (countElement) {
        countElement.textContent = count.toString();
    }
};

/**
 * 更新購物車項目顯示
 * @param {CartItem[]} items - 購物車項目陣列
 */
const updateCartItemsDisplay = (items) => {
    const container = safeGetElement(DOM_IDS.CART_ITEMS);
    if (!container) return;

    if (items.length === 0) {
        container.innerHTML = '';
        return;
    }

    const html = items.map(cartItemToHtml).join('');
    container.innerHTML = html;
};

/**
 * 更新購物車總計顯示
 * @param {number} totalPrice - 總價格
 * @param {boolean} isEmpty - 是否為空購物車
 */
const updateCartTotalDisplay = (totalPrice, isEmpty) => {
    const totalElement = safeGetElement(DOM_IDS.CART_TOTAL);
    const emptyElement = safeGetElement(DOM_IDS.EMPTY_CART);

    if (totalElement) {
        if (isEmpty) {
            totalElement.style.display = 'none';
        } else {
            totalElement.style.display = 'block';
            totalElement.innerHTML = `
                <div class="total-summary">
                    <h3>總計: ${formatPrice(totalPrice)}</h3>
                    <button class="clear-cart-btn" onclick="clearAllCart()">清空購物車</button>
                </div>
            `;
        }
    }

    if (emptyElement) {
        emptyElement.style.display = isEmpty ? 'block' : 'none';
    }
};

/**
 * 更新整個購物車顯示
 * @param {CartState} cartState - 購物車狀態
 */
const updateCartDisplayInternal = (cartState) => {
    updateCartCountDisplay(cartState.totalCount);
    updateCartItemsDisplay(cartState.items);
    updateCartTotalDisplay(cartState.totalPrice, cartState.items.length === 0);
};

/**
 * 顯示通知訊息
 * @param {string} message - 通知訊息
 * @param {number} duration - 顯示時間（毫秒）
 */
const showNotification = (message, duration = 3000) => {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    // 使用 requestAnimationFrame 確保 DOM 更新後再添加動畫
    requestAnimationFrame(() => {
        notification.classList.add('show');
    });

    setTimeout(() => {
        notification.classList.remove('show');
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, duration);
};

/**
 * 渲染商品列表
 * @param {Product[]} products - 商品陣列
 */
const renderProductsList = (products) => {
    const container = safeGetElement(DOM_IDS.PRODUCTS_CONTAINER);
    if (!container) return;

    const html = products.map(productToHtml).join('');
    container.innerHTML = html;
};

/**
 * 顯示載入狀態
 * @param {string} message - 載入訊息
 */
const showLoadingState = (message = '載入中...') => {
    const container = safeGetElement(DOM_IDS.PRODUCTS_CONTAINER);
    if (container) {
        container.innerHTML = `<div class="loading">${message}</div>`;
    }
};

// ============================================================================
// 副作用函數 - 非同步操作
// ============================================================================

/**
 * 模擬非同步獲取商品資料
 * @returns {Promise<Product[]>} 商品陣列
 */
const fetchProducts = async () => {
    // 模擬網路延遲
    await new Promise(resolve => setTimeout(resolve, 1300));
    return Promise.resolve([...PRODUCTS]);
};

/**
 * 載入並渲染商品列表
 * @returns {Promise<void>}
 */
const loadAndRenderProducts = async () => {
    try {
        showLoadingState();
        const products = await fetchProducts();
        renderProductsList(products);
    } catch (error) {
        console.error('載入商品失敗:', error);
        showLoadingState('載入失敗，請重新整理頁面');
    }
};

// ============================================================================
// 購物車狀態管理
// ============================================================================

/**
 * 購物車狀態管理器
 */
class CartManager {
    constructor() {
        this.state = createEmptyCart();
        this.initialize();
    }

    /**
     * 初始化購物車
     */
    initialize() {
        this.state = loadCartFromStorage();
        this.updateDisplay();
    }

    /**
     * 更新顯示
     */
    updateDisplay() {
        updateCartDisplayInternal(this.state);
    }

    /**
     * 儲存狀態到本地儲存
     */
    saveState() {
        saveCartToStorage(this.state);
    }

    /**
     * 添加商品到購物車
     * @param {Product} product - 商品資料
     */
    addItem(product) {
        this.state = addItemToCart(this.state, product);
        this.saveState();
        this.updateDisplay();
        showNotification(`${product.name} 已添加到購物車`);
    }

    /**
     * 從購物車移除商品
     * @param {string} productId - 商品 ID
     */
    removeItem(productId) {
        const item = findCartItemById(this.state.items, productId);
        this.state = removeItemFromCart(this.state, productId);
        this.saveState();
        this.updateDisplay();
        if (item) {
            showNotification('商品已從購物車移除');
        }
    }

    /**
     * 更新商品數量
     * @param {string} productId - 商品 ID
     * @param {number} quantity - 新數量
     */
    updateQuantity(productId, quantity) {
        this.state = updateItemQuantity(this.state, productId, quantity);
        this.saveState();
        this.updateDisplay();
    }

    /**
     * 清空購物車
     */
    clear() {
        this.state = clearCart(this.state);
        this.saveState();
        this.updateDisplay();
        showNotification('購物車已清空');
    }

    /**
     * 重置購物車（用於測試）
     */
    reset() {
        this.state = createEmptyCart();
        localStorage.clear();
        this.updateDisplay();
    }

    /**
     * 獲取當前狀態
     * @returns {CartState} 當前購物車狀態
     */
    getState() {
        return { ...this.state };
    }
}

// ============================================================================
// 全域實例和公開 API
// ============================================================================

// 創建購物車管理器實例
const cartManager = new CartManager();

// 公開的 API 函數（保持與原版本的相容性）
// 使用 var 確保函數在 eval 環境中可被外部訪問
var addToCart = (product) => cartManager.addItem(product);
var removeFromCart = (productId) => cartManager.removeItem(productId);
var changeQuantity = (productId, quantity) => cartManager.updateQuantity(productId, quantity);
var clearAllCart = () => cartManager.clear();
var updateCartCount = () => cartManager.updateDisplay();
var updateCartDisplay = () => cartManager.updateDisplay();
var calculateTotal = () => cartManager.getState().totalPrice;
var showMessage = (message) => showNotification(message);

// 用於測試的函數
var resetEverything = () => cartManager.reset();
var debugCart = () => {
    const state = cartManager.getState();
    console.log('購物車內容:', state.items);
    console.log('總數量:', state.totalCount);
    console.log('總金額:', state.totalPrice);
};
var validateCart = () => isValidCartState(cartManager.getState());
var getCartItemCount = () => cartManager.getState().totalCount;
var getCartTotalPrice = () => cartManager.getState().totalPrice;
var forceUpdate = () => cartManager.updateDisplay();

// ============================================================================
// 頁面初始化
// ============================================================================

/**
 * 初始化頁面
 */
const initializePage = () => {
    // 載入商品列表
    loadAndRenderProducts();

    // 更新購物車顯示
    cartManager.updateDisplay();
};

// DOM 載入完成後初始化
document.addEventListener('DOMContentLoaded', initializePage);

// 頁面載入完成後的額外初始化
window.addEventListener('load', () => {
    console.log('頁面載入完成');
    debugCart();
    validateCart();
    forceUpdate();
});

// ============================================================================
// 模組匯出（如果使用模組系統）
// ============================================================================

// 如果在 Node.js 環境中，匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // 純函數
        createEmptyCart,
        calculateTotalCount,
        calculateTotalPrice,
        addItemToCart,
        removeItemFromCart,
        updateItemQuantity,
        clearCart,
        isValidCartItem,
        isValidCartState,
        formatPrice,

        // 工具函數
        safeGetFromStorage,
        safeSetToStorage,
        loadCartFromStorage,
        saveCartToStorage,

        // 公開 API
        addToCart,
        removeFromCart,
        changeQuantity,
        clearAllCart,
        updateCartCount,
        updateCartDisplay,
        calculateTotal,
        showMessage,

        // 測試函數
        resetEverything,
        debugCart,
        validateCart,
        getCartItemCount,
        getCartTotalPrice,
        forceUpdate,

        // 常數
        PRODUCTS,
        STORAGE_KEYS,
        DOM_IDS
    };
}
