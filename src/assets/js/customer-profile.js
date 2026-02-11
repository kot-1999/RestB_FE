/**
 * Customer Profile Page JavaScript
 * Handles profile management, password updates, and account deletion
 */

document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer profile page loaded');
    
    // Check authentication and permissions
    if (!Utils.requireAuth()) return;
    if (!AuthService.isCustomer()) {
        UIManager.showError('Access denied. This page is for customers only.');
        setTimeout(() => {
            window.location.href = '/views/pages/index.html';
        }, 2000);
        return;
    }
    
    // Load user profile data
    loadUserProfile();
    
    // Initialize event listeners
    initializeEventListeners();
});

/**
 * Load user profile data from storage/API
 */
async function loadUserProfile() {
    try {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser) {
            UIManager.showError('User data not found. Please login again.');
            return;
        }
        
        // Populate form fields
        document.getElementById('firstName').value = currentUser.firstName || '';
        document.getElementById('lastName').value = currentUser.lastName || '';
        document.getElementById('email').value = currentUser.email || '';
        document.getElementById('phone').value = currentUser.phone || '';
        
    } catch (error) {
        console.error('Error loading profile:', error);
        UIManager.showError('Failed to load profile data');
    }
}

/**
 * Initialize all event listeners
 */
function initializeEventListeners() {
    // Profile update
    document.getElementById('updateProfileBtn').addEventListener('click', handleProfileUpdate);
    document.getElementById('cancelUpdateBtn').addEventListener('click', resetProfileForm);
    
    // Password update
    document.getElementById('updatePasswordBtn').addEventListener('click', handlePasswordUpdate);
    document.getElementById('cancelPasswordBtn').addEventListener('click', resetPasswordForm);
    
    // Account actions
    document.getElementById('downloadDataBtn').addEventListener('click', handleDataDownload);
    document.getElementById('deleteAccountBtn').addEventListener('click', handleAccountDeletion);
}

/**
 * Handle profile update
 */
async function handleProfileUpdate() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const phone = document.getElementById('phone').value.trim();
    
    // Validation
    if (!firstName || !lastName) {
        UIManager.showFormMessage('First name and last name are required', 'error', '.profile-section');
        return;
    }
    
    if (firstName.length < 2 || firstName.length > 255) {
        UIManager.showFormMessage('First name must be between 2 and 255 characters', 'error', '.profile-section');
        return;
    }
    
    if (lastName.length < 2 || lastName.length > 255) {
        UIManager.showFormMessage('Last name must be between 2 and 255 characters', 'error', '.profile-section');
        return;
    }
    
    // Show loading state
    UIManager.setButtonLoading('#updateProfileBtn', 'Updating...');
    
    try {
        const updateData = { firstName, lastName, phone };
        const result = await ApiService.updateUserProfile(updateData);
        
        if (result.success) {
            // Update local storage
            AuthService.updateUserData(updateData);
            UIManager.showSuccess('Profile updated successfully');
            
            // Reload page to reflect changes
            setTimeout(() => {
                window.location.reload();
            }, 1500);
        } else {
            UIManager.showFormMessage(result.message || 'Failed to update profile', 'error', '.profile-section');
        }
        
    } catch (error) {
        console.error('Profile update error:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#updateProfileBtn');
}

/**
 * Handle password update
 */
async function handlePasswordUpdate() {
    const currentPassword = document.getElementById('currentPassword').value;
    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
        UIManager.showFormMessage('All password fields are required', 'error', '.security-form');
        return;
    }
    
    if (newPassword.length < 6) {
        UIManager.showFormMessage('New password must be at least 6 characters long', 'error', '.security-form');
        return;
    }
    
    if (newPassword !== confirmPassword) {
        UIManager.showFormMessage('New passwords do not match', 'error', '.security-form');
        return;
    }
    
    // Show loading state
    UIManager.setButtonLoading('#updatePasswordBtn', 'Updating...');
    
    try {
        const passwordData = { currentPassword, newPassword };
        const result = await ApiService.updatePassword(passwordData);
        
        if (result.success) {
            UIManager.showSuccess('Password updated successfully');
            resetPasswordForm();
        } else {
            UIManager.showFormMessage(result.message || 'Failed to update password', 'error', '.security-form');
        }
        
    } catch (error) {
        console.error('Password update error:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#updatePasswordBtn');
}

/**
 * Handle data download request
 */
async function handleDataDownload() {
    if (!confirm('Are you sure you want to request a copy of your data? You will receive an email with your data download link.')) {
        return;
    }
    
    UIManager.setButtonLoading('#downloadDataBtn', 'Requesting...');
    
    try {
        const result = await ApiService.requestUserDataDownload();
        
        if (result.success) {
            UIManager.showSuccess('Data download request sent. You will receive an email shortly.');
        } else {
            UIManager.showError(result.message || 'Failed to request data download');
        }
        
    } catch (error) {
        console.error('Data download error:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#downloadDataBtn');
}

/**
 * Handle account deletion
 */
async function handleAccountDeletion() {
    const confirmation = prompt('To delete your account, type "DELETE MY ACCOUNT" below:');
    
    if (confirmation !== 'DELETE MY ACCOUNT') {
        UIManager.showInfo('Account deletion cancelled');
        return;
    }
    
    if (!confirm('⚠️ WARNING: This action cannot be undone. All your data, bookings, and account information will be permanently deleted. Are you absolutely sure?')) {
        return;
    }
    
    UIManager.setButtonLoading('#deleteAccountBtn', 'Deleting...');
    
    try {
        const result = await ApiService.deleteAccount();
        
        if (result.success) {
            UIManager.showSuccess('Account deleted successfully');
            
            // Clear local data and redirect
            setTimeout(() => {
                AuthService.logout();
                window.location.href = '/views/pages/index.html';
            }, 2000);
        } else {
            UIManager.showError(result.message || 'Failed to delete account');
        }
        
    } catch (error) {
        console.error('Account deletion error:', error);
        UIManager.showError('Network error. Please try again.');
    }
    
    UIManager.resetButton('#deleteAccountBtn');
}

/**
 * Reset profile form to original values
 */
function resetProfileForm() {
    loadUserProfile();
}

/**
 * Reset password form
 */
function resetPasswordForm() {
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
}
