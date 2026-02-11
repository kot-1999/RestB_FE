/**
 * Staff Bookings Page JavaScript
 * Handles booking management for AdminStaff role
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Staff bookings page loaded');
    
    // Check authentication and permissions
    if (!Utils.requireAuth()) return;
    if (!AuthService.isAdminStaff() && !AuthService.isSuperAdmin()) {
        UIManager.showError('Access denied. This page is for staff members only.');
        setTimeout(() => {
            window.location.href = '/views/pages/index.html';
        }, 2000);
        return;
    }
    
    // Initialize page
    currentFilter = 'all';
    loadBookings();
    loadRestaurants();
    initializeEventListeners();
});

// Global variables
let currentFilter = 'all';
let allBookings = [];
let allRestaurants = [];
let selectedBooking = null;

/**
 * Load bookings from API
 */
async function loadBookings() {
    try {
        showLoading(true);
        
        const response = await ApiService.getStaffBookings();
        
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
 * Load restaurants for booking form
 */
async function loadRestaurants() {
    try {
        const response = await ApiService.getRestaurants();
        
        if (response.success) {
            allRestaurants = response.restaurants || [];
            populateRestaurantSelect();
        }
        
    } catch (error) {
        console.error('Error loading restaurants:', error);
    }
}

/**
 * Populate restaurant select dropdown
 */
function populateRestaurantSelect() {
    const select = document.getElementById('bookingRestaurant');
    
    allRestaurants.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant.id;
        option.textContent = restaurant.name;
        select.appendChild(option);
    });
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
    
    bookingsList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    bookingsList.innerHTML = filteredBookings.map(booking => `
        <div class="booking-card" data-id="${booking.id}">
            <div class="booking-header">
                <div class="booking-info">
                    <h3>${booking.customerName}</h3>
                    <p class="booking-meta">
                        📅 ${Utils.formatDate(booking.date)} at ${booking.time}
                        • 🏪 ${booking.restaurantName}
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
                    <strong>Table:</strong> ${booking.tableNumber || 'Not assigned'}
                </div>
                <div class="detail-item">
                    <strong>Phone:</strong> ${booking.customerPhone || 'Not provided'}
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
        case 'pending':
            return bookings.filter(b => b.status === 'Pending');
        case 'confirmed':
            return bookings.filter(b => b.status === 'Confirmed');
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
    
    if (booking.status === 'Pending') {
        actions.push(`<button class="btn-success approve-btn" data-id="${booking.id}">Approve</button>`);
        actions.push(`<button class="btn-danger reject-btn" data-id="${booking.id}">Reject</button>`);
        actions.push(`<button class="btn-primary view-details-btn" data-id="${booking.id}">View Details</button>`);
    } else if (booking.status === 'Confirmed') {
        actions.push(`<button class="btn-warning modify-btn" data-id="${booking.id}">Modify</button>`);
        actions.push(`<button class="btn-success complete-btn" data-id="${booking.id}">Mark Completed</button>`);
        actions.push(`<button class="btn-danger cancel-btn" data-id="${booking.id}">Cancel</button>`);
        actions.push(`<button class="btn-primary view-details-btn" data-id="${booking.id}">View Details</button>`);
    } else if (booking.status === 'Completed') {
        actions.push(`<button class="btn-primary view-details-btn" data-id="${booking.id}">View Details</button>`);
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
    
    document.querySelectorAll('.approve-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            approveBooking(bookingId);
        });
    });
    
    document.querySelectorAll('.reject-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            rejectBooking(bookingId);
        });
    });
    
    document.querySelectorAll('.modify-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            modifyBooking(bookingId);
        });
    });
    
    document.querySelectorAll('.complete-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            completeBooking(bookingId);
        });
    });
    
    document.querySelectorAll('.cancel-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const bookingId = e.target.dataset.id;
            cancelBooking(bookingId);
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
    
    // Search and filters
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('bookingSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    document.getElementById('dateFilter').addEventListener('change', applyFilters);
    document.getElementById('timeFilter').addEventListener('change', applyFilters);
    document.getElementById('partySizeFilter').addEventListener('change', applyFilters);
    
    // Add booking
    document.getElementById('addBookingBtn').addEventListener('click', showAddBookingModal);
    
    // Modal close buttons
    document.getElementById('closeDetailsModalBtn').addEventListener('click', closeDetailsModal);
    document.getElementById('closeAddModalBtn').addEventListener('click', closeAddModal);
    
    // Add booking form
    document.getElementById('saveBookingBtn').addEventListener('click', saveBooking);
    document.getElementById('cancelAddBookingBtn').addEventListener('click', closeAddModal);
    
    // Booking details actions
    document.getElementById('approveBookingBtn').addEventListener('click', () => {
        approveBooking(selectedBooking.id);
    });
    
    document.getElementById('rejectBookingBtn').addEventListener('click', () => {
        rejectBooking(selectedBooking.id);
    });
    
    document.getElementById('modifyBookingBtn').addEventListener('click', () => {
        modifyBooking(selectedBooking.id);
    });
    
    document.getElementById('completeBookingBtn').addEventListener('click', () => {
        completeBooking(selectedBooking.id);
    });
    
    document.getElementById('cancelBookingBtn').addEventListener('click', () => {
        cancelBooking(selectedBooking.id);
    });
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Export and print
    document.getElementById('exportBookingsBtn').addEventListener('click', exportBookings);
    document.getElementById('printScheduleBtn').addEventListener('click', printSchedule);
    
    // Clear filters
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('bookingDate').min = today;
    
    // Load time slots
    loadTimeSlots();
}

/**
 * Load time slots for select
 */
function loadTimeSlots() {
    const select = document.getElementById('bookingTime');
    const times = [
        '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
        '14:00', '14:30', '17:00', '17:30', '18:00', '18:30',
        '19:00', '19:30', '20:00', '20:30', '21:00', '21:30'
    ];
    
    times.forEach(time => {
        const option = document.createElement('option');
        option.value = time;
        option.textContent = time;
        select.appendChild(option);
    });
}

/**
 * Show booking details
 */
async function showBookingDetails(bookingId) {
    try {
        const response = await ApiService.getBookingDetails(bookingId);
        
        if (response.success) {
            selectedBooking = response.booking;
            populateDetailsModal(selectedBooking);
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
 * Show add booking modal
 */
function showAddBookingModal() {
    selectedBooking = null;
    document.getElementById('addBookingModal').style.display = 'block';
    resetBookingForm();
}

/**
 * Approve booking
 */
async function approveBooking(bookingId) {
    if (!confirm('Are you sure you want to approve this booking?')) {
        return;
    }
    
    try {
        const response = await ApiService.approveBooking(bookingId);
        
        if (response.success) {
            UIManager.showSuccess('Booking approved successfully');
            loadBookings(); // Reload bookings list
        } else {
            UIManager.showError(response.message || 'Failed to approve booking');
        }
        
    } catch (error) {
        console.error('Error approving booking:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Reject booking
 */
async function rejectBooking(bookingId) {
    const reason = prompt('Please provide a reason for rejection:');
    if (!reason) {
        return;
    }
    
    try {
        const response = await ApiService.rejectBooking(bookingId, { reason });
        
        if (response.success) {
            UIManager.showSuccess('Booking rejected successfully');
            loadBookings(); // Reload bookings list
        } else {
            UIManager.showError(response.message || 'Failed to reject booking');
        }
        
    } catch (error) {
        console.error('Error rejecting booking:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Modify booking
 */
async function modifyBooking(bookingId) {
    // For now, show details modal - could be extended to show edit form
    showBookingDetails(bookingId);
}

/**
 * Complete booking
 */
async function completeBooking(bookingId) {
    if (!confirm('Are you sure you want to mark this booking as completed?')) {
        return;
    }
    
    try {
        const response = await ApiService.completeBooking(bookingId);
        
        if (response.success) {
            UIManager.showSuccess('Booking marked as completed');
            loadBookings(); // Reload bookings list
        } else {
            UIManager.showError(response.message || 'Failed to complete booking');
        }
        
    } catch (error) {
        console.error('Error completing booking:', error);
        UIManager.showError('Network error. Please try again.');
    }
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
 * Save new booking
 */
async function saveBooking() {
    const bookingData = {
        customerName: document.getElementById('customerName').value.trim(),
        customerEmail: document.getElementById('customerEmail').value.trim(),
        customerPhone: document.getElementById('customerPhone').value.trim(),
        restaurantId: document.getElementById('bookingRestaurant').value,
        date: document.getElementById('bookingDate').value,
        time: document.getElementById('bookingTime').value,
        partySize: document.getElementById('bookingPartySize').value,
        tableNumber: document.getElementById('tableNumber').value.trim(),
        specialRequests: document.getElementById('bookingNotes').value.trim()
    };
    
    // Validation
    if (!bookingData.customerName || !bookingData.customerEmail || !bookingData.restaurantId || 
        !bookingData.date || !bookingData.time || !bookingData.partySize) {
        UIManager.showFormMessage('Please fill in all required fields', 'error', '.booking-form');
        return;
    }
    
    if (!Utils.validateEmail(bookingData.customerEmail)) {
        UIManager.showFormMessage('Please enter a valid email address', 'error', '.booking-form');
        return;
    }
    
    UIManager.setButtonLoading('#saveBookingBtn', 'Creating...');
    
    try {
        const response = await ApiService.createManualBooking(bookingData);
        
        if (response.success) {
            UIManager.showSuccess('Booking created successfully');
            closeAddModal();
            loadBookings(); // Reload bookings list
        } else {
            UIManager.showFormMessage(response.message || 'Failed to create booking', 'error', '.booking-form');
        }
        
    } catch (error) {
        console.error('Error creating booking:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#saveBookingBtn');
}

/**
 * Handle search
 */
function handleSearch() {
    const searchTerm = document.getElementById('bookingSearch').value.toLowerCase().trim();
    applyFilters();
}

/**
 * Apply filters
 */
function applyFilters() {
    const searchTerm = document.getElementById('bookingSearch').value.toLowerCase().trim();
    const dateFilter = document.getElementById('dateFilter').value;
    const timeFilter = document.getElementById('timeFilter').value;
    const partySizeFilter = document.getElementById('partySizeFilter').value;
    
    let filteredBookings = filterBookings(allBookings, currentFilter);
    
    // Apply search filter
    if (searchTerm) {
        filteredBookings = filteredBookings.filter(booking => 
            booking.customerName.toLowerCase().includes(searchTerm) ||
            booking.restaurantName.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply date filter
    if (dateFilter) {
        filteredBookings = filteredBookings.filter(booking => booking.date === dateFilter);
    }
    
    // Apply time filter
    if (timeFilter) {
        filteredBookings = filteredBookings.filter(booking => {
            const hour = parseInt(booking.time.split(':')[0]);
            switch (timeFilter) {
                case 'morning': return hour >= 11 && hour < 14;
                case 'afternoon': return hour >= 14 && hour < 17;
                case 'evening': return hour >= 17 && hour <= 21;
                default: return true;
            }
        });
    }
    
    // Apply party size filter
    if (partySizeFilter) {
        filteredBookings = filteredBookings.filter(booking => {
            switch (partySizeFilter) {
                case '1': return booking.partySize === 1;
                case '2': return booking.partySize === 2;
                case '3-4': return booking.partySize >= 3 && booking.partySize <= 4;
                case '5+': return booking.partySize >= 5;
                default: return true;
            }
        });
    }
    
    renderFilteredBookings(filteredBookings);
}

/**
 * Render filtered bookings
 */
function renderFilteredBookings(bookings) {
    const bookingsList = document.querySelector('.bookings-list');
    const emptyState = document.getElementById('noBookings');
    
    if (bookings.length === 0) {
        bookingsList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    bookingsList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Use the same render logic as renderBookings but with filtered data
    const originalBookings = allBookings;
    allBookings = bookings;
    renderBookings();
    allBookings = originalBookings;
}

/**
 * Export bookings
 */
async function exportBookings() {
    try {
        const response = await ApiService.exportBookings();
        
        if (response.success) {
            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `bookings-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            UIManager.showSuccess('Bookings exported successfully');
        } else {
            UIManager.showError('Failed to export bookings');
        }
        
    } catch (error) {
        console.error('Error exporting bookings:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Print schedule
 */
function printSchedule() {
    window.print();
}

/**
 * Clear filters
 */
function clearFilters() {
    document.getElementById('bookingSearch').value = '';
    document.getElementById('dateFilter').value = '';
    document.getElementById('timeFilter').value = '';
    document.getElementById('partySizeFilter').value = '';
    
    renderBookings();
}

/**
 * Populate details modal
 */
function populateDetailsModal(booking) {
    document.getElementById('detailCustomerName').textContent = booking.customerName;
    document.getElementById('detailCustomerEmail').textContent = booking.customerEmail;
    document.getElementById('detailCustomerPhone').textContent = booking.customerPhone || 'Not provided';
    document.getElementById('detailRestaurant').textContent = booking.restaurantName;
    document.getElementById('detailBookingDate').textContent = Utils.formatDate(booking.date);
    document.getElementById('detailBookingTime').textContent = booking.time;
    document.getElementById('detailPartySize').textContent = `${booking.partySize} ${booking.partySize === 1 ? 'person' : 'people'}`;
    document.getElementById('detailTableNumber').textContent = booking.tableNumber || 'Not assigned';
    document.getElementById('detailBookingStatus').textContent = booking.status;
    document.getElementById('detailSpecialRequests').textContent = booking.specialRequests || 'None';
    
    // Update status badge class
    const statusElement = document.getElementById('detailBookingStatus');
    statusElement.className = `booking-status status-${booking.status.toLowerCase()}`;
    
    // Show/hide action buttons based on status
    const approveBtn = document.getElementById('approveBookingBtn');
    const rejectBtn = document.getElementById('rejectBookingBtn');
    const modifyBtn = document.getElementById('modifyBookingBtn');
    const completeBtn = document.getElementById('completeBookingBtn');
    const cancelBtn = document.getElementById('cancelBookingBtn');
    
    // Hide all buttons first
    approveBtn.style.display = 'none';
    rejectBtn.style.display = 'none';
    modifyBtn.style.display = 'none';
    completeBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
    
    // Show relevant buttons based on status
    if (booking.status === 'Pending') {
        approveBtn.style.display = 'inline-block';
        rejectBtn.style.display = 'inline-block';
    } else if (booking.status === 'Confirmed') {
        modifyBtn.style.display = 'inline-block';
        completeBtn.style.display = 'inline-block';
        cancelBtn.style.display = 'inline-block';
    }
}

/**
 * Close modals
 */
function closeDetailsModal() {
    document.getElementById('bookingModal').style.display = 'none';
    selectedBooking = null;
}

function closeAddModal() {
    document.getElementById('addBookingModal').style.display = 'none';
    resetBookingForm();
}

/**
 * Reset booking form
 */
function resetBookingForm() {
    document.getElementById('customerName').value = '';
    document.getElementById('customerEmail').value = '';
    document.getElementById('customerPhone').value = '';
    document.getElementById('bookingRestaurant').value = '';
    document.getElementById('bookingDate').value = '';
    document.getElementById('bookingTime').value = '';
    document.getElementById('bookingPartySize').value = '';
    document.getElementById('tableNumber').value = '';
    document.getElementById('bookingNotes').value = '';
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
        bookingsList.style.display = 'grid';
    }
}
