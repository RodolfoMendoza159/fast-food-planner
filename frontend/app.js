// --- STATE MANAGEMENT ---
let authToken = null;

// --- API CONFIGURATION ---
const API_BASE_URL = 'http://127.0.0.1:8000/api';

// --- DOM ELEMENTS ---
const loginContainer = document.getElementById('login-container');
const appContainer = document.getElementById('app-container');
const menuContainer = document.getElementById('menu-container'); // NEW
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const restaurantList = document.getElementById('restaurant-list');
const menuItemList = document.getElementById('menu-item-list'); // NEW
const menuRestaurantName = document.getElementById('menu-restaurant-name'); // NEW
const logoutButton = document.getElementById('logout-button');
const backButton = document.getElementById('back-button'); // NEW


// --- EVENT LISTENERS ---

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    try {
        const response = await fetch(`${API_BASE_URL}/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        if (!response.ok) throw new Error('Invalid username or password');
        const data = await response.json();
        authToken = data.token;
        showAppScreen();
        fetchRestaurants();
    } catch (error) {
        loginError.textContent = error.message;
    }
});

logoutButton.addEventListener('click', () => {
    authToken = null;
    showLoginScreen();
});

// NEW: Event listener for the back button on the menu screen
backButton.addEventListener('click', () => {
    showAppScreen();
});

// --- FUNCTIONS ---

async function fetchRestaurants() {
    if (!authToken) return;
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/`, {
            method: 'GET',
            headers: { 'Authorization': `Token ${authToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch restaurants.');
        const data = await response.json();
        restaurantList.innerHTML = '';
        data.forEach(restaurant => {
            const listItem = document.createElement('li');
            listItem.textContent = restaurant.name;
            // NEW: Make each list item clickable
            listItem.style.cursor = 'pointer';
            listItem.addEventListener('click', () => fetchMenuForRestaurant(restaurant.id));
            restaurantList.appendChild(listItem);
        });
    } catch (error) {
        console.error(error);
    }
}

// NEW: Function to fetch the menu for a specific restaurant
async function fetchMenuForRestaurant(restaurantId) {
    if (!authToken) return;
    try {
        const response = await fetch(`${API_BASE_URL}/restaurants/${restaurantId}/`, {
            method: 'GET',
            headers: { 'Authorization': `Token ${authToken}` }
        });
        if (!response.ok) throw new Error('Failed to fetch menu.');
        const data = await response.json();
        
        menuRestaurantName.textContent = data.restaurant.name; // Set the restaurant name
        menuItemList.innerHTML = ''; // Clear old menu items

        data.menu_items.forEach(item => {
            const listItem = document.createElement('li');
            listItem.textContent = `${item.name} - ${item.calories} cal`;
            menuItemList.appendChild(listItem);
        });

        showMenuScreen(); // Switch to the menu view
    } catch (error) {
        console.error(error);
    }
}

// --- VIEW SWITCHING FUNCTIONS (UPDATED) ---

function showAppScreen() {
    loginContainer.style.display = 'none';
    menuContainer.style.display = 'none'; // NEW: Hide menu
    appContainer.style.display = 'block';
}

function showLoginScreen() {
    appContainer.style.display = 'none';
    menuContainer.style.display = 'none'; // NEW: Hide menu
    loginContainer.style.display = 'block';
    loginError.textContent = '';
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// NEW: Function to show the menu screen
function showMenuScreen() {
    appContainer.style.display = 'none';
    menuContainer.style.display = 'block';
}