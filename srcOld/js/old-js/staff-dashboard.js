/**
 * Staff Dashboard JavaScript
 * Handles limited dashboard for AdminStaff role
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Staff dashboard loaded');
    
    // Check authentication and permissions
    if (!Utils.requireAuth()) return;
    if (!AuthService.isAdminStaff() && !AuthService.isSuperAdmin()) {
        UIManager.showError('Access denied. This page is for staff members only.');
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
        
        // Load today's schedule
        await loadTodaySchedule();
        
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
        const response = await ApiService.getStaffDashboardStats();
        
        if (response.success) {
            const stats = response.stats;
            
            // Update statistics with animation
            animateValue('todayBookings', 0, stats.todayBookings || 0, 1000);
            animateValue('pendingBookings', 0, stats.pendingBookings || 0, 1000);
            animateValue('completedBookings', 0, stats.completedBookings || 0, 1000);
            animateValue('todayRevenue', 0, stats.todayRevenue || 0, 1000, true);
        } else {
            console.error('Failed to load dashboard stats:', response.message);
        }
        
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
    }
}

/**
 * Load today's schedule
 */
async function loadTodaySchedule() {
    try {
        const response = await ApiService.getTodaySchedule();
        
        if (response.success) {
            renderTodaySchedule(response.bookings || []);
        } else {
            console.error('Failed to load today\'s schedule:', response.message);
        }
        
    } catch (error) {
        console.error('Error loading today\'s schedule:', error);
    } finally {
        document.getElementById('scheduleLoading').style.display = 'none';
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
        document.getElementById('pendingLoading').style.display = 'none';
    }
}

/**
 * Render today's schedule
 */
function renderTodaySchedule(bookings) {
    const container = document.querySelector('.today-schedule');
    
    if (bookings.length === 0) {
        container.innerHTML = '<p class="no-data">No bookings scheduled for today</p>';
        return;
    }
    
    container.innerHTML = bookings.map(booking => `
        <div class="schedule-item">
            <div class="schedule-time">
                <strong>${booking.time}</strong>
            </div>
            <div class="schedule-details">
                <h4>${booking.customerName}</h4>
                <p class="schedule-meta">
                    👥 ${booking.partySize} people • 📞 ${booking.phone || 'No phone'}
                    ${booking.specialRequests ? `• 📝 ${booking.specialRequests}` : ''}
                </p>
            </div>
            <div class="schedule-status">
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
                <h4>${booking.customerName}</h4>
                <p class="approval-meta">
                    📅 ${Utils.formatDate(booking.date)} at ${booking.time}
                    • 👥 ${booking.partySize} people
                    📞 ${booking.phone || 'No phone'}
                </p>
                ${booking.specialRequests ? `
                    <p class="special-requests">
                        <strong>Special Requests:</strong> ${booking.specialRequests}
                    </p>
                ` : ''}
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
