// Customer dashboard specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Customer dashboard loaded');
    
    // Only run on dashboard page
    if (!document.querySelector('.dashboard-container')) return;
    
    // Load and display current user information
    loadUserInfo();
    
    // Initialize access control
    AccessControl.initialize();
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
        const userType = document.getElementById('user-type');
        
        if (userName) userName.textContent = `${userData.firstName} ${userData.lastName}`;
        if (userEmail) userEmail.textContent = userData.email;
        if (userType) userType.textContent = userData.userType.charAt(0).toUpperCase() + userData.userType.slice(1);
    } else {
        console.error('No user data found');
        // Redirect to login if no user data
        window.location.href = '/views/pages/login.html';
    }
}
