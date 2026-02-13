/**
 * Role-Based Access Control System for RestB Frontend
 * Handles permissions, page access, and UI element visibility based on user roles
 */

const UserTypes = {
    CUSTOMER: 'customer',
    PARTNER: 'partner'
};

const UserRoles = {
    SUPER_ADMIN: 'superAdmin',
    ADMIN_STAFF: 'adminStaff'
};

const Permissions = {
    // Customer permissions
    VIEW_OWN_BOOKINGS: 'view_own_bookings',
    CREATE_BOOKING: 'create_booking',
    UPDATE_OWN_PROFILE: 'update_own_profile',
    
    // Partner permissions
    VIEW_ALL_BOOKINGS: 'view_all_bookings',
    MANAGE_BOOKINGS: 'manage_bookings',
    VIEW_CUSTOMERS: 'view_customers',
    MANAGE_CUSTOMERS: 'manage_customers',
    VIEW_ADMIN_DASHBOARD: 'view_admin_dashboard',
    MANAGE_SYSTEM: 'manage_system',
    
    // Super Admin specific permissions
    MANAGE_ADMINS: 'manage_admins',
    VIEW_SYSTEM_SETTINGS: 'view_system_settings',
    EXPORT_DATA: 'export_data'
};

class AccessControl {
    /**
     * Get all permissions for a user type and role
     * @param {string} userType - User type
     * @param {string} role - User role (optional, only for partners)
     * @returns {array} Array of permissions
     */
    static getPermissions(userType, role = null) {
        const permissions = new Set();
        
        if (userType === UserTypes.CUSTOMER) {
            permissions.add(Permissions.VIEW_OWN_BOOKINGS);
            permissions.add(Permissions.CREATE_BOOKING);
            permissions.add(Permissions.UPDATE_OWN_PROFILE);
        } else if (userType === UserTypes.PARTNER) {
            // Base partner permissions
            permissions.add(Permissions.VIEW_ALL_BOOKINGS);
            permissions.add(Permissions.MANAGE_BOOKINGS);
            permissions.add(Permissions.VIEW_CUSTOMERS);
            permissions.add(Permissions.MANAGE_CUSTOMERS);
            permissions.add(Permissions.VIEW_ADMIN_DASHBOARD);
            permissions.add(Permissions.UPDATE_OWN_PROFILE);
            
            // Role-specific permissions
            if (role === UserRoles.SUPER_ADMIN) {
                permissions.add(Permissions.MANAGE_ADMINS);
                permissions.add(Permissions.VIEW_SYSTEM_SETTINGS);
                permissions.add(Permissions.EXPORT_DATA);
                permissions.add(Permissions.MANAGE_SYSTEM);
            } else if (role === UserRoles.ADMIN_STAFF) {
                permissions.add(Permissions.MANAGE_BOOKINGS);
                permissions.add(Permissions.MANAGE_CUSTOMERS);
            }
        }
        
        return Array.from(permissions);
    }

    /**
     * Check if current user has a specific permission
     * @param {string} permission - Permission to check
     * @returns {boolean} True if user has permission
     */
    static hasPermission(permission) {
        const userData = StorageManager.getUserData();
        if (!userData) return false;
        
        const userPermissions = this.getPermissions(userData.userType, userData.role);
        return userPermissions.includes(permission);
    }

    /**
     * Check if current user can access a page
     * @param {string} page - Page identifier
     * @returns {boolean} True if user can access page
     */
    static canAccessPage(page) {
        const pagePermissions = {
            'dashboard': [Permissions.VIEW_ADMIN_DASHBOARD],
            'bookings': [Permissions.VIEW_ALL_BOOKINGS, Permissions.VIEW_OWN_BOOKINGS],
            'customers': [Permissions.VIEW_CUSTOMERS],
            'admin-settings': [Permissions.VIEW_SYSTEM_SETTINGS],
            'profile': [Permissions.UPDATE_OWN_PROFILE],
            'booking-create': [Permissions.CREATE_BOOKING]
        };
        
        const requiredPermissions = pagePermissions[page];
        if (!requiredPermissions) return true; // No restrictions
        
        return requiredPermissions.some(permission => this.hasPermission(permission));
    }

