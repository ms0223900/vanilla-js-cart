const fs = require('fs');
const path = require('path');
const { JSDOM } = require('jsdom');

// 讀取實際的 HTML 檔案內容
const cartHtmlPath = path.join(__dirname, 'cart.html');
const cartHtmlContent = fs.readFileSync(cartHtmlPath, 'utf8');

// 讀取購物車腳本內容
const cartScriptPath = path.join(__dirname, 'cart-refactored-functional.js');
let cartScriptContent = fs.readFileSync(cartScriptPath, 'utf8');

describe('購物車 DOM 驗證測試 (重構友善)', () => {
    let dom;
    let window;
    let document;
    let localStorage;

    beforeEach(() => {
        // 使用實際的 HTML 內容創建 DOM 環境
        dom = new JSDOM(cartHtmlContent, {
            url: 'http://localhost/cart.html',
            pretendToBeVisual: true,
            resources: 'usable',
            runScripts: 'dangerously'
        });

        window = dom.window;
        document = window.document;

        // 模擬 localStorage
        const localStorageMock = {
            store: {},
            getItem: jest.fn(function (key) {
                return this.store[key] || null;
            }),
            setItem: jest.fn(function (key, value) {
                this.store[key] = value.toString();
            }),
            removeItem: jest.fn(function (key) {
                delete this.store[key];
            }),
            clear: jest.fn(function () {
                this.store = {};
            })
        };
        localStorage = localStorageMock;
        window.localStorage = localStorage;

        // 模擬全局物件
        global.window = window;
        global.document = document;
        global.localStorage = localStorage;

        // 在 window 上下文中執行購物車腳本
        // 先設置全局變量
        window.eval(`
            ${cartScriptContent}
            
            // 將函數掛載到 window 對象上以便測試可以訪問
            window.addToCart = addToCart;
            window.removeFromCart = removeFromCart;
            window.changeQuantity = changeQuantity;
            window.clearAllCart = clearAllCart;
            window.updateCartCount = updateCartCount;
            window.updateCartDisplay = updateCartDisplay;
            window.calculateTotal = calculateTotal;
            window.showMessage = showMessage;
        `);

        // 等待 DOM 準備就緒
        if (window.document.readyState !== 'complete') {
            const event = new window.Event('DOMContentLoaded');
            window.document.dispatchEvent(event);
        }
    });

    afterEach(() => {
        dom.window.close();
    });

    describe('DOM 結構驗證', () => {
        it('所有必要的 DOM 元素都應該存在', () => {
            // 檢查關鍵的 DOM 元素是否存在
            expect(document.getElementById('cart-count')).toBeTruthy();
            expect(document.getElementById('cart-items')).toBeTruthy();
            expect(document.getElementById('cart-total')).toBeTruthy();
            expect(document.getElementById('empty-cart')).toBeTruthy();
        });

        it('初始狀態的 DOM 應該正確設置', () => {
            const cartCount = document.getElementById('cart-count');
            const cartItems = document.getElementById('cart-items');
            const cartTotal = document.getElementById('cart-total');
            const emptyCart = document.getElementById('empty-cart');

            // 檢查初始狀態
            expect(cartCount.textContent).toBe('0');
            // DOM 載入後，JavaScript 會清空購物車容器，所以檢查是否為空
            expect(cartItems.innerHTML.trim()).toBe('');
            expect(cartTotal.style.display).toBe('none');
        });
    });

    describe('購物車操作的 DOM 反應測試', () => {
        const sampleProduct = {
            id: '1',
            name: 'iPhone 15 Pro',
            price: 36900,
            image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro',
            description: '最新的 iPhone 15 Pro，搭載 A17 Pro 晶片'
        };

        it('添加商品後 DOM 應該正確更新', async () => {
            // 執行添加商品操作
            window.addToCart(sampleProduct);

            // 驗證購物車計數更新
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('1');

            // 驗證購物車項目顯示
            const cartItems = document.getElementById('cart-items');
            expect(cartItems.innerHTML).toContain('iPhone 15 Pro');
            expect(cartItems.innerHTML).toContain('NT$ 36,900');

            // 驗證總計區域顯示
            const cartTotal = document.getElementById('cart-total');
            expect(cartTotal.style.display).toBe('block');

            // 驗證空購物車提示隱藏
            const emptyCart = document.getElementById('empty-cart');
            expect(emptyCart.style.display).toBe('none');
        });

        it('移除商品後 DOM 應該返回空狀態', async () => {
            // 先添加商品
            window.addToCart(sampleProduct);

            // 然後移除商品
            window.removeFromCart('1');

            // 驗證購物車計數重置
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('0');

            // 驗證購物車項目清空
            const cartItems = document.getElementById('cart-items');
            expect(cartItems.innerHTML).toBe('');

            // 驗證總計區域隱藏
            const cartTotal = document.getElementById('cart-total');
            expect(cartTotal.style.display).toBe('none');

            // 驗證空購物車提示顯示
            const emptyCart = document.getElementById('empty-cart');
            expect(emptyCart.style.display).toBe('block');
        });

        it('更新商品數量後 DOM 應該反映新數量', async () => {
            // 添加商品並更新數量
            window.addToCart(sampleProduct);
            window.changeQuantity('1', 3);

            // 驗證購物車計數更新為 3
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('3');

            // 驗證商品項目中的數量顯示
            const cartItems = document.getElementById('cart-items');
            const quantitySpan = cartItems.querySelector('.quantity');
            expect(quantitySpan.textContent).toBe('3');

            // 驗證商品項目的總價更新
            const itemTotal = cartItems.querySelector('.item-total');
            expect(itemTotal.textContent).toContain('110,700'); // 36900 * 3
        });

        it('清空購物車後 DOM 應該返回初始狀態', async () => {
            // 添加多個商品
            window.addToCart(sampleProduct);
            window.addToCart({
                id: '2',
                name: 'MacBook Air M2',
                price: 37900,
                image: 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook+Air',
                description: '輕薄便攜的 MacBook Air，搭載 M2 晶片'
            });

            // 清空購物車
            window.clearAllCart();

            // 驗證所有 DOM 元素回到初始狀態
            const cartCount = document.getElementById('cart-count');
            const cartItems = document.getElementById('cart-items');
            const cartTotal = document.getElementById('cart-total');
            const emptyCart = document.getElementById('empty-cart');

            expect(cartCount.textContent).toBe('0');
            expect(cartItems.innerHTML).toBe('');
            expect(cartTotal.style.display).toBe('none');
            expect(emptyCart.style.display).toBe('block');
        });
    });

    describe('購物車 UI 互動測試', () => {
        const sampleProduct = {
            id: '1',
            name: 'iPhone 15 Pro',
            price: 36900,
            image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro',
            description: '最新的 iPhone 15 Pro，搭載 A17 Pro 晶片'
        };

        it('購物車項目應該顯示正確的控制按鈕', async () => {
            // 添加商品
            window.addToCart(sampleProduct);

            const cartItems = document.getElementById('cart-items');

            // 檢查數量控制按鈕是否存在
            const quantityButtons = cartItems.querySelectorAll('.quantity-btn');
            expect(quantityButtons.length).toBe(2); // + 和 - 按鈕

            // 檢查移除按鈕是否存在
            const removeButton = cartItems.querySelector('.remove-btn');
            expect(removeButton).toBeTruthy();
            expect(removeButton.textContent).toBe('移除');
        });

        it('點擊數量增加按鈕應該增加數量', async () => {
            // 添加商品
            window.addToCart(sampleProduct);

            const cartItems = document.getElementById('cart-items');
            const increaseButton = cartItems.querySelectorAll('.quantity-btn')[1]; // 第二個是 + 按鈕

            // 模擬點擊增加按鈕
            increaseButton.click();

            // 驗證數量增加
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('2');

            const quantitySpan = cartItems.querySelector('.quantity');
            expect(quantitySpan.textContent).toBe('2');
        });

        it('點擊數量減少按鈕應該減少數量', async () => {
            // 添加商品並設置數量為 2
            window.addToCart(sampleProduct);
            window.changeQuantity('1', 2);

            const cartItems = document.getElementById('cart-items');
            const decreaseButton = cartItems.querySelectorAll('.quantity-btn')[0]; // 第一個是 - 按鈕

            // 模擬點擊減少按鈕
            decreaseButton.click();

            // 驗證數量減少
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('1');

            const quantitySpan = cartItems.querySelector('.quantity');
            expect(quantitySpan.textContent).toBe('1');
        });

        it('點擊移除按鈕應該移除商品', async () => {
            // 添加商品
            window.addToCart(sampleProduct);

            const cartItems = document.getElementById('cart-items');
            const removeButton = cartItems.querySelector('.remove-btn');

            // 模擬點擊移除按鈕
            removeButton.click();

            // 驗證商品被移除
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('0');

            const emptyCart = document.getElementById('empty-cart');
            expect(emptyCart.style.display).toBe('block');
        });

        it('清空購物車按鈕應該正確工作', async () => {
            // 添加多個商品
            window.addToCart(sampleProduct);
            window.addToCart({
                id: '2',
                name: 'MacBook Air M2',
                price: 37900,
                image: 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook+Air'
            });

            const cartTotal = document.getElementById('cart-total');
            const clearButton = cartTotal.querySelector('.clear-cart-btn');

            expect(clearButton).toBeTruthy();
            expect(clearButton.textContent).toBe('清空購物車');

            // 模擬點擊清空按鈕
            clearButton.click();

            // 驗證購物車被清空
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('0');

            const emptyCart = document.getElementById('empty-cart');
            expect(emptyCart.style.display).toBe('block');
        });
    });

    describe('總計計算和顯示測試', () => {
        it('單一商品的總計應該正確顯示', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            window.addToCart(product);
            window.changeQuantity('1', 2);

            const cartTotal = document.getElementById('cart-total');
            expect(cartTotal.innerHTML).toContain('73,800'); // 36900 * 2
        });

        it('多個商品的總計應該正確計算', async () => {
            const product1 = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };
            const product2 = {
                id: '2',
                name: 'MacBook Air M2',
                price: 37900,
                image: 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook+Air'
            };

            window.addToCart(product1);
            window.addToCart(product2);

            const cartTotal = document.getElementById('cart-total');
            expect(cartTotal.innerHTML).toContain('74,800'); // 36900 + 37900
        });
    });

    describe('通知系統 DOM 測試', () => {
        it('添加商品應該顯示通知', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            window.addToCart(product);

            // 檢查通知元素是否被創建
            const notifications = document.querySelectorAll('.notification');
            expect(notifications.length).toBeGreaterThan(0);

            const lastNotification = notifications[notifications.length - 1];
            expect(lastNotification.textContent).toContain('iPhone 15 Pro 已添加到購物車');
        });

        it('移除商品應該顯示通知', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            window.addToCart(product);
            window.removeFromCart('1');

            const notifications = document.querySelectorAll('.notification');
            expect(notifications.length).toBeGreaterThan(1); // 添加 + 移除通知

            // 檢查最後一個通知是移除通知
            const lastNotification = notifications[notifications.length - 1];
            expect(lastNotification.textContent).toContain('商品已從購物車移除');
        });

        it('清空購物車應該顯示通知', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            window.addToCart(product);
            window.clearAllCart();

            const notifications = document.querySelectorAll('.notification');
            const lastNotification = notifications[notifications.length - 1];
            expect(lastNotification.textContent).toContain('購物車已清空');
        });
    });

    describe('本地儲存和持久化測試', () => {
        it('購物車操作序列應該保持 DOM 狀態一致', async () => {
            const product1 = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };
            const product2 = {
                id: '2',
                name: 'MacBook Air M2',
                price: 37900,
                image: 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook+Air'
            };

            // 執行一系列操作
            window.addToCart(product1);
            window.addToCart(product2);
            window.changeQuantity('1', 3);

            // 驗證最終 DOM 狀態
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('4'); // 3 + 1

            const cartItems = document.getElementById('cart-items');
            expect(cartItems.innerHTML).toContain('iPhone 15 Pro');
            expect(cartItems.innerHTML).toContain('MacBook Air M2');

            // 驗證數量顯示
            const quantityElements = cartItems.querySelectorAll('.quantity');
            expect(quantityElements[0].textContent).toBe('3');
            expect(quantityElements[1].textContent).toBe('1');
        });

        it('localStorage 相關函數應該正常執行而不出錯', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            // 這些操作應該都不會拋出錯誤，即使 localStorage 是 mock
            expect(() => {
                window.addToCart(product);
                window.changeQuantity('1', 2);
                window.removeFromCart('1');
                window.clearAllCart();
            }).not.toThrow();

            // 驗證最終狀態
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('0');
        });

        it('錯誤的輸入不應該影響 DOM 狀態', async () => {
            const validProduct = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            // 添加有效商品
            window.addToCart(validProduct);

            // 嘗試無效操作
            expect(() => {
                window.removeFromCart('nonexistent');
                window.changeQuantity('nonexistent', 5);
                window.changeQuantity('1', -1); // 應該移除商品
            }).not.toThrow();

            // 驗證 DOM 狀態正確
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('0');

            const emptyCart = document.getElementById('empty-cart');
            expect(emptyCart.style.display).toBe('block');
        });
    });

    describe('複雜場景的 DOM 一致性測試', () => {
        it('複合操作後 DOM 狀態應該保持一致', async () => {
            const product1 = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };
            const product2 = {
                id: '2',
                name: 'MacBook Air M2',
                price: 37900,
                image: 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook+Air'
            };

            // 執行一系列複雜操作
            window.addToCart(product1);
            window.addToCart(product2);
            window.changeQuantity('1', 3);
            window.removeFromCart('2');

            // 驗證最終 DOM 狀態
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('3');

            const cartItems = document.getElementById('cart-items');
            expect(cartItems.innerHTML).toContain('iPhone 15 Pro');
            expect(cartItems.innerHTML).not.toContain('MacBook Air M2');

            const quantitySpan = cartItems.querySelector('.quantity');
            expect(quantitySpan.textContent).toBe('3');

            const cartTotal = document.getElementById('cart-total');
            expect(cartTotal.innerHTML).toContain('110,700'); // 36900 * 3
        });

        it('快速連續操作不應該導致 DOM 不一致', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            // 快速連續操作
            for (let i = 0; i < 5; i++) {
                window.addToCart(product);
            }

            // 驗證最終狀態正確
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('5');

            const cartItems = document.getElementById('cart-items');
            const quantitySpan = cartItems.querySelector('.quantity');
            expect(quantitySpan.textContent).toBe('5');
        });
    });

    describe('邊界條件和錯誤處理測試', () => {
        it('數量設為 0 應該移除商品', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            window.addToCart(product);
            window.changeQuantity('1', 0);

            // 驗證商品被移除
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('0');

            const emptyCart = document.getElementById('empty-cart');
            expect(emptyCart.style.display).toBe('block');
        });

        it('負數數量應該移除商品', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            window.addToCart(product);
            window.changeQuantity('1', -1);

            // 驗證商品被移除
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('0');

            const emptyCart = document.getElementById('empty-cart');
            expect(emptyCart.style.display).toBe('block');
        });

        it('移除不存在的商品不應該影響其他商品', async () => {
            const product = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            window.addToCart(product);
            window.removeFromCart('999'); // 不存在的商品ID

            // 驗證現有商品不受影響
            const cartCount = document.getElementById('cart-count');
            expect(cartCount.textContent).toBe('1');

            const cartItems = document.getElementById('cart-items');
            expect(cartItems.innerHTML).toContain('iPhone 15 Pro');
        });
    });

    describe('運費計算功能測試', () => {
        it('購物車金額超過 $5000 時，運費應該為 $0', async () => {
            const expensiveProduct = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };

            window.addToCart(expensiveProduct);

            const cartTotal = document.getElementById('cart-total');

            // 驗證運費顯示為 $0
            expect(cartTotal.innerHTML).toContain('運費: NT$ 0');
            // 驗證總金額等於商品金額（無運費）
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 36,900');
        });

        it('購物車金額小於 $5000 時，運費應該為 $100', async () => {
            const cheapProduct = {
                id: '1',
                name: 'AirPods Pro',
                price: 2000,
                image: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro'
            };

            window.addToCart(cheapProduct);

            const cartTotal = document.getElementById('cart-total');

            // 驗證運費顯示為 $100
            expect(cartTotal.innerHTML).toContain('運費: NT$ 100');
            // 驗證總金額等於商品金額 + 運費
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 2,100');
        });

        it('購物車金額等於 $5000 時，運費應該為 $0', async () => {
            const product = {
                id: '1',
                name: 'Test Product',
                price: 5000,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=Test'
            };

            window.addToCart(product);

            const cartTotal = document.getElementById('cart-total');

            // 驗證運費顯示為 $0
            expect(cartTotal.innerHTML).toContain('運費: NT$ 0');
            // 驗證總金額等於商品金額（無運費）
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 5,000');
        });

        it('多個商品總金額超過 $5000 時，運費應該為 $0', async () => {
            const product1 = {
                id: '1',
                name: 'AirPods Pro',
                price: 7490,
                image: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro'
            };
            const product2 = {
                id: '2',
                name: 'Apple Watch Series 9',
                price: 12900,
                image: 'https://via.placeholder.com/200x200/FF9500/FFFFFF?text=Apple+Watch'
            };

            window.addToCart(product1);
            window.addToCart(product2);

            const cartTotal = document.getElementById('cart-total');

            // 驗證運費顯示為 $0
            expect(cartTotal.innerHTML).toContain('運費: NT$ 0');
            // 驗證總金額等於商品總金額（無運費）
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 20,390');
        });

        it('多個商品總金額小於 $5000 時，運費應該為 $100', async () => {
            const product1 = {
                id: '1',
                name: 'AirPods Pro',
                price: 2000,
                image: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro'
            };
            const product2 = {
                id: '2',
                name: 'Test Product',
                price: 2000,
                image: 'https://via.placeholder.com/200x200/FF9500/FFFFFF?text=Test'
            };

            window.addToCart(product1);
            window.addToCart(product2);

            const cartTotal = document.getElementById('cart-total');

            // 驗證運費顯示為 $100
            expect(cartTotal.innerHTML).toContain('運費: NT$ 100');
            // 驗證總金額等於商品總金額 + 運費
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 4,100');
        });

        it('更新商品數量後運費應該重新計算', async () => {
            const product = {
                id: '1',
                name: 'AirPods Pro',
                price: 2000,
                image: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro'
            };

            // 初始添加商品，金額小於 $5000
            window.addToCart(product);

            let cartTotal = document.getElementById('cart-total');
            expect(cartTotal.innerHTML).toContain('運費: NT$ 100');
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 2,100');

            // 增加數量使總金額超過 $5000
            window.changeQuantity('1', 3); // 2000 * 3 = 6000

            cartTotal = document.getElementById('cart-total');
            expect(cartTotal.innerHTML).toContain('運費: NT$ 0');
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 6,000');
        });

        it('移除商品後運費應該重新計算', async () => {
            const product1 = {
                id: '1',
                name: 'iPhone 15 Pro',
                price: 36900,
                image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro'
            };
            const product2 = {
                id: '2',
                name: 'AirPods Pro',
                price: 2000,
                image: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro'
            };

            // 添加兩個商品，總金額超過 $5000
            window.addToCart(product1);
            window.addToCart(product2);

            let cartTotal = document.getElementById('cart-total');
            expect(cartTotal.innerHTML).toContain('運費: NT$ 0');
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 38,900');

            // 移除昂貴商品，剩餘金額小於 $5000
            window.removeFromCart('1');

            cartTotal = document.getElementById('cart-total');
            expect(cartTotal.innerHTML).toContain('運費: NT$ 100');
            expect(cartTotal.innerHTML).toContain('總金額: NT$ 2,100');
        });

        it('清空購物車後運費相關顯示應該隱藏', async () => {
            const product = {
                id: '1',
                name: 'AirPods Pro',
                price: 2000,
                image: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro'
            };

            window.addToCart(product);
            window.clearAllCart();

            const cartTotal = document.getElementById('cart-total');
            expect(cartTotal.style.display).toBe('none');
        });
    });
});
