/**
 * Centralized Storage Utility for RestB Frontend
 * Handles all localStorage operations with type safety and error handling
 */

const StorageKeys = {
    AUTH_TOKEN: 'restb_token',
    USER_DATA: 'restb_user', 
    USER_TYPE: 'restb_user_type', // 'customer' or 'partner'
    USER_ROLE: 'restb_user_role', // 'superAdmin' or 'adminStaff' (only for partners)
    BACKEND: 'restb_backend'
};

class StorageManager {
    /**
     * Store data in localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} value - Value to store (will be JSON.stringify'd if object)
     */
    static set(key, value) {
        try {
            const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
            localStorage.setItem(key, serializedValue);
            return true;
        } catch (error) {
            console.error(`Failed to store ${key}:`, error);
            return false;
        }
    }

    /**
     * Get data from localStorage with error handling
     * @param {string} key - Storage key
     * @param {any} defaultValue - Default value if key doesn't exist
     * @returns {any} Stored value or default
     */
    static get(key, defaultValue = null) {
        try {
            const item = localStorage.getItem(key);
            if (item === null) return defaultValue;
            
            // Try to parse as JSON, fallback to string if fails
            try {
                return JSON.parse(item);
            } catch {
                return item;
            }
        } catch (error) {
            console.error(`Failed to retrieve ${key}:`, error);
            return defaultValue;
        }
    }

    /**
     * Remove item from localStorage
     * @param {string} key - Storage key to remove
     */
    static remove(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error(`Failed to remove ${key}:`, error);
            return false;
        }
    }

    /**
     * Clear all authentication-related data
     */
    static clearAuth() {
        this.remove(StorageKeys.AUTH_TOKEN);
        this.remove(StorageKeys.USER_DATA);
        this.remove(StorageKeys.USER_TYPE);
        this.remove(StorageKeys.USER_ROLE);
    }

    /**
     * Store authentication token
     * @param {string} token - JWT token
     */
    static setAuthToken(token) {
        return this.set(StorageKeys.AUTH_TOKEN, token);
    }

    /**
     * Get authentication token
     * @returns {string|null} JWT token or null
     */
    static getAuthToken() {
        return this.get(StorageKeys.AUTH_TOKEN);
    }

    /**
     * Store complete user data
     * @param {object} userData - User object from API
     * @param {string} userType - 'customer' or 'partner'
     * @param {string} role - Optional: 'superAdmin' or 'adminStaff'
     */
    static setUserData(userData, userType, role = null) {
        const success = this.set(StorageKeys.USER_DATA, userData) &&
                       this.set(StorageKeys.USER_TYPE, userType);
        
        if (role && userType === 'partner') {
            this.set(StorageKeys.USER_ROLE, role);
        }
        
        return success;
    }

    /**
     * Get complete user data
     * @returns {object|null} User data object or null
     */
    static getUserData() {
        const userData = this.get(StorageKeys.USER_DATA);
        const userType = this.get(StorageKeys.USER_TYPE);
        const userRole = this.get(StorageKeys.USER_ROLE);

        if (!userData || !userType) return null;

        return {
            ...userData,
            userType,
            role: userRole
        };
    }

    /**
     * Get user type
     * @returns {string|null} 'customer', 'partner', or null
     */
    static getUserType() {
        return this.get(StorageKeys.USER_TYPE);
    }

    /**
     * Get user role (only for partners)
     * @returns {string|null} 'superAdmin', 'adminStaff', or null
     */
    static getUserRole() {
        return this.get(StorageKeys.USER_ROLE);
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user has valid token
     */
    static isAuthenticated() {
        return !!this.getAuthToken();
    }

    /**
     * Check if user is a customer
     * @returns {boolean} True if user type is customer
     */
    static isCustomer() {
        return this.getUserType() === 'customer';
    }

    /**
     * Check if user is a partner/admin
     * @returns {boolean} True if user type is partner
     */
    static isPartner() {
        return this.getUserType() === 'partner';
    }

    /**
     * Check if user is super admin
     * @returns {boolean} True if user is partner and role is superAdmin
     */
    static isSuperAdmin() {
        return this.isPartner() && this.getUserRole() === 'superAdmin';
    }

    /**
     * Check if user is admin staff
     * @returns {boolean} True if user is partner and role is adminStaff
     */
    static isAdminStaff() {
        return this.isPartner() && this.getUserRole() === 'adminStaff';
    }

    /**
     * Store backend preference
     * @param {string} backend - Backend name ('local', 'github', 'production')
     */
    static setBackend(backend) {
        return this.set(StorageKeys.BACKEND, backend);
    }

    /**
     * Get stored backend preference
     * @returns {string|null} Backend name or null
     */
    static getBackend() {
        return this.get(StorageKeys.BACKEND);
    }
}

// Export for global use
window.StorageManager = StorageManager;
window.StorageKeys = StorageKeys;
