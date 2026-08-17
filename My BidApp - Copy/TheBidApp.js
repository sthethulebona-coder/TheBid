const gamesData = [
    { id: 1, name: "Halo", category: "Shooter", price: 599.99, img: "Halo.jpeg" },
    { id: 2, name: "Minecraft", category: "Sandbox", price: 299.99, img: "Minecraft.jpeg" },
    { id: 3, name: "Witcher 3", category: "RPG", price: 399.99, img: "Witcher3.jpeg" },
    { id: 4, name: "FC 25", category: "Sports", price: 699.99, img: "Fc25.jpeg" },
    { id: 5, name: "Overwatch 2", category: "Shooter", price: 0.00, img: "Overwatch2.jpeg" }
];

const equipmentData = [
    { id: 6, name: "Logitech Mouse", category: "Accessory", price: 499.99, img: "Logitech.jpeg" },
    { id: 7, name: "Mechanical Keyboard", category: "Peripheral", price: 899.99, img: "Keyboard.jpeg" },
    { id: 8, name: "Gaming Chair", category: "Furniture", price: 1999.99, img: "Chair.jpeg" },
    { id: 9, name: "Headphones", category: "Audio", price: 799.99, img: "headphones.jpeg" },
    { id: 10, name: "Monitor", category: "Display", price: 1499.99, img: "Monitor.jpeg" }
];

const auctionData = [
    { id: 101, name: "Rare Retro Console", currentBid: 1200.00, img: "Console.jpeg" },
    { id: 102, name: "Collector's Edition Statue", currentBid: 850.00, img: "Statue.jpeg" }
];


function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    const countElement = document.getElementById('cart-count');
    if (countElement) {
        countElement.textContent = cart.length;
    }
}

function addToCart(itemName, price) {
    const cart = getCart();
    cart.push({ name: itemName, price: parseFloat(price) });
    saveCart(cart);
}

function clearCart() {
    localStorage.removeItem('cart');
    updateCartBadge();
    renderCartPage();
}


function renderCards(data, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = data.map(item => `
        <div class="card">
            <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150?text=${encodeURIComponent(item.name)}'" />
            <div class="card-title">${item.name}</div>
            <div class="card-meta">${item.category}</div>
            <div class="card-price">${item.price === 0 ? 'Free' : 'R' + item.price.toFixed(2)}</div>
            <button class="btn" onclick="addToCart('${item.name}', ${item.price})">Add to Cart</button>
        </div>
    `).join('');
}


function renderBidding() {
    const container = document.getElementById('bidding-grid');
    if (!container) return;

    container.innerHTML = auctionData.map(item => `
        <div class="card">
            <img src="${item.img}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150?text=${encodeURIComponent(item.name)}'" />
            <div class="card-title">${item.name}</div>
            <div class="card-price">Current Bid: R<span id="bid-${item.id}">${item.currentBid.toFixed(2)}</span></div>
            <input type="number" id="input-${item.id}" class="bid-input" placeholder="Enter higher amount" />
            <button class="btn" onclick="placeBid(${item.id})">Place Bid</button>
        </div>
    `).join('');
}

function placeBid(id) {
    const item = auctionData.find(a => a.id === id);
    const input = document.getElementById(`input-${id}`);
    const bidAmount = parseFloat(input.value);

    if (bidAmount > item.currentBid) {
        item.currentBid = bidAmount;
        document.getElementById(`bid-${id}`).textContent = bidAmount.toFixed(2);
        input.value = '';
        alert('Bid placed successfully!');
    } else {
        alert('Bid must be higher than current bid.');
    }
}


function filterProducts() {
    const searchInput = document.getElementById('search-input');
    const categorySelect = document.getElementById('category-filter');
    
    if (!searchInput || !categorySelect) return;

    const searchTerm = searchInput.value.toLowerCase();
    const selectedCategory = categorySelect.value;

    const allProducts = [...gamesData, ...equipmentData];

    const filtered = allProducts.filter(item => {
        const matchesSearch = item.name.toLowerCase().includes(searchTerm);
        const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    renderCards(filtered, 'all-products-grid');
}


function handleContactSubmit(event) {
    event.preventDefault();
    const feedback = document.getElementById('contact-feedback');
    if (feedback) {
        feedback.textContent = 'Thank you for reaching out! We will get back to you shortly.';
        feedback.className = 'feedback-msg success';
        document.getElementById('contact-form').reset();
    }
}


function loadProfile() {
    const username = localStorage.getItem('profile_username') || 'GamerOne';
    const email = localStorage.getItem('profile_email') || 'gamerone@example.com';

    const usernameDisplay = document.getElementById('profile-username');
    const emailDisplay = document.getElementById('profile-email');
    const usernameInput = document.getElementById('username-input');
    const emailInput = document.getElementById('email-input');

    if (usernameDisplay) usernameDisplay.textContent = username;
    if (emailDisplay) emailDisplay.textContent = email;
    if (usernameInput) usernameInput.value = username;
    if (emailInput) emailInput.value = email;
}

function handleProfileUpdate(event) {
    event.preventDefault();
    const newUsername = document.getElementById('username-input').value;
    const newEmail = document.getElementById('email-input').value;

    localStorage.setItem('profile_username', newUsername);
    localStorage.setItem('profile_email', newEmail);

    loadProfile();
    alert('Profile updated successfully!');
}


function renderCartPage() {
    const container = document.getElementById('cart-items');
    const totalElement = document.getElementById('cart-total');
    if (!container) return;

    const cart = getCart();
    if (cart.length === 0) {
        container.innerHTML = '<p>Your cart is empty.</p>';
        if (totalElement) totalElement.textContent = '0.00';
        return;
    }

    let total = 0;
    container.innerHTML = cart.map(item => {
        total += item.price;
        return `
            <div class="cart-item">
                <span>${item.name}</span>
                <span>R${item.price.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    if (totalElement) totalElement.textContent = total.toFixed(2);
}


function handleCheckout(event) {
    event.preventDefault();

    const cart = getCart();
    if (cart.length === 0) {
        alert('Your cart is empty. Add items before placing an order.');
        return;
    }

    const name = document.getElementById('checkout-name').value;
    const email = document.getElementById('checkout-email').value;

    const orderId = 'GS-' + Math.floor(100000 + Math.random() * 900000);

    document.getElementById('modal-customer-name').textContent = name;
    document.getElementById('modal-customer-email').textContent = email;
    document.getElementById('modal-order-id').textContent = orderId;

    const modal = document.getElementById('confirmation-modal');
    if (modal) {
        modal.classList.add('active');
    }

    document.getElementById('checkout-form').reset();
    localStorage.removeItem('cart');
    updateCartBadge();
    renderCartPage();
}

function closeConfirmationModal() {
    const modal = document.getElementById('confirmation-modal');

    if (modal) {
        modal.classList.remove('active');
    }
    window.location.href = 'ShoppingPage.html';
}


document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    
    renderCards(gamesData, 'games-grid');
    renderCards(equipmentData, 'equipment-grid');
    renderCards([...gamesData, ...equipmentData], 'all-products-grid');
    renderBidding();
    loadProfile();
    renderCartPage();
});