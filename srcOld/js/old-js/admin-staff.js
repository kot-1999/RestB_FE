/**
 * Admin Staff Page JavaScript
 * Handles staff management for SuperAdmins
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin staff page loaded');
    
    // Check authentication and permissions
    if (!Utils.requireAuth()) return;
    if (!AuthService.isSuperAdmin()) {
        UIManager.showError('Access denied. This page is for SuperAdmins only.');
        setTimeout(() => {
            window.location.href = '/views/pages/index.html';
        }, 2000);
        return;
    }
    
    // Initialize page
    loadStaff();
    loadRestaurants();
    initializeEventListeners();
});

// Global variables
let allStaff = [];
let allRestaurants = [];
let selectedStaff = null;
let isEditMode = false;

/**
 * Load staff from API
 */
async function loadStaff() {
    try {
        showLoading(true);
        
        const response = await ApiService.getStaff();
        
        if (response.success) {
            allStaff = response.staff || [];
            renderStaff();
        } else {
            UIManager.showError('Failed to load staff');
        }
        
    } catch (error) {
        console.error('Error loading staff:', error);
        UIManager.showError('Network error. Please try again.');
    } finally {
        showLoading(false);
    }
}

/**
 * Load restaurants for assignment
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
    const select = document.getElementById('assignedRestaurants');
    
    allRestaurants.forEach(restaurant => {
        const option = document.createElement('option');
        option.value = restaurant.id;
        option.textContent = restaurant.name;
        select.appendChild(option);
    });
}

/**
 * Render staff list
 */
function renderStaff() {
    const staffList = document.querySelector('.staff-list');
    const emptyState = document.getElementById('noStaff');
    
    if (allStaff.length === 0) {
        staffList.style.display = 'none';
        emptyState.style.display = 'block';
        return;
    }
    
    staffList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    staffList.innerHTML = allStaff.map(staff => `
        <div class="staff-card" data-id="${staff.id}">
            <div class="staff-avatar">
                <img src="${staff.avatar || '/assets/images/default-avatar.png'}" alt="${staff.firstName}">
                <div class="status-indicator status-${staff.status}"></div>
            </div>
            <div class="staff-info">
                <h3>${staff.firstName} ${staff.lastName}</h3>
                <p class="staff-email">${staff.email}</p>
                <div class="staff-meta">
                    <span class="staff-role">${getRoleDisplay(staff.role)}</span>
                    <span class="staff-status status-${staff.status}">${staff.status}</span>
                </div>
                <div class="staff-stats">
                    <span>🏪 ${staff.assignedRestaurants?.length || 0} Restaurants</span>
                    <span>📅 ${staff.bookingsManaged || 0} Bookings</span>
                </div>
            </div>
            <div class="staff-actions">
                button.btn-primary.btn-sm(data-id="${staff.id}" onclick="viewStaffDetails('${staff.id}')") View Details
                button.btn-secondary.btn-sm(data-id="${staff.id}" onclick="editStaff('${staff.id}')") Edit
                ${staff.status === 'active' ? 
                    `<button.btn-warning.btn-sm(data-id="${staff.id}" onclick="toggleStaffStatus('${staff.id}')">Deactivate</button>` :
                    `<button.btn-success.btn-sm(data-id="${staff.id}" onclick="toggleStaffStatus('${staff.id}')">Activate</button>`
                }
                button.btn-danger.btn-sm(data-id="${staff.id}" onclick="deleteStaff('${staff.id}')") Delete
            </div>
        </div>
    `).join('');
}

/**
 * Get role display name
 */
function getRoleDisplay(role) {
    const roleMap = {
        'superAdmin': 'Super Admin',
        'adminStaff': 'Admin Staff'
    };
    return roleMap[role] || role;
}

/**
 * Initialize event listeners
 */
function initializeEventListeners() {
    // Add staff buttons
    document.getElementById('addStaffBtn').addEventListener('click', showAddStaffModal);
    document.getElementById('addFirstStaffBtn').addEventListener('click', showAddStaffModal);
    
    // Search and filters
    document.getElementById('searchBtn').addEventListener('click', handleSearch);
    document.getElementById('staffSearch').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSearch();
    });
    
    document.getElementById('roleFilter').addEventListener('change', applyFilters);
    document.getElementById('statusFilter').addEventListener('change', applyFilters);
    
    // Modal close buttons
    document.getElementById('closeModalBtn').addEventListener('click', closeStaffModal);
    document.getElementById('closeDetailsModalBtn').addEventListener('click', closeDetailsModal);
    
    // Staff form
    document.getElementById('saveStaffBtn').addEventListener('click', saveStaff);
    document.getElementById('cancelStaffBtn').addEventListener('click', closeStaffModal);
    
    // Staff details actions
    document.getElementById('editStaffBtn').addEventListener('click', () => {
        closeDetailsModal();
        editStaff(selectedStaff.id);
    });
    
    document.getElementById('resetPasswordBtn').addEventListener('click', () => {
        resetStaffPassword(selectedStaff.id);
    });
    
    document.getElementById('toggleStatusBtn').addEventListener('click', () => {
        toggleStaffStatus(selectedStaff.id);
    });
    
    document.getElementById('deleteStaffBtn').addEventListener('click', () => {
        deleteStaff(selectedStaff.id);
    });
    
    // Modal backdrop clicks
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    });
    
    // Export staff
    document.getElementById('exportStaffBtn').addEventListener('click', exportStaff);
    
    // Bulk invite
    document.getElementById('bulkInviteBtn').addEventListener('click', showBulkInviteModal);
}

