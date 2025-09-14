// 義大利麵式購物車 - 所有功能混在一起，沒有結構化

let cartItems = [];
let cartCount = 0;
let cartTotal = 0;

const products = [
    { id: '1', name: 'iPhone 15 Pro', price: 36900, image: 'https://via.placeholder.com/200x200/007AFF/FFFFFF?text=iPhone+15+Pro', description: '最新的 iPhone 15 Pro，搭載 A17 Pro 晶片' },
    { id: '2', name: 'MacBook Air M2', price: 37900, image: 'https://via.placeholder.com/200x200/34C759/FFFFFF?text=MacBook+Air', description: '輕薄便攜的 MacBook Air，搭載 M2 晶片' },
    { id: '3', name: 'AirPods Pro', price: 7490, image: 'https://via.placeholder.com/200x200/FF3B30/FFFFFF?text=AirPods+Pro', description: '主動降噪的無線耳機' },
    { id: '4', name: 'Apple Watch Series 9', price: 12900, image: 'https://via.placeholder.com/200x200/FF9500/FFFFFF?text=Apple+Watch', description: '健康監測與運動追蹤的智慧手錶' },
    { id: '5', name: 'iPad Air', price: 18900, image: 'https://via.placeholder.com/200x200/5856D6/FFFFFF?text=iPad+Air', description: '多功能平板電腦，適合工作與娛樂' },
    { id: '6', name: 'Magic Keyboard', price: 10900, image: 'https://via.placeholder.com/200x200/8E8E93/FFFFFF?text=Magic+Keyboard', description: '為 iPad 設計的鍵盤保護套' }
];

document.addEventListener('DOMContentLoaded', function () {
    try {
        const savedCart = localStorage.getItem('shoppingCart');
        if (savedCart) {
            cartItems = JSON.parse(savedCart);
        }
    } catch (e) {
        console.log('載入購物車失敗');
    }

    updateCartCount();
    updateCartDisplay();

    if (document.getElementById('products-container')) {
        renderProductsList();
    }
});

function addToCart(product) {
    let found = false;
    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id === product.id) {
            cartItems[i].quantity += 1;
            found = true;
            break;
        }
    }

    if (!found) {
        cartItems.push({
            id: product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            quantity: 1
        });
    }

    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));

    updateCartCount();
    updateCartDisplay();

    showMessage(product.name + ' 已添加到購物車');
}

function removeFromCart(productId) {
    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id === productId) {
            cartItems.splice(i, 1);
            break;
        }
    }

    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    updateCartCount();
    updateCartDisplay();
    showMessage('商品已從購物車移除');
}

function changeQuantity(productId, newQuantity) {
    for (let i = 0; i < cartItems.length; i++) {
        if (cartItems[i].id === productId) {
            if (newQuantity <= 0) {
                cartItems.splice(i, 1);
            } else {
                cartItems[i].quantity = newQuantity;
            }
            break;
        }
    }

    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    updateCartCount();
    updateCartDisplay();
}

function clearAllCart() {
    cartItems = [];
    localStorage.setItem('shoppingCart', JSON.stringify(cartItems));
    updateCartCount();
    updateCartDisplay();
    showMessage('購物車已清空');
}

function updateCartCount() {
    cartCount = 0;
    for (let i = 0; i < cartItems.length; i++) {
        cartCount += cartItems[i].quantity;
    }

    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.textContent = cartCount;
    }
}

function calculateTotal() {
    cartTotal = 0;
    for (let i = 0; i < cartItems.length; i++) {
        cartTotal += cartItems[i].price * cartItems[i].quantity;
    }
    return cartTotal;
}