    /**
     * Show or hide UI elements based on permissions
     * @param {string} selector - CSS selector for elements
     * @param {string} permission - Required permission
     * @param {boolean} show - Whether to show or hide elements
     */
    static toggleElements(selector, permission, show = true) {
        const elements = document.querySelectorAll(selector);
        const hasAccess = this.hasPermission(permission);
        
        elements.forEach(element => {
            if (show) {
                element.style.display = hasAccess ? '' : 'none';
            } else {
                element.style.display = hasAccess ? 'none' : '';
            }
        });
    }

    /**
     * Initialize access control for current page
     * @param {object} options - Configuration options
     */
    static initialize(options = {}) {
        const userData = StorageManager.getUserData();
        if (!userData) return;
        
        // Auto-hide elements with data-permission attributes
        const protectedElements = document.querySelectorAll('[data-permission]');
        protectedElements.forEach(element => {
            const permission = element.getAttribute('data-permission');
            if (!this.hasPermission(permission)) {
                element.style.display = 'none';
            }
        });
        
        // Auto-hide elements with data-user-type attributes
        const typeElements = document.querySelectorAll('[data-user-type]');
        typeElements.forEach(element => {
            const allowedTypes = element.getAttribute('data-user-type').split(',');
            if (!allowedTypes.includes(userData.userType)) {
                element.style.display = 'none';
            }
        });
        
        // Auto-hide elements with data-user-role attributes (for partners)
        if (userData.userType === UserTypes.PARTNER) {
            const roleElements = document.querySelectorAll('[data-user-role]');
            roleElements.forEach(element => {
                const allowedRoles = element.getAttribute('data-user-role').split(',');
                if (!allowedRoles.includes(userData.role)) {
                    element.style.display = 'none';
                }
            });
        }
        
        // Apply custom visibility rules
        if (options.visibilityRules) {
            options.visibilityRules.forEach(rule => {
                this.toggleElements(rule.selector, rule.permission, rule.show);
            });
        }
    }

    /**
     * Redirect user if they don't have access to current page
     * @param {string} currentPage - Current page identifier
     * @param {string} fallbackUrl - URL to redirect to
     */
    static enforcePageAccess(currentPage, fallbackUrl = '/views/pages/login.html') {
        if (!this.canAccessPage(currentPage)) {
            window.location.href = fallbackUrl;
        }
    }

    /**
     * Get user-friendly role name
     * @param {string} userType - User type
     * @param {string} role - User role
     * @returns {string} Display name for role
     */
    static getRoleDisplayName(userType, role = null) {
        if (userType === UserTypes.CUSTOMER) {
            return 'Customer';
        } else if (userType === UserTypes.PARTNER) {
            return role === UserRoles.SUPER_ADMIN ? 'Super Admin' : 'Admin Staff';
        }
        return 'Unknown';
    }

    /**
     * Check if user can perform an action
     * @param {string} action - Action identifier
     * @returns {boolean} True if user can perform action
     */
    static canPerformAction(action) {
        const actionPermissions = {
            'delete-booking': [Permissions.MANAGE_BOOKINGS],
            'edit-customer': [Permissions.MANAGE_CUSTOMERS],
            'create-admin': [Permissions.MANAGE_ADMINS],
            'export-bookings': [Permissions.EXPORT_DATA],
            'view-settings': [Permissions.VIEW_SYSTEM_SETTINGS]
        };
        
        const requiredPermissions = actionPermissions[action];
        if (!requiredPermissions) return true;
        
        return requiredPermissions.some(permission => this.hasPermission(permission));
    }
}

// Export for global use
window.AccessControl = AccessControl;
window.UserTypes = UserTypes;
window.UserRoles = UserRoles;
window.Permissions = Permissions;
