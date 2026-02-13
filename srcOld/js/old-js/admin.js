// Admin dashboard specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin dashboard loaded');
    
    // Only run on admin page
    if (!document.querySelector('.admin-container')) return;
    
    // Load and display current user information
    loadUserInfo();
    
    // Initialize access control
    AccessControl.initialize();
    
    // Show role-specific sections
    showRoleSpecificSections();
});

/**
 * Load and display current user information
 */
function loadUserInfo() {
    const userData = StorageManager.getUserData();
    
    if (userData) {
        // Update user info display
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userRole = document.getElementById('user-role');
        const userType = document.getElementById('user-type');
        
        if (userName) userName.textContent = `${userData.firstName} ${userData.lastName}`;
        if (userEmail) userEmail.textContent = userData.email;
        if (userRole) userRole.textContent = AccessControl.getRoleDisplayName(userData.userType, userData.role);
        if (userType) userType.textContent = userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1);
    } else {
        console.error('No user data found');
        // Redirect to login if no user data
        window.location.href = '/views/pages/login.html';
    }
}

/**
 * Show/hide role-specific sections based on user role
 */
function showRoleSpecificSections() {
    const userData = StorageManager.getUserData();
    if (!userData || userData.userType !== 'partner') return;
    
    // Super Admin sections
    const superAdminSections = document.querySelectorAll('[data-user-role="superAdmin"]');
    const adminStaffSections = document.querySelectorAll('[data-user-role="adminStaff"]');
    
    if (userData.role === 'superAdmin') {
        // Show super admin sections
        superAdminSections.forEach(section => {
            section.style.display = 'block';
        });
        
        // Hide admin staff sections (in case they overlap)
        adminStaffSections.forEach(section => {
            section.style.display = 'none';
        });
    } else if (userData.role === 'adminStaff') {
        // Hide super admin sections
        superAdminSections.forEach(section => {
            section.style.display = 'none';
        });
        
        // Show admin staff sections
        adminStaffSections.forEach(section => {
            section.style.display = 'block';
        });
    }
}
