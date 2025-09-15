// 商品管理模組 - 遵循 Clean Code 和函數式程式設計原則

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
    },
    {
        id: '7',
        name: 'Type-C傳輸線',
        price: 300,
        image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=Type-C傳輸線',
        description: 'Type-C傳輸線'
    }
];

// DOM 元素 ID
const PRODUCT_DOM_IDS = {
    PRODUCTS_CONTAINER: 'products-container'
};

// ============================================================================
// 純函數 - 商品資料處理
// ============================================================================

/**
 * 根據 ID 查找商品
 * @param {Product[]} products - 商品陣列
 * @param {string} productId - 商品 ID
 * @returns {Product|undefined} 找到的商品
 */
const findProductById = (products, productId) =>
    products.find(product => product.id === productId);

/**
 * 驗證商品資料是否有效
 * @param {Product} product - 商品資料
 * @returns {boolean} 是否有效
 */
const isValidProduct = (product) =>
    product &&
    typeof product.id === 'string' &&
    typeof product.name === 'string' &&
    typeof product.price === 'number' &&
    typeof product.image === 'string' &&
    typeof product.description === 'string' &&
    product.price > 0;

/**
 * 驗證商品陣列是否有效
 * @param {Product[]} products - 商品陣列
 * @returns {boolean} 是否有效
 */
const isValidProductArray = (products) =>
    Array.isArray(products) && products.every(isValidProduct);

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

/**
 * 將商品陣列轉換為 HTML 字串
 * @param {Product[]} products - 商品陣列
 * @returns {string} HTML 字串
 */
const productsToHtml = (products) => products.map(productToHtml).join('');

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
 * 渲染商品列表
 * @param {Product[]} products - 商品陣列
 */
const renderProductsList = (products) => {
    const container = safeGetElement(PRODUCT_DOM_IDS.PRODUCTS_CONTAINER);
    if (!container) return;

    if (!isValidProductArray(products)) {
        console.error('無效的商品資料');
        return;
    }

    const html = productsToHtml(products);
    container.innerHTML = html;
};

/**
 * 顯示載入狀態
 * @param {string} message - 載入訊息
 */
const showLoadingState = (message = '載入中...') => {
    const container = safeGetElement(PRODUCT_DOM_IDS.PRODUCTS_CONTAINER);
    if (container) {
        container.innerHTML = `<div class="loading">${message}</div>`;
    }
};

/**
 * 顯示錯誤狀態
 * @param {string} message - 錯誤訊息
 */
const showErrorState = (message = '載入失敗，請重新整理頁面') => {
    const container = safeGetElement(PRODUCT_DOM_IDS.PRODUCTS_CONTAINER);
    if (container) {
        container.innerHTML = `
            <div class="error">
                <p>${message}</p>
                <button onclick="location.reload()">重新整理</button>
            </div>
        `;
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
    await new Promise(resolve => setTimeout(resolve, 300));
    console.log('fetchProducts', PRODUCTS);
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
        showErrorState('載入失敗，請重新整理頁面');
    }
};

// ============================================================================
// 商品管理器類別
// ============================================================================

/**
 * 商品管理器
 */
class ProductManager {
    constructor() {
        this.products = [];
        this.isLoading = false;
    }

    /**
     * 初始化商品管理器
     */
    async initialize() {
        await this.loadProducts();
    }

    /**
     * 載入商品資料
     */
    async loadProducts() {
        try {
            this.isLoading = true;
            this.products = await fetchProducts();
            this.render();
        } catch (error) {
            console.error('載入商品失敗:', error);
            this.showError();
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * 渲染商品列表
     */
    render() {
        renderProductsList(this.products);
    }

    /**
     * 顯示載入狀態
     */
    showLoading() {
        showLoadingState();
    }

    /**
     * 顯示錯誤狀態
     */
    showError() {
        showErrorState();
    }

    /**
     * 根據 ID 獲取商品
     * @param {string} productId - 商品 ID
     * @returns {Product|undefined} 商品資料
     */
    getProductById(productId) {
        return findProductById(this.products, productId);
    }

    /**
     * 獲取所有商品
     * @returns {Product[]} 商品陣列
     */
    getAllProducts() {
        return [...this.products];
    }

    /**
     * 檢查是否正在載入
     * @returns {boolean} 是否正在載入
     */
    getIsLoading() {
        return this.isLoading;
    }
}

// ============================================================================
// 全域實例和公開 API
// ============================================================================

// 創建商品管理器實例
const productManager = new ProductManager();

// 公開的 API 函數
var loadProducts = () => productManager.loadProducts();
var renderProducts = () => productManager.render();
var getProductById = (productId) => productManager.getProductById(productId);
var getAllProducts = () => productManager.getAllProducts();
var initializeProducts = () => productManager.initialize();

// ============================================================================
// 模組匯出（如果使用模組系統）
// ============================================================================

// 如果在 Node.js 環境中，匯出模組
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        // 純函數
        findProductById,
        isValidProduct,
        isValidProductArray,
        formatPrice,
        productToHtml,
        productsToHtml,

        // 副作用函數
        renderProductsList,
        showLoadingState,
        showErrorState,
        fetchProducts,
        loadAndRenderProducts,

        // 管理器
        ProductManager,

        // 公開 API
        loadProducts,
        renderProducts,
        getProductById,
        getAllProducts,
        initializeProducts,

        // 常數
        PRODUCTS,
        PRODUCT_DOM_IDS
    };
}
