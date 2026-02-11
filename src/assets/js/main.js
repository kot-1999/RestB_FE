// Global JavaScript for RestB Frontend
document.addEventListener('DOMContentLoaded', function() {
    console.log('RestB Frontend loaded');
    
    // Wait a tick to ensure all scripts are loaded
    setTimeout(() => {
        // Initialize authentication state
        initializeAuth();
        
        // Global functionality that runs on all pages
        initializeNavigation();
        initializeGlobalEvents();
        
        // Initialize access control if user is authenticated
        if (typeof AuthService !== 'undefined' && AuthService.isAuthenticated()) {
            AccessControl.initialize();
        }
    }, 100);
});

/**
 * Initialize authentication state
 */
async function initializeAuth() {
    // Check if current page requires authentication
    const requiresAuth = document.body.hasAttribute('data-requires-auth');
    
    if (requiresAuth) {
        await AuthService.initializeAuth(true);
    } else {
        // Validate session if user is logged in
        if (AuthService.isAuthenticated()) {
            await AuthService.validateSession();
        }
    }
}

function initializeNavigation() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeGlobalEvents() {
    // Add logout functionality to logout buttons
    const logoutButtons = document.querySelectorAll('[data-action="logout"]');
    logoutButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            AuthService.logout();
        });
    });
    
    // Add user menu toggle functionality
    const userMenuToggles = document.querySelectorAll('[data-toggle="user-menu"]');
    userMenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const menu = document.querySelector(toggle.getAttribute('data-target'));
            if (menu) {
                menu.style.display = menu.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
    
    console.log('Global events initialized');
}

// Enhanced utility functions using new centralized systems
const Utils = {
    // Email validation (kept for compatibility)
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Show notification using UIManager
    showNotification(message, type = 'info', duration = 3000) {
        return UIManager.showNotification(message, type, duration);
    },
    
    // Show success notification
    showSuccess(message, duration = 3000) {
        return UIManager.showSuccess(message, duration);
    },
    
    // Show error notification
    showError(message, duration = 5000) {
        return UIManager.showError(message, duration);
    },
    
    // Check if user has specific permission
    hasPermission(permission) {
        return AccessControl.hasPermission(permission);
    },
    
    // Get current user info
    getCurrentUser() {
        return AuthService.getCurrentUser();
    },
    
    // Format user role for display
    formatUserRole(userType, role = null) {
        return AccessControl.getRoleDisplayName(userType, role);
    },
    
    // Redirect if not authenticated
    requireAuth() {
        if (!AuthService.isAuthenticated()) {
            window.location.href = '/views/pages/login.html';
            return false;
        }
        return true;
    },
    
    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    },
    
    // Debounce function for search inputs
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
};
