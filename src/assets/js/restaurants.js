/**
 * Restaurants Page JavaScript
 * Handles restaurant browsing, searching, filtering, and booking
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Restaurants page loaded');
    
    // Check authentication (optional for browsing)
    if (!AuthService.isAuthenticated()) {
        console.log('User not authenticated - browsing in guest mode');
    }
    
    // Initialize page
    initializePage();
    loadRestaurants();
    initializeEventListeners();
});

// Global variables
let currentPage = 1;
let totalPages = 1;
let allRestaurants = [];
let filteredRestaurants = [];
let selectedRestaurant = null;

/**
 * Initialize page settings
 */
function initializePage() {
    // Set minimum date to today for booking
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
    document.getElementById('bookingDate').value = today;
    
    // Load time slots
    loadTimeSlots();
}

/**
 * Load time slots for booking
 */
function loadTimeSlots() {
    const timeSelect = document.getElementById('bookingTime');
    const times = [
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
    ];
    
    times.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        timeSelect.appendChild(option);
    });
}

/**
 * Load restaurants from API
 */
async function loadRestaurants() {
    try {
        showLoading(true);
        
        const response = await ApiService.getRestaurants({
            page: currentPage,
            limit: 12
        });
        
        if (response.success) {
            allRestaurants = response.restaurants || [];
            filteredRestaurants = [...allRestaurants];
            totalPages = response.totalPages || 1;
            
            renderRestaurants();
            updatePagination();
        } else {
            UIManager.showError('Failed to load restaurants');
        }
        
    } catch (error) {
        console.error('Error loading restaurants:', error);
        UIManager.showError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Render restaurants grid
 */
function renderRestaurants() {
    const grid = document.querySelector('.restaurants-grid');
    
    if (filteredRestaurants.length === 0) {
        grid.innerHTML = `
            <div class="no-results">
                <h3>No restaurants found</h3>
                <p>Try adjusting your filters or search terms</p>
            </div>
        `;
        return;
    }
    
    grid.innerHTML = filteredRestaurants.map(restaurant => `
        <div class="restaurant-card" data-id="${restaurant.id}">
            <div class="restaurant-image">
                <img src="${restaurant.image || '/assets/images/default-restaurant.jpg'}" alt="${restaurant.name}">
                <div class="restaurant-badge">${restaurant.cuisine}</div>
            </div>
            <div class="restaurant-details">
                <h3>${restaurant.name}</h3>
                <p class="restaurant-description">${restaurant.description}</p>
                <div class="restaurant-meta">
                    <span class="price-range">${restaurant.priceRange}</span>
                    <span class="rating">⭐ ${restaurant.rating || '4.0'}</span>
                    <span class="location">📍 ${restaurant.location}</span>
                </div>
                <div class="restaurant-actions">
                    <button class="btn-primary view-details-btn" data-id="${restaurant.id}">View Details</button>
                    <button class="btn-secondary quick-book-btn" data-id="${restaurant.id}">Quick Book</button>
                </div>
            </div>
        </div>
    `).join('');
    
    // Add event listeners to cards
    attachCardEventListeners();
}

/**
 * Attach event listeners to restaurant cards
 */
function attachCardEventListeners() {
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const restaurantId = e.target.dataset.id;
            showRestaurantDetails(restaurantId);
        });
    });
    
    document.querySelectorAll('.quick-book-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const restaurantId = e.target.dataset.id;
            quickBookRestaurant(restaurantId);
        });
    });
}

/**
 * Show restaurant details modal
 */
