// 函數式購物車重構版本 - 遵循 Clean Code 和函數式程式設計原則
// 引入商品管理模組
// <script src="product.js"></script>

// ============================================================================
// 資料結構和常數定義
// ============================================================================

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
 */

// 本地儲存鍵值
const STORAGE_KEYS = {
    CART: 'shoppingCart'
};

// 運費計算常數
const SHIPPING_CONFIG = {
    FREE_SHIPPING_THRESHOLD: 5000, // 免運門檻
    SHIPPING_FEE: 100 // 運費
};

// DOM 元素 ID
const DOM_IDS = {
    CART_COUNT: 'cart-count',
    CART_ITEMS: 'cart-items',
    CART_TOTAL: 'cart-total',
    EMPTY_CART: 'empty-cart'
};

// ============================================================================
// 純函數 - 購物車邏輯運算
// ============================================================================

/**
 * 創建空的購物車狀態
 * @returns {CartState} 空的購物車狀態
 */
const createEmptyCart = () => ({
    items: []
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
 * 計算運費
 * @param {number} totalPrice - 商品總價格
 * @returns {number} 運費
 */
const calculateShippingFee = (totalPrice) => {
    return totalPrice >= SHIPPING_CONFIG.FREE_SHIPPING_THRESHOLD
        ? 0
        : SHIPPING_CONFIG.SHIPPING_FEE;
};

/**
 * 計算最終總金額（商品總價 + 運費）
 * @param {number} totalPrice - 商品總價格
 * @param {number} shippingFee - 運費
 * @returns {number} 最終總金額
 */
const calculateFinalTotal = (totalPrice, shippingFee) => totalPrice + shippingFee;

/**
 * 計算購物車的派生資料
 * @param {CartState} cartState - 購物車狀態
 * @returns {Object} 包含所有計算屬性的物件
 */
const calculateCartDerivedData = (cartState) => {
    const totalCount = calculateTotalCount(cartState.items);
    const totalPrice = calculateTotalPrice(cartState.items);
    const shippingFee = calculateShippingFee(totalPrice);
    const finalTotal = calculateFinalTotal(totalPrice, shippingFee);

    return {
        totalCount,
        totalPrice,
        shippingFee,
        finalTotal
    };
};

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
        return { ...cartState, items: updatedItems };
    } else {
        // 如果商品不存在，添加新項目
        const newItem = createCartItem(product, 1);
        const updatedItems = [...cartState.items, newItem];
        return { ...cartState, items: updatedItems };
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
    return { ...cartState, items: updatedItems };
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

    return { ...cartState, items: updatedItems };
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

// formatPrice 函數使用 product.js 模組中的版本

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

// productToHtml 函數已移至 product.js 模組

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
    const cartState = { items: savedItems };
    return isValidCartState(cartState) ? cartState : createEmptyCart();
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

// safeGetElement 函數使用 product.js 模組中的版本

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
 * @param {number} totalPrice - 商品總價格
 * @param {number} shippingFee - 運費
 * @param {number} finalTotal - 最終總金額
 * @param {boolean} isEmpty - 是否為空購物車
 */
const updateCartTotalDisplay = (totalPrice, shippingFee, finalTotal, isEmpty) => {
    const totalElement = safeGetElement(DOM_IDS.CART_TOTAL);
    const emptyElement = safeGetElement(DOM_IDS.EMPTY_CART);

    if (totalElement) {
        if (isEmpty) {
            totalElement.style.display = 'none';
        } else {
            totalElement.style.display = 'block';
            totalElement.innerHTML = `
                <div class="total-summary">
                    <div class="price-breakdown">
                        <div class="price-item">
                            <span>商品總計: ${formatPrice(totalPrice)}</span>
                        </div>
                        <div class="price-item">
                            <span>運費: ${formatPrice(shippingFee)}</span>
                        </div>
                        <div class="price-item total">
                            <span>總金額: ${formatPrice(finalTotal)}</span>
                        </div>
                    </div>
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
    const derivedData = calculateCartDerivedData(cartState);

    updateCartCountDisplay(derivedData.totalCount);
    updateCartItemsDisplay(cartState.items);
    updateCartTotalDisplay(
        derivedData.totalPrice,
        derivedData.shippingFee,
        derivedData.finalTotal,
        cartState.items.length === 0
    );
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

// 商品相關的函數已移至 product.js 模組

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
     * 顯示清空購物車確認對話框
     */
    showClearCartConfirmation() {
        this.showConfirmModal();
    }

    /**
     * 顯示確認模態對話框
     */
    showConfirmModal() {
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            modal.style.display = 'flex';
            // 防止背景滾動
            document.body.style.overflow = 'hidden';

            // 添加ESC鍵監聽器
            this.addModalEventListeners();
        }
    }

    /**
     * 隱藏確認模態對話框
     */
    hideConfirmModal() {
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            modal.style.display = 'none';
            // 恢復背景滾動
            document.body.style.overflow = 'auto';

            // 移除事件監聽器
            this.removeModalEventListeners();
        }
    }

    /**
     * 確認清空購物車
     */
    confirmClearCart() {
        this.hideConfirmModal();
        this.clear();
    }

    /**
     * 添加模態對話框事件監聽器
     */
    addModalEventListeners() {
        // ESC鍵關閉
        this.escKeyHandler = (event) => {
            if (event.key === 'Escape') {
                this.hideConfirmModal();
            }
        };
        document.addEventListener('keydown', this.escKeyHandler);

        // 點擊背景關閉
        const modal = document.getElementById('confirm-modal');
        if (modal) {
            this.backgroundClickHandler = (event) => {
                if (event.target === modal) {
                    this.hideConfirmModal();
                }
            };
            modal.addEventListener('click', this.backgroundClickHandler);
        }
    }

    /**
     * 移除模態對話框事件監聽器
     */
    removeModalEventListeners() {
        if (this.escKeyHandler) {
            document.removeEventListener('keydown', this.escKeyHandler);
            this.escKeyHandler = null;
        }

        if (this.backgroundClickHandler) {
            const modal = document.getElementById('confirm-modal');
            if (modal) {
                modal.removeEventListener('click', this.backgroundClickHandler);
                this.backgroundClickHandler = null;
            }
        }
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
var changeQuantity = function (productId, quantity) {
    var stateMaybe, whatever, list, i, itemLike, go;
    if (cartManager && cartManager.getState && typeof cartManager.getState === 'function') {
        try {
            stateMaybe = cartManager.getState();
        } catch (errorWhichWeIgnore) {
            stateMaybe = { items: [] };
        }
    }
    if (!stateMaybe || typeof stateMaybe !== 'object') {
        stateMaybe = { items: [] };
    }
    whatever = stateMaybe.items;
    if (!whatever || typeof whatever.length !== 'number') {
        list = [];
    } else {
        list = whatever;
    }
    for (i = 0; i < list.length; i++) {
        if (!itemLike && list[i] && list[i].id == productId) {
            itemLike = list[i];
        }
    }
    if (itemLike && (itemLike.quantity === 1 || itemLike.quantity < 1) && !(quantity > 0)) {
        go = void 0;
        if (typeof window !== 'undefined') {
            try {
                if (window && typeof window.confirm === 'function') {
                    go = window.confirm('你確定要刪除嗎？');
                } else {
                    go = true;
                }
            } catch (ignoreTheConfirmExplosion) {
                go = true;
            }
        } else {
            go = true;
        }
        if (go === undefined) {
            go = true;
        }
        if (!go) {
            return;
        }
    }
    return cartManager.updateQuantity(productId, quantity);
};
var clearAllCart = () => cartManager.showClearCartConfirmation();
var updateCartCount = () => cartManager.updateDisplay();
var updateCartDisplay = () => cartManager.updateDisplay();
var calculateTotal = () => {
    const state = cartManager.getState();
    const derivedData = calculateCartDerivedData(state);
    return derivedData.finalTotal;
};
var showMessage = (message) => showNotification(message);

// 模態對話框相關的全域函數
var closeConfirmModal = () => {
    if (cartManager) {
        cartManager.hideConfirmModal();
    }
};

var confirmClearCart = () => {
    if (cartManager) {
        cartManager.confirmClearCart();
    }
};

// 用於測試的函數
var resetEverything = () => cartManager.reset();
var debugCart = () => {
    const state = cartManager.getState();
    const derivedData = calculateCartDerivedData(state);
    console.log('購物車內容:', state.items);
    console.log('總數量:', derivedData.totalCount);
    console.log('總金額:', derivedData.totalPrice);
    console.log('運費:', derivedData.shippingFee);
    console.log('最終總額:', derivedData.finalTotal);
};
var validateCart = () => isValidCartState(cartManager.getState());
var getCartItemCount = () => {
    const state = cartManager.getState();
    const derivedData = calculateCartDerivedData(state);
    return derivedData.totalCount;
};
var getCartTotalPrice = () => {
    const state = cartManager.getState();
    const derivedData = calculateCartDerivedData(state);
    return derivedData.totalPrice;
};
var forceUpdate = () => cartManager.updateDisplay();

// ============================================================================
// 頁面初始化
// ============================================================================

/**
 * 初始化頁面
 */
const initializePage = () => {
    // 載入商品列表（使用 product.js 模組）
    if (typeof loadAndRenderProducts === 'function') {
        loadAndRenderProducts();
    } else {
        console.warn('product.js 模組未載入，無法顯示商品列表');
    }

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

// some unknown function
function unknownFunction() {
    console.log('unknown function');
    var a = 1;
    a = b + 1;
    return a;
}

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
        calculateShippingFee,
        calculateFinalTotal,
        calculateCartDerivedData,
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
        STORAGE_KEYS,
        SHIPPING_CONFIG,
        DOM_IDS
    };
}
