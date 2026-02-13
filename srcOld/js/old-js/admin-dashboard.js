/**
 * SuperAdmin Dashboard JavaScript
 * Handles dashboard statistics, recent bookings, and system alerts
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('SuperAdmin dashboard loaded');
    
    // Check authentication and permissions
    if (!Utils.requireAuth()) return;
    if (!AuthService.isSuperAdmin()) {
        UIManager.showError('Access denied. This page is for SuperAdmins only.');
        setTimeout(() => {
            window.location.href = '/views/pages/index.html';
        }, 2000);
        return;
    }
    
    // Initialize dashboard
    loadDashboardData();
    initializeEventListeners();
});

/**
 * Load dashboard data from API
 */
async function loadDashboardData() {
    try {
        // Load dashboard statistics
        await loadDashboardStats();
        
        // Load recent bookings
        await loadRecentBookings();
        
        // Load pending approvals
        await loadPendingApprovals();
        
    } catch (error) {
        console.error('Error loading dashboard data:', error);
        UIManager.showError('Failed to load dashboard data');
    }
}

/**
 * Load dashboard statistics
 */
async function loadDashboardStats() {
    try {
        const response = await ApiService.getDashboardStats();
        
        if (response.success) {
            const stats = response.stats;
            
            // Update statistics with animation
            animateValue('totalRestaurants', 0, stats.totalRestaurants || 0, 1000);
            animateValue('totalBookings', 0, stats.totalBookings || 0, 1000);
            animateValue('pendingBookings', 0, stats.pendingBookings || 0, 1000);
            animateValue('totalStaff', 0, stats.totalStaff || 0, 1000);
            animateValue('totalBrands', 0, stats.totalBrands || 0, 1000);
            animateValue('todayRevenue', 0, stats.todayRevenue || 0, 1000, true);
        } else {
            console.error('Failed to load dashboard stats:', response.message);
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Load recent bookings
 */
async function loadRecentBookings() {
    try {
        const response = await ApiService.getRecentBookings({ limit: 5 });
        
        if (response.success) {
            renderRecentBookings(response.bookings || []);
        } else {
            console.error('Failed to load recent bookings:', response.message);
        }
        
    } catch (error) {
        console.error('Error loading recent bookings:', error);
    } finally {
        document.getElementById('recentBookingsLoading').style.display = 'none';
    }
}

/**
 * Load pending approvals
 */
async function loadPendingApprovals() {
    try {
        const response = await ApiService.getPendingBookings({ limit: 5 });
        
        if (response.success) {
            renderPendingApprovals(response.bookings || []);
        } else {
            console.error('Failed to load pending approvals:', response.message);
        }
        
    } catch (error) {
        console.error('Error loading pending approvals:', error);
    } finally {
        document.getElementById('pendingApprovalsLoading').style.display = 'none';
    }
}

/**
 * Render recent bookings
 */
function renderRecentBookings(bookings) {
    const container = document.querySelector('.recent-bookings');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-data">No recent bookings</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="booking-item">
            <div class="booking-info">
                <h4>${booking.restaurantName}</h4>
                <p class="booking-meta">
                    📅 ${Utils.formatDate(booking.date)} at ${booking.time}
                    • 👥 ${booking.partySize} people
                </p>
            </div>
            <div class="booking-status">
                <span class="status-badge status-${booking.status.toLowerCase()}">${booking.status}</span>
            </div>
        </div>
    `).join('');
}

/**
 * Render pending approvals
 */
function renderPendingApprovals(bookings) {
    const container = document.querySelector('.pending-approvals');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-data">No pending approvals</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="approval-item">
            <div class="approval-info">
                <h4>${booking.restaurantName}</h4>
                <p class="approval-meta">
                    📅 ${Utils.formatDate(booking.date)} at ${booking.time}
                    • 👥 ${booking.partySize} people
                    • 👤 ${booking.customerName}
                </p>
            </div>
            <div class="approval-actions">
                button.btn-success.btn-sm(data-booking-id="${booking.id}" onclick="approveBooking('${booking.id}')") Approve
                button.btn-danger.btn-sm(data-booking-id="${booking.id}" onclick="rejectBooking('${booking.id}')") Reject
            </div>
        </div>
    `).join('');
}

/**
 * Animate numeric values
 */
function animateValue(id, start, end, duration, isCurrency = false) {
    const element = document.getElementById(id);
    const range = end - start;
    const increment = range / (duration / 16);
    let current = start;
    
    const timer = setInterval(() => {
        current += increment;
        if ((increment > 0 && current >= end) || (increment < 0 && current <= end)) {
            current = end;
            clearInterval(timer);
        }
        
        if (isCurrency) {
            element.textContent = `$${current.toFixed(0)}`;
        } else {
            element.textContent = Math.floor(current);
        }
    }, 16);
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Auto-refresh dashboard data every 30 seconds
    setInterval(() => {
        loadDashboardData();
    }, 30000);
}

/**
 * Approve booking (global function for inline onclick)
 */
async function approveBooking(bookingId) {
    if (!confirm('Are you sure you want to approve this booking?')) {
        return;
    }
    
    try {
        const response = await ApiService.approveBooking(bookingId);
        
        if (response.success) {
            UIManager.showSuccess('Booking approved successfully');
            loadPendingApprovals(); // Reload pending approvals
            loadDashboardStats(); // Reload stats
        } else {
            UIManager.showError(response.message || 'Failed to approve booking');
        }
        
    } catch (error) {
        console.error('Error approving booking:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Reject booking (global function for inline onclick)
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
            loadPendingApprovals(); // Reload pending approvals
            loadDashboardStats(); // Reload stats
        } else {
            UIManager.showError(response.message || 'Failed to reject booking');
        }
        
    } catch (error) {
        console.error('Error rejecting booking:', error);
        UIManager.showError('Network error. Please try again.');
    }
}