function updateCartDisplay() {
    const cartContainer = document.getElementById('cart-items');
    const cartTotalElement = document.getElementById('cart-total');
    const emptyCartElement = document.getElementById('empty-cart');

    if (!cartContainer) return;

    if (cartItems.length === 0) {
        cartContainer.innerHTML = '';
        if (emptyCartElement) emptyCartElement.style.display = 'block';
        if (cartTotalElement) cartTotalElement.style.display = 'none';
        return;
    }

    if (emptyCartElement) emptyCartElement.style.display = 'none';
    if (cartTotalElement) cartTotalElement.style.display = 'block';

    let html = '';
    for (let i = 0; i < cartItems.length; i++) {
        const item = cartItems[i];
        html += '<div class="cart-item" data-id="' + item.id + '">';
        html += '<div class="item-image">';
        html += '<img src="' + item.image + '" alt="' + item.name + '">';
        html += '</div>';
        html += '<div class="item-details">';
        html += '<h3>' + item.name + '</h3>';
        html += '<p class="item-price">NT$ ' + item.price.toLocaleString() + '</p>';
        html += '</div>';
        html += '<div class="item-controls">';
        html += '<button class="quantity-btn" onclick="changeQuantity(\'' + item.id + '\', ' + (item.quantity - 1) + ')">-</button>';
        html += '<span class="quantity">' + item.quantity + '</span>';
        html += '<button class="quantity-btn" onclick="changeQuantity(\'' + item.id + '\', ' + (item.quantity + 1) + ')">+</button>';
        html += '</div>';
        html += '<div class="item-total">';
        html += 'NT$ ' + (item.price * item.quantity).toLocaleString();
        html += '</div>';
        html += '<button class="remove-btn" onclick="removeFromCart(\'' + item.id + '\')">移除</button>';
        html += '</div>';
    }

    cartContainer.innerHTML = html;

    if (cartTotalElement) {
        const total = calculateTotal();
        cartTotalElement.innerHTML = '<div class="total-summary"><h3>總計: NT$ ' + total.toLocaleString() + '</h3><button class="clear-cart-btn" onclick="clearAllCart()">清空購物車</button></div>';
    }
}

function showMessage(message) {
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(function () {
        notification.classList.add('show');
    }, 100);

    setTimeout(function () {
        notification.classList.remove('show');
        setTimeout(function () {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

async function fetchProducts() {
    // 模擬非同步操作
    await new Promise(resolve => setTimeout(resolve, 1300));
    return Promise.resolve(products);
}

async function renderProductsList() {
    const container = document.getElementById('products-container');
    if (!container) return;

    let products = [];

    try {
        container.innerHTML = '<div class="loading">載入中...</div>';
        products = await fetchProducts();
    } catch (error) {
        console.error('取得商品列表失敗:', error);
    }

    let html = '';
    for (let i = 0; i < products.length; i++) {
        const product = products[i];
        html += '<div class="product-card">';
        html += '<div class="product-image">';
        html += '<img src="' + product.image + '" alt="' + product.name + '">';
        html += '</div>';
        html += '<div class="product-info">';
        html += '<h3>' + product.name + '</h3>';
        html += '<p class="product-description">' + product.description + '</p>';
        html += '<p class="product-price">NT$ ' + product.price.toLocaleString() + '</p>';
        html += '<button class="add-to-cart-btn" onclick="addToCart(' + JSON.stringify(product).replace(/"/g, '&quot;') + ')">';
        html += '加入購物車';
        html += '</button>';
        html += '</div>';
        html += '</div>';
    }

    container.innerHTML = html;
}

function debugCart() {
    console.log('購物車內容:', cartItems);
    console.log('總數量:', cartCount);
    console.log('總金額:', cartTotal);
}

function resetEverything() {
    cartItems = [];
    cartCount = 0;
    cartTotal = 0;
    localStorage.clear();
    updateCartCount();
    updateCartDisplay();
}

let isCartOpen = false;
let lastUpdateTime = Date.now();

function forceUpdate() {
    lastUpdateTime = Date.now();
    updateCartCount();
    updateCartDisplay();
}

function validateCart() {
    for (let i = 0; i < cartItems.length; i++) {
        if (!cartItems[i].id || !cartItems[i].name || !cartItems[i].price) {
            console.log('發現無效商品:', cartItems[i]);
            return false;
        }
    }
    return true;
}

function getCartItemCount() {
    let count = 0;
    for (let i = 0; i < cartItems.length; i++) {
        count += cartItems[i].quantity;
    }
    return count;
}

function getCartTotalPrice() {
    let total = 0;
    for (let i = 0; i < cartItems.length; i++) {
        total += cartItems[i].price * cartItems[i].quantity;
    }
    return total;
}

window.onload = function () {
    console.log('頁面載入完成');
    debugCart();
    validateCart();
    forceUpdate();
};
