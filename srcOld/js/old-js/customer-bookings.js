/**
 * Customer Bookings Page JavaScript
 * Handles viewing, modifying, canceling, and reviewing bookings
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer bookings page loaded');
    
    // Check authentication and permissions
    if (!Utils.requireAuth()) return;
    if (!AuthService.isCustomer()) {
        UIManager.showError('Access denied. This page is for customers only.');
        setTimeout(() => {
            window.location.href = '/views/pages/index.html';
        }, 2000);
        return;
    }
    
    // Initialize page
    currentFilter = 'all';
    loadBookings();
    initializeEventListeners();
});

// Global variables
let currentFilter = 'all';
let allBookings = [];
let selectedBooking = null;

/**
 * Load customer bookings
 */
async function loadBookings() {
    try {
        showLoading(true);
        
        const response = await ApiService.getCustomerBookings();
        
        if (response.success) {
            allBookings = response.bookings || [];
            renderBookings();
        } else {
            UIManager.showError('Failed to load bookings');
        }
        
    } catch (error) {
        console.error('Error loading bookings:', error);
        UIManager.showError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Render bookings list
 */
function renderBookings() {
    const bookingsList = document.querySelector('.bookings-list');
    const emptyState = document.getElementById('noBookings');
    
    // Filter bookings based on current filter
    const filteredBookings = filterBookings(allBookings, currentFilter);
    
    if (filteredBookings.length === 0) {
        bookingsList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    bookingsList.style.display = 'block';
    emptyState.style.display = 'none';
    
    bookingsList.innerHTML = filteredBookings.map(booking => `
        <div class="booking-card" data-id="${booking.id}">
            <div class="booking-header">
                <div class="booking-info">
                    <h3>${booking.restaurantName}</h3>
                    <p class="booking-date-time">
                        📅 ${Utils.formatDate(booking.date)} at ${booking.time}
                    </p>
                </div>
                <div class="booking-status">
                    <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span>
                </div>
            </div>
            
            <div class="booking-details">
                <div class="detail-item">
                    <strong>Party Size:</strong> ${booking.partySize} ${booking.partySize === 1 ? 'person' : 'people'}
                </div>
                <div class="detail-item">
                    <strong>Table:</strong> ${booking.tableNumber || 'Assigned on arrival'}
                </div>
                ${booking.specialRequests ? `
                    <div class="detail-item">
                        <strong>Special Requests:</strong> ${booking.specialRequests}
                    </div>
                ` : ''}
            </div>
            
            <div class="booking-actions">
                ${getBookingActions(booking)}
            </div>
        </div>
    `).join('');
    
    // Add event listeners to booking cards
    attachBookingEventListeners();
}

/**
 * Filter bookings based on status
 */
function filterBookings(bookings, filter) {
    switch (filter) {
        case 'upcoming':
            return bookings.filter(b => b.status === 'Confirmed' || b.status === 'Pending');
        case 'completed':
            return bookings.filter(b => b.status === 'Completed');
        case 'cancelled':
            return bookings.filter(b => b.status === 'Cancelled');
        default:
            return bookings;
    }
}

/**
 * Get available actions for a booking
 */
function getBookingActions(booking) {
    const actions = [];
    
    if (booking.status === 'Confirmed' || booking.status === 'Pending') {
        actions.push(`<button class="btn-primary view-details-btn" data-id="${booking.id}">View Details</button>`);
        actions.push(`<button class="btn-secondary modify-btn" data-id="${booking.id}">Modify</button>`);
        actions.push(`<button class="btn-danger cancel-btn" data-id="${booking.id}">Cancel</button>`);
    } else if (booking.status === 'Completed') {
        actions.push(`<button class="btn-primary view-details-btn" data-id="${booking.id}">View Details</button>`);
        if (!booking.reviewed) {
            actions.push(`<button class="btn-success review-btn" data-id="${booking.id}">Leave Review</button>`);
        }
    } else {
        actions.push(`<button class="btn-primary view-details-btn" data-id="${booking.id}">View Details</button>`);
    }
    
    return actions.join(' ');
}

/**
 * Attach event listeners to booking cards
 */
function attachBookingEventListeners() {
    document.querySelectorAll('.view-details-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            showBookingDetails(bookingId);
        });
    });
    
    document.querySelectorAll('.modify-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            showModifyBookingModal(bookingId);
        });
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            cancelBooking(bookingId);
        });
    });
    
    document.querySelectorAll('.review-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            showReviewModal(bookingId);
        });
    });
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Filter tabs
    document.querySelectorAll('.btn-tab').forEach(tab => {
        tab.addEventListener('click', (e) => {
            document.querySelectorAll('.btn-tab').forEach(t => t.classList.remove('active'));
            e.target.classList.add('active');
            currentFilter = e.target.dataset.status;
            renderBookings();
        });
    });
    
    // Modal close buttons
    document.getElementById('closeBookingModalBtn').addEventListener('click', closeBookingModal);
    document.getElementById('closeModifyModalBtn').addEventListener('click', closeModifyModal);
    document.getElementById('closeReviewModalBtn').addEventListener('click', closeReviewModal);
    
    // Modify booking
    document.getElementById('saveChangesBtn').addEventListener('click', saveBookingChanges);
    document.getElementById('cancelChangesBtn').addEventListener('click', closeModifyModal);
    
    // Review
    document.querySelectorAll('.star').forEach(star => {
        star.addEventListener('click', (e) => {
            const rating = e.target.dataset.rating;
            document.getElementById('reviewRating').value = rating;
            updateStarDisplay(rating);
        });
    });
    
    document.getElementById('submitReviewBtn').addEventListener('click', submitReview);
    document.getElementById('cancelReviewBtn').addEventListener('click', closeReviewModal);
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
}