async function showRestaurantDetails(restaurantId) {
    try {
        const response = await ApiService.getRestaurantDetails(restaurantId);
        
        if (response.success) {
            selectedRestaurant = response.restaurant;
            populateModal(selectedRestaurant);
            document.getElementById('restaurantModal').style.display = 'block';
            
            // Load reviews
            loadRestaurantReviews(restaurantId);
        } else {
            UIManager.showError('Failed to load restaurant details');
        }
        
    } catch (error) {
        console.error('Error loading restaurant details:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Populate modal with restaurant data
 */
function populateModal(restaurant) {
    document.getElementById('modalRestaurantName').textContent = restaurant.name;
    document.getElementById('restaurantDescription').textContent = restaurant.description;
    document.getElementById('restaurantCuisine').textContent = restaurant.cuisine;
    document.getElementById('restaurantPrice').textContent = restaurant.priceRange;
    document.getElementById('restaurantLocation').textContent = restaurant.location;
    document.getElementById('restaurantRating').textContent = `⭐ ${restaurant.rating || '4.0'}`;
    document.getElementById('restaurantCapacity').textContent = `${restaurant.capacity} seats`;
    
    // Load gallery images
    loadGalleryImages(restaurant.images || []);
}

/**
 * Load gallery images
 */
function loadGalleryImages(images) {
    const mainImage = document.getElementById('mainImage');
    const thumbnails = document.querySelector('.gallery-thumbnails');
    
    if (images.length > 0) {
        mainImage.src = images[0];
        thumbnails.innerHTML = images.map((img, index) => `
            <img src="${img}" alt="Restaurant ${index + 1}" class="thumbnail ${index === 0 ? 'active' : ''}" data-index="${index}">
        `).join('');
        
        // Add click listeners to thumbnails
        thumbnails.querySelectorAll('.thumbnail').forEach(thumb => {
            thumb.addEventListener('click', (e) => {
                mainImage.src = e.target.src;
                thumbnails.querySelectorAll('.thumbnail').forEach(t => t.classList.remove('active'));
                e.target.classList.add('active');
            });
        });
    }
}

/**
 * Load restaurant reviews
 */
async function loadRestaurantReviews(restaurantId) {
    try {
        const response = await ApiService.getRestaurantReviews(restaurantId);
        
        if (response.success) {
            renderReviews(response.reviews || []);
        }
        
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

/**
 * Render reviews
 */
function renderReviews(reviews) {
    const reviewsList = document.getElementById('reviewsList');
    
    if (reviews.length === 0) {
        reviewsList.innerHTML = '<p>No reviews yet. Be the first to review!</p>';
        return;
    }
    
    reviewsList.innerHTML = reviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <strong>${review.customerName}</strong>
                <span class="review-date">${Utils.formatDate(review.date)}</span>
                <span class="review-rating">⭐ ${review.rating}</span>
            </div>
            <p class="review-content">${review.comment}</p>
        </div>
    `).join('');
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Search
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    // Filters
    document.getElementById('cuisineFilter').addEventListener('change', applyFilters);
    document.getElementById('priceFilter').addEventListener('change', applyFilters);
    document.getElementById('locationFilter').addEventListener('change', applyFilters);
    document.getElementById('availabilityFilter').addEventListener('change', applyFilters);
    
    // Modal
    document.getElementById('closeModalBtn').addEventListener('click', closeModal);
    document.getElementById('restaurantModal').addEventListener('click', (e) => {
        if (e.target.id === 'restaurantModal') closeModal();
    });
    
    // Booking
    document.getElementById('checkAvailabilityBtn').addEventListener('click', checkAvailability);
    document.getElementById('bookTableBtn').addEventListener('click', bookTable);
    
    // Pagination
    document.getElementById('prevPageBtn').addEventListener('click', () => changePage(-1));
    document.getElementById('nextPageBtn').addEventListener('click', () => changePage(1));
}

/**
 * Handle search
 */
function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchTerm) {
        filteredRestaurants = allRestaurants.filter(restaurant => 
            restaurant.name.toLowerCase().includes(searchTerm) ||
            restaurant.description.toLowerCase().includes(searchTerm) ||
            restaurant.cuisine.toLowerCase().includes(searchTerm) ||
            restaurant.location.toLowerCase().includes(searchTerm)
        );
    } else {
        filteredRestaurants = [...allRestaurants];
    }
    
    applyFilters();
}

/**
 * Apply filters
 */
function applyFilters() {
    const cuisine = document.getElementById('cuisineFilter').value;
    const price = document.getElementById('priceFilter').value;
    const location = document.getElementById('locationFilter').value;
    
    filteredRestaurants = filteredRestaurants.filter(restaurant => {
        if (cuisine && restaurant.cuisine.toLowerCase() !== cuisine.toLowerCase()) return false;
        if (price && restaurant.priceRange !== price) return false;
        if (location && restaurant.location.toLowerCase() !== location.toLowerCase()) return false;
        return true;
    });
    
    currentPage = 1;
    renderRestaurants();
    updatePagination();
}

/**
 * Check availability
 */
async function checkAvailability() {
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const partySize = document.getElementById('partySize').value;
    
    if (!date || !time || !partySize) {
        UIManager.showFormMessage('Please fill in all booking details', 'error', '.booking-form');
        return;
    }
    
    if (!AuthService.isAuthenticated()) {
        UIManager.showInfo('Please login to make a booking');
        setTimeout(() => {
            window.location.href = '/views/pages/login.html';
        }, 1500);
        return;
    }
    
    UIManager.setButtonLoading('#checkAvailabilityBtn', 'Checking...');
    
    try {
        const response = await ApiService.checkAvailability(selectedRestaurant.id, {
            date,
            time,
            partySize
        });
        
        if (response.success) {
            if (response.available) {
                UIManager.showSuccess('Table available! You can now book.');
                document.getElementById('bookTableBtn').disabled = false;
            } else {
                UIManager.showFormMessage('No tables available for selected time. Please try a different time.', 'error', '.booking-form');
                document.getElementById('bookTableBtn').disabled = true;
            }
        } else {
            UIManager.showFormMessage(response.message || 'Failed to check availability', 'error', '.booking-form');
        }
        
    } catch (error) {
        console.error('Availability check error:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#checkAvailabilityBtn');
}

/**
 * Book table
 */
async function bookTable() {
    const date = document.getElementById('bookingDate').value;
    const time = document.getElementById('bookingTime').value;
    const partySize = document.getElementById('partySize').value;
    
    UIManager.setButtonLoading('#bookTableBtn', 'Booking...');
    
    try {
        const response = await ApiService.createBooking({
            restaurantId: selectedRestaurant.id,
            date,
            time,
            partySize
        });
        
        if (response.success) {
            UIManager.showSuccess('Booking confirmed! Check your email for details.');
            closeModal();
            
            // Redirect to bookings page
            setTimeout(() => {
                window.location.href = '/views/pages/customer-bookings.html';
            }, 2000);
        } else {
            UIManager.showFormMessage(response.message || 'Failed to create booking', 'error', '.booking-form');
        }
        
    } catch (error) {
        console.error('Booking error:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#bookTableBtn');
}

/**
 * Quick book restaurant
 */
function quickBookRestaurant(restaurantId) {
    if (!AuthService.isAuthenticated()) {
        UIManager.showInfo('Please login to make a booking');
        setTimeout(() => {
            window.location.href = '/views/pages/login.html';
        }, 1500);
        return;
    }
    
    showRestaurantDetails(restaurantId);
}

/**
 * Close modal
 */
function closeModal() {
    document.getElementById('restaurantModal').style.display = 'none';
    selectedRestaurant = null;
    document.getElementById('bookTableBtn').disabled = true;
}

/**
 * Change page
 */
function changePage(direction) {
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        currentPage = newPage;
        loadRestaurants();
    }
}

/**
 * Update pagination
 */
function updatePagination() {
    document.getElementById('currentPage').textContent = currentPage;
    document.getElementById('totalPages').textContent = totalPages;
    document.getElementById('prevPageBtn').disabled = currentPage === 1;
    document.getElementById('nextPageBtn').disabled = currentPage === totalPages;
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('restaurantsLoading');
    const grid = document.querySelector('.restaurants-grid');
    
    if (show) {
        loading.style.display = 'block';
        grid.style.display = 'none';
    } else {
        loading.style.display = 'none';
        grid.style.display = 'grid';
    }
}
