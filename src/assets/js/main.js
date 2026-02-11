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
        
        // Update UI based on authentication state
        updateAuthenticationUI();
        
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
            if (typeof AuthService !== 'undefined') {
                AuthService.logout();
            }
        });
    });
    
    // Add user menu toggle functionality
    const userMenuToggles = document.querySelectorAll('[data-action="user-menu-toggle"]');
    userMenuToggles.forEach(toggle => {
        toggle.addEventListener('click', (e) => {
            e.preventDefault();
            const dropdown = document.querySelector('[data-dropdown="user-menu"]');
            if (dropdown) {
                dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', (e) => {
        const dropdown = document.querySelector('[data-dropdown="user-menu"]');
        const toggle = document.querySelector('[data-action="user-menu-toggle"]');
        
        if (dropdown && toggle && !dropdown.contains(e.target) && !toggle.contains(e.target)) {
            dropdown.style.display = 'none';
        }
    });
    
    console.log('Global events initialized');
}

/**
 * Update UI based on authentication state
 */
function updateAuthenticationUI() {
    if (typeof AuthService === 'undefined') return;
    
    const isAuthenticated = AuthService.isAuthenticated();
    const currentUser = AuthService.getCurrentUser();
    
    // Toggle navigation elements based on auth state
    const authElements = document.querySelectorAll('[data-auth-required="false"]');
    const userElements = document.querySelectorAll('[data-auth-required="true"]');
    
    if (isAuthenticated && currentUser) {
        // Show user elements, hide auth elements
        authElements.forEach(el => el.style.display = 'none');
        userElements.forEach(el => el.style.display = 'block');
        
        // Update user display name
        const displayName = document.querySelector('.user-display-name');
        if (displayName) {
            displayName.textContent = currentUser.firstName || currentUser.email || 'User';
        }
        
        // Show role-specific navigation
        updateRoleBasedNavigation(currentUser.userType, currentUser.role);
        
    } else {
        // Show auth elements, hide user elements
        authElements.forEach(el => el.style.display = 'block');
        userElements.forEach(el => el.style.display = 'none');
    }
    
    // Handle page-specific auth redirects
    handlePageAuthRedirects();
}

/**
 * Update role-based navigation
 */
function updateRoleBasedNavigation(userType, role) {
    // Hide all role-specific sections first
    document.querySelectorAll('[data-user-role]').forEach(el => {
        el.style.display = 'none';
    });
    
    if (userType === 'customer') {
        // Show customer navigation
        document.querySelectorAll('[data-user-role="customer"]').forEach(el => {
            el.style.display = 'block';
        });
    } else if (userType === 'partner') {
        if (role === 'superAdmin') {
            // Show SuperAdmin navigation
            document.querySelectorAll('[data-user-role="superAdmin"]').forEach(el => {
                el.style.display = 'block';
            });
        } else if (role === 'adminStaff') {
            // Show AdminStaff navigation
            document.querySelectorAll('[data-user-role="adminStaff"]').forEach(el => {
                el.style.display = 'block';
            });
        }
    }
}

/**
 * Update dashboard links based on user type
 */
function updateDashboardLinks(userType) {
    const dashboardLinks = document.querySelectorAll('[data-dashboard-link]');
    dashboardLinks.forEach(link => {
        if (userType === 'partner') {
            link.href = '/views/pages/admin-dashboard.html';
        } else {
            link.href = '/views/pages/customer-dashboard.html';
        }
    });
}

/**
 * Handle page-specific authentication redirects
 */
function handlePageAuthRedirects() {
    const currentPath = window.location.pathname;
    const isAuthenticated = AuthService && AuthService.isAuthenticated();
    
    // Redirect logged-in users away from auth pages
    if (isAuthenticated) {
        const currentUser = AuthService.getCurrentUser();
        const userType = currentUser?.userType;
        
        if (currentPath.includes('/login.html') || currentPath.includes('/register.html')) {
            // Redirect to appropriate dashboard
            if (userType === 'partner') {
                window.location.href = '/views/pages/admin-dashboard.html';
            } else {
                window.location.href = '/views/pages/customer-dashboard.html';
            }
            return;
        }
    }
    
    // Redirect non-authenticated users from protected pages
    if (!isAuthenticated && isProtectedPage(currentPath)) {
        window.location.href = '/views/pages/login.html';
        return;
    }
}

/**
 * Check if current page requires authentication
 */
function isProtectedPage(path) {
    const protectedPaths = [
        '/admin-dashboard.html',
        '/customer-dashboard.html'
    ];
    
    return protectedPaths.some(protectedPath => path.includes(protectedPath));
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