/**
 * Show booking details modal
 */
async function showBookingDetails(bookingId) {
    try {
        const response = await ApiService.getBookingDetails(bookingId);
        
        if (response.success) {
            selectedBooking = response.booking;
            populateBookingModal(selectedBooking);
            document.getElementById('bookingModal').style.display = 'block';
        } else {
            UIManager.showError('Failed to load booking details');
        }
        
    } catch (error) {
        console.error('Error loading booking details:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Populate booking modal
 */
function populateBookingModal(booking) {
    document.getElementById('modalRestaurantName').textContent = booking.restaurantName;
    document.getElementById('modalBookingDate').textContent = Utils.formatDate(booking.date);
    document.getElementById('modalBookingTime').textContent = booking.time;
    document.getElementById('modalPartySize').textContent = `${booking.partySize} ${booking.partySize === 1 ? 'person' : 'people'}`;
    document.getElementById('modalBookingStatus').textContent = booking.status;
    document.getElementById('modalSpecialRequests').textContent = booking.specialRequests || 'None';
    
    // Update status badge class
    const statusElement = document.getElementById('modalBookingStatus');
    statusElement.className = `booking-status status-${booking.status.toLowerCase()}`;
    
    // Show/hide action buttons based on status
    const modifyBtn = document.getElementById('modifyBookingBtn');
    const cancelBtn = document.getElementById('cancelBookingBtn');
    const reviewBtn = document.getElementById('leaveReviewBtn');
    
    if (booking.status === 'Confirmed' || booking.status === 'Pending') {
        modifyBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
        reviewBtn.style.display = 'none';
    } else if (booking.status === 'Completed') {
        modifyBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        reviewBtn.style.display = booking.reviewed ? 'none' : 'inline-block';
    } else {
        modifyBtn.style.display = 'none';
        cancelBtn.style.display = 'none';
        reviewBtn.style.display = 'none';
    }
    
    // Add event listeners to action buttons
    modifyBtn.onclick = () => showModifyBookingModal(booking.id);
    cancelBtn.onclick = () => cancelBooking(booking.id);
    reviewBtn.onclick = () => showReviewModal(booking.id);
}

/**
 * Show modify booking modal
 */
async function showModifyBookingModal(bookingId) {
    try {
        const response = await ApiService.getBookingDetails(bookingId);
        
        if (response.success) {
            selectedBooking = response.booking;
            populateModifyModal(selectedBooking);
            document.getElementById('modifyBookingModal').style.display = 'block';
        } else {
            UIManager.showError('Failed to load booking details');
        }
        
    } catch (error) {
        console.error('Error loading booking details:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Populate modify modal
 */
function populateModifyModal(booking) {
    document.getElementById('newBookingDate').value = booking.date;
    document.getElementById('newPartySize').value = booking.partySize;
    document.getElementById('specialRequests').value = booking.specialRequests || '';
    
    // Load time slots
    loadTimeSlots('newBookingTime', booking.time);
}

/**
 * Load time slots for select
 */
function loadTimeSlots(selectId, selectedTime = '') {
    const select = document.getElementById(selectId);
    const times = [
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
    ];
    
    select.innerHTML = '<option value="">Select time</option>';
    times.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        if (time === selectedTime) option.selected = true;
        select.appendChild(option);
    });
}

/**
 * Save booking changes
 */
async function saveBookingChanges() {
    const newDate = document.getElementById('newBookingDate').value;
    const newTime = document.getElementById('newBookingTime').value;
    const newPartySize = document.getElementById('newPartySize').value;
    const specialRequests = document.getElementById('specialRequests').value.trim();
    
    if (!newDate || !newTime || !newPartySize) {
        UIManager.showFormMessage('Please fill in all required fields', 'error', '.modify-form');
        return;
    }
    
    UIManager.setButtonLoading('#saveChangesBtn', 'Saving...');
    
    try {
        const response = await ApiService.modifyBooking(selectedBooking.id, {
            date: newDate,
            time: newTime,
            partySize: newPartySize,
            specialRequests
        });
        
        if (response.success) {
            UIManager.showSuccess('Booking updated successfully');
            closeModifyModal();
            closeBookingModal();
            loadBookings(); // Reload bookings list
        } else {
            UIManager.showFormMessage(response.message || 'Failed to update booking', 'error', '.modify-form');
        }
        
    } catch (error) {
        console.error('Error modifying booking:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#saveChangesBtn');
}

/**
 * Cancel booking
 */
async function cancelBooking(bookingId) {
    if (!confirm('Are you sure you want to cancel this booking?')) {
        return;
    }
    
    try {
        const response = await ApiService.cancelBooking(bookingId);
        
        if (response.success) {
            UIManager.showSuccess('Booking cancelled successfully');
            loadBookings(); // Reload bookings list
        } else {
            UIManager.showError(response.message || 'Failed to cancel booking');
        }
        
    } catch (error) {
        console.error('Error cancelling booking:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Show review modal
 */
function showReviewModal(bookingId) {
    selectedBooking = { id: bookingId };
    document.getElementById('reviewModal').style.display = 'block';
    updateStarDisplay(5); // Default 5 stars
}

/**
 * Update star display
 */
function updateStarDisplay(rating) {
    document.querySelectorAll('.star').forEach((star, index) => {
        star.style.opacity = index < rating ? '1' : '0.3';
    });
}

/**
 * Submit review
 */
async function submitReview() {
    const rating = document.getElementById('reviewRating').value;
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (!comment) {
        UIManager.showFormMessage('Please write a review', 'error', '.review-form');
        return;
    }
    
    UIManager.setButtonLoading('#submitReviewBtn', 'Submitting...');
    
    try {
        const response = await ApiService.submitReview(selectedBooking.id, {
            rating: parseInt(rating),
            comment
        });
        
        if (response.success) {
            UIManager.showSuccess('Review submitted successfully');
            closeReviewModal();
            loadBookings(); // Reload bookings to update reviewed status
        } else {
            UIManager.showFormMessage(response.message || 'Failed to submit review', 'error', '.review-form');
        }
        
    } catch (error) {
        console.error('Error submitting review:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#submitReviewBtn');
}

/**
 * Close modals
 */
function closeBookingModal() {
    document.getElementById('bookingModal').style.display = 'none';
    selectedBooking = null;
}

function closeModifyModal() {
    document.getElementById('modifyBookingModal').style.display = 'none';
    selectedBooking = null;
}

function closeReviewModal() {
    document.getElementById('reviewModal').style.display = 'none';
    selectedBooking = null;
    document.getElementById('reviewComment').value = '';
    updateStarDisplay(5);
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('bookingsLoading');
    const bookingsList = document.querySelector('.bookings-list');
    
    if (show) {
        loading.style.display = 'block';
        bookingsList.style.display = 'none';
    } else {
        loading.style.display = 'none';
        bookingsList.style.display = 'block';
    }
}
