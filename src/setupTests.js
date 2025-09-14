// Jest setup file for DOM testing
const { TextEncoder, TextDecoder } = require('util');

// Polyfill for TextEncoder and TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

const { JSDOM } = require('jsdom');

// Create a mock DOM environment
const dom = new JSDOM(`
  <!DOCTYPE html>
  <html lang="zh-TW">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>購物車測試</title>
    </head>
    <body>
      <!-- Mock cart.html structure -->
      <header class="header">
        <div class="container">
          <h1 class="logo">🛍️ 購物商城</h1>
          <nav class="nav">
            <a href="index.html" class="nav-link">商品清單</a>
            <a href="cart.html" class="nav-link active">購物車</a>
          </nav>
          <div class="cart-icon">
            <a href="cart.html" class="cart-link">
              🛒 <span id="cart-count">0</span>
            </a>
          </div>
        </div>
      </header>

      <main class="main">
        <div class="container">
          <section class="cart-section">
            <h2>我的購物車</h2>

            <!-- 空購物車提示 -->
            <div id="empty-cart" class="empty-cart" style="display: none;">
              <div class="empty-cart-content">
                <h3>🛒 購物車是空的</h3>
                <p>還沒有添加任何商品到購物車</p>
                <a href="index.html" class="btn btn-primary">開始購物</a>
              </div>
            </div>

            <!-- 購物車商品列表 -->
            <div id="cart-items" class="cart-items">
              <!-- 購物車商品將由 JavaScript 動態生成 -->
            </div>

            <!-- 購物車總計 -->
            <div id="cart-total" class="cart-total" style="display: none;">
              <!-- 總計將由 JavaScript 動態生成 -->
            </div>
          </section>
        </div>
      </main>

      <footer class="footer">
        <div class="container">
          <p>&copy; 2024 購物商城. 版權所有.</p>
        </div>
      </footer>
    </body>
  </html>
`, {
    url: 'http://localhost',
    pretendToBeVisual: true,
    resources: 'usable'
});

// Set up global objects
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock localStorage
const localStorageMock = {
    getItem: jest.fn(() => null),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Store reference to the mock for cleanup
global.localStorageMock = localStorageMock;

// Mock console methods to avoid noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
};

// Clean up after each test
afterEach(() => {
    // Clear localStorage mock
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    localStorageMock.clear.mockClear();

    // Clear console mocks
    jest.clearAllMocks();

    // Clear the cart items container
    const cartItems = document.getElementById('cart-items');
    if (cartItems) {
        cartItems.innerHTML = '';
    }

    // Reset cart count
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = '0';
    }

    // Hide cart total and show empty cart
    const cartTotal = document.getElementById('cart-total');
    const emptyCart = document.getElementById('empty-cart');
    if (cartTotal) cartTotal.style.display = 'none';
    if (emptyCart) emptyCart.style.display = 'none';
});