/**
 * Show add staff modal
 */
function showAddStaffModal() {
    isEditMode = false;
    selectedStaff = null;
    
    document.getElementById('modalTitle').textContent = 'Add Staff Member';
    document.getElementById('staffModal').style.display = 'block';
    resetStaffForm();
}

/**
 * View staff details
 */
async function viewStaffDetails(staffId) {
    try {
        const response = await ApiService.getStaffDetails(staffId);
        
        if (response.success) {
            selectedStaff = response.staff;
            populateDetailsModal(selectedStaff);
            document.getElementById('staffDetailsModal').style.display = 'block';
        } else {
            UIManager.showError('Failed to load staff details');
        }
        
    } catch (error) {
        console.error('Error loading staff details:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Edit staff
 */
async function editStaff(staffId) {
    try {
        const response = await ApiService.getStaffDetails(staffId);
        
        if (response.success) {
            isEditMode = true;
            selectedStaff = response.staff;
            
            document.getElementById('modalTitle').textContent = 'Edit Staff Member';
            populateStaffForm(selectedStaff);
            document.getElementById('staffModal').style.display = 'block';
        } else {
            UIManager.showError('Failed to load staff details');
        }
        
    } catch (error) {
        console.error('Error loading staff details:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Populate staff form for editing
 */
function populateStaffForm(staff) {
    document.getElementById('firstName').value = staff.firstName || '';
    document.getElementById('lastName').value = staff.lastName || '';
    document.getElementById('email').value = staff.email || '';
    document.getElementById('phone').value = staff.phone || '';
    document.getElementById('role').value = staff.role || '';
    
    // Set assigned restaurants
    if (staff.assignedRestaurants) {
        const select = document.getElementById('assignedRestaurants');
        Array.from(select.options).forEach(option => {
            option.selected = staff.assignedRestaurants.includes(option.value);
        });
    }
    
    // Set permissions
    if (staff.permissions) {
        staff.permissions.forEach(permission => {
            const checkbox = document.getElementById(permission);
            if (checkbox) checkbox.checked = true;
        });
    }
}

/**
 * Save staff
 */
async function saveStaff() {
    const staffData = {
        firstName: document.getElementById('firstName').value.trim(),
        lastName: document.getElementById('lastName').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        role: document.getElementById('role').value,
        assignedRestaurants: Array.from(document.getElementById('assignedRestaurants').selectedOptions).map(option => option.value),
        permissions: getSelectedPermissions()
    };
    
    // Validation
    if (!staffData.firstName || !staffData.lastName || !staffData.email || !staffData.role) {
        UIManager.showFormMessage('Please fill in all required fields', 'error', '.staff-form');
        return;
    }
    
    if (!Utils.validateEmail(staffData.email)) {
        UIManager.showFormMessage('Please enter a valid email address', 'error', '.staff-form');
        return;
    }
    
    if (staffData.firstName.length < 2 || staffData.firstName.length > 255) {
        UIManager.showFormMessage('First name must be between 2 and 255 characters', 'error', '.staff-form');
        return;
    }
    
    if (staffData.lastName.length < 2 || staffData.lastName.length > 255) {
        UIManager.showFormMessage('Last name must be between 2 and 255 characters', 'error', '.staff-form');
        return;
    }
    
    UIManager.setButtonLoading('#saveStaffBtn', isEditMode ? 'Updating...' : 'Creating...');
    
    try {
        let response;
        
        if (isEditMode) {
            response = await ApiService.updateStaff(selectedStaff.id, staffData);
        } else {
            response = await ApiService.createStaff(staffData);
        }
        
        if (response.success) {
            UIManager.showSuccess(isEditMode ? 'Staff member updated successfully' : 'Staff member created successfully');
            closeStaffModal();
            loadStaff(); // Reload staff list
        } else {
            UIManager.showFormMessage(response.message || 'Failed to save staff member', 'error', '.staff-form');
        }
        
    } catch (error) {
        console.error('Error saving staff:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#saveStaffBtn');
}

/**
 * Get selected permissions
 */
function getSelectedPermissions() {
    const permissions = [];
    document.querySelectorAll('.permissions-grid input[type="checkbox"]:checked').forEach(checkbox => {
        permissions.push(checkbox.value);
    });
    return permissions;
}

/**
 * Toggle staff status
 */
async function toggleStaffStatus(staffId) {
    const staff = allStaff.find(s => s.id === staffId);
    const newStatus = staff.status === 'active' ? 'inactive' : 'active';
    const action = newStatus === 'active' ? 'activate' : 'deactivate';
    
    if (!confirm(`Are you sure you want to ${action} ${staff.firstName} ${staff.lastName}?`)) {
        return;
    }
    
    try {
        const response = await ApiService.updateStaffStatus(staffId, { status: newStatus });
        
        if (response.success) {
            UIManager.showSuccess(`Staff member ${action}d successfully`);
            loadStaff(); // Reload staff list
        } else {
            UIManager.showError(response.message || `Failed to ${action} staff member`);
        }
        
    } catch (error) {
        console.error('Error toggling staff status:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Reset staff password
 */
async function resetStaffPassword(staffId) {
    const staff = allStaff.find(s => s.id === staffId);
    
    if (!confirm(`Are you sure you want to reset the password for ${staff.firstName} ${staff.lastName}? They will receive an email with a temporary password.`)) {
        return;
    }
    
    try {
        const response = await ApiService.resetStaffPassword(staffId);
        
        if (response.success) {
            UIManager.showSuccess('Password reset email sent successfully');
        } else {
            UIManager.showError(response.message || 'Failed to reset password');
        }
        
    } catch (error) {
        console.error('Error resetting password:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Delete staff
 */
async function deleteStaff(staffId) {
    const staff = allStaff.find(s => s.id === staffId);
    
    if (!confirm(`Are you sure you want to delete ${staff.firstName} ${staff.lastName}? This action cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await ApiService.deleteStaff(staffId);
        
        if (response.success) {
            UIManager.showSuccess('Staff member deleted successfully');
            loadStaff(); // Reload staff list
        } else {
            UIManager.showError(response.message || 'Failed to delete staff member');
        }
        
    } catch (error) {
        console.error('Error deleting staff:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Handle search
 */
function handleSearch() {
    const searchTerm = document.getElementById('staffSearch').value.toLowerCase().trim();
    applyFilters();
}

/**
 * Apply filters
 */
function applyFilters() {
    const searchTerm = document.getElementById('staffSearch').value.toLowerCase().trim();
    const roleFilter = document.getElementById('roleFilter').value;
    const statusFilter = document.getElementById('statusFilter').value;
    
    let filteredStaff = allStaff;
    
    // Apply search filter
    if (searchTerm) {
        filteredStaff = filteredStaff.filter(staff => 
            staff.firstName.toLowerCase().includes(searchTerm) ||
            staff.lastName.toLowerCase().includes(searchTerm) ||
            staff.email.toLowerCase().includes(searchTerm)
        );
    }
    
    // Apply role filter
    if (roleFilter) {
        filteredStaff = filteredStaff.filter(staff => staff.role === roleFilter);
    }
    
    // Apply status filter
    if (statusFilter) {
        filteredStaff = filteredStaff.filter(staff => staff.status === statusFilter);
    }
    
    renderFilteredStaff(filteredStaff);
}

/**
 * Render filtered staff
 */
function renderFilteredStaff(staff) {
    const staffList = document.querySelector('.staff-list');
    const emptyState = document.getElementById('noStaff');
    
    if (staff.length === 0) {
        staffList.style.display = 'none';
        emptyState.style.display = 'block';
        emptyState.querySelector('h3').textContent = 'No Staff Members Found';
        emptyState.querySelector('p').textContent = 'Try adjusting your search terms or filters.';
        return;
    }
    
    staffList.style.display = 'grid';
    emptyState.style.display = 'none';
    
    // Use the same render logic as renderStaff but with filtered data
    const originalStaff = allStaff;
    allStaff = staff;
    renderStaff();
    allStaff = originalStaff;
}

/**
 * Populate details modal
 */
function populateDetailsModal(staff) {
    document.getElementById('detailStaffName').textContent = `${staff.firstName} ${staff.lastName}`;
    document.getElementById('detailStaffEmail').textContent = staff.email;
    document.getElementById('detailStaffPhone').textContent = staff.phone || 'Not provided';
    document.getElementById('detailStaffRole').textContent = getRoleDisplay(staff.role);
    document.getElementById('detailStaffStatus').textContent = staff.status;
    document.getElementById('detailStaffStatus').className = `staff-status status-${staff.status}`;
    
    document.getElementById('detailAssignedRestaurants').textContent = 
        staff.assignedRestaurants?.map(r => r.name).join(', ') || 'All restaurants';
    document.getElementById('detailBookingsManaged').textContent = staff.bookingsManaged || 0;
    document.getElementById('detailLastLogin').textContent = 
        staff.lastLogin ? Utils.formatDate(staff.lastLogin) : 'Never';
    document.getElementById('detailAccountCreated').textContent = Utils.formatDate(staff.createdAt);
    
    // Update toggle status button
    const toggleBtn = document.getElementById('toggleStatusBtn');
    if (staff.status === 'active') {
        toggleBtn.textContent = 'Deactivate';
        toggleBtn.className = 'btn-warning';
    } else {
        toggleBtn.textContent = 'Activate';
        toggleBtn.className = 'btn-success';
    }
}

/**
 * Export staff
 */
async function exportStaff() {
    try {
        const response = await ApiService.exportStaff();
        
        if (response.success) {
            // Create download link
            const blob = new Blob([response.data], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `staff-export-${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            UIManager.showSuccess('Staff exported successfully');
        } else {
            UIManager.showError('Failed to export staff');
        }
        
    } catch (error) {
        console.error('Error exporting staff:', error);
        UIManager.showError('Network error. Please try again.');
    }
}

/**
 * Show bulk invite modal
 */
function showBulkInviteModal() {
    UIManager.showInfo('Bulk invite feature coming soon!');
}

/**
 * Close modals
 */
function closeStaffModal() {
    document.getElementById('staffModal').style.display = 'none';
    resetStaffForm();
}

function closeDetailsModal() {
    document.getElementById('staffDetailsModal').style.display = 'none';
    selectedStaff = null;
}

/**
 * Reset staff form
 */
function resetStaffForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('email').value = '';
    document.getElementById('phone').value = '';
    document.getElementById('role').value = '';
    
    // Reset restaurant selection
    const restaurantSelect = document.getElementById('assignedRestaurants');
    Array.from(restaurantSelect.options).forEach(option => {
        option.selected = false;
    });
    
    // Reset permissions
    document.querySelectorAll('.permissions-grid input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = false;
    });
}

/**
 * Show/hide loading indicator
 */
function showLoading(show) {
    const loading = document.getElementById('staffLoading');
    const staffList = document.querySelector('.staff-list');
    
    if (show) {
        loading.style.display = 'block';
        staffList.style.display = 'none';
    } else {
        loading.style.display = 'none';
        staffList.style.display = 'grid';
    }
}
