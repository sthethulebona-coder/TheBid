let gamesData = [];
let equipmentData = [];
let auctionData = [];

// Fetch initial data from SQLite backend
async function fetchAppData() {
    try {
        const prodRes = await fetch('http://localhost:3000/api/products');
        const products = await prodRes.json();
        gamesData = products.filter(p => p.type === 'game');
        equipmentData = products.filter(p => p.type === 'equipment');

        const aucRes = await fetch('http://localhost:3000/api/auctions');
        auctionData = await aucRes.json();

        // Trigger UI rendering once data is loaded
        renderCards(gamesData, 'games-grid');
        renderCards(equipmentData, 'equipment-grid');
        renderCards([...gamesData, ...equipmentData], 'all-products-grid');
        renderBidding();
    } catch (e) {
        console.error("Could not load backend data:", e);
    }
}

function getCart() {
    return JSON.parse(localStorage.getItem('cart')) || [];
}

function saveCart(cart) {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

function updateCartBadge() {
    const cart = getCart();
    document.querySelectorAll('#cart-count').forEach(el => {
        el.textContent = cart.length;
    });
}

function addToCart(itemName, price) {
    const cart = getCart();
    cart.push({ name: itemName, price: parseFloat(price) });
    saveCart(cart);
    alert(`${itemName} added to cart!`);
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

async function placeBid(id) {
    const item = auctionData.find(a => a.id === id);
    const input = document.getElementById(`input-${id}`);
    const bidAmount = parseFloat(input.value);

    if (bidAmount > item.currentBid) {
        item.currentBid = bidAmount;
        document.getElementById(`bid-${id}`).textContent = bidAmount.toFixed(2);
        input.value = '';

        // Save update to SQLite backend
        await fetch('http://localhost:3000/api/bid', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id, newBid: bidAmount })
        });

        alert('Bid placed successfully and saved to database!');
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
    const username = localStorage.getItem('currentUser') || 'GamerOne';
    const email = `${username}@example.com`;

    const usernameDisplay = document.getElementById('profile-username');
    const emailDisplay = document.getElementById('profile-email');
    const usernameInput = document.getElementById('username-input');
    const emailInput = document.getElementById('email-input');

    if (usernameDisplay) usernameDisplay.textContent = username;
    if (emailDisplay) emailDisplay.textContent = email;
    if (usernameInput) usernameInput.value = username;
    if (emailInput) emailInput.value = email;
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
            <div class="cart-item" style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>${item.name}</span>
                <span>R${item.price.toFixed(2)}</span>
            </div>
        `;
    }).join('');

    if (totalElement) totalElement.textContent = total.toFixed(2);
}

document.addEventListener('DOMContentLoaded', () => {
    updateCartBadge();
    fetchAppData();
    loadProfile();
    renderCartPage();
});