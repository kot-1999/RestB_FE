/**
 * Authentication Service for RestB Frontend
 * Handles login, logout, registration, and user session management
 */

class AuthService {
    /**
     * Login user with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @param {string} userType - 'customer' or 'partner'
     * @returns {Promise<object>} Login result
     */
    static async login(email, password, userType) {
        try {
            const response = await ApiService.postLogin(email, password, userType);
            
            // Handle different response structures
            let userData, token;
            
            if (response.user) {
                // Customer login response
                userData = response.user;
                token = response.user.token;
            } else if (response.admin) {
                // Partner login response
                userData = response.admin;
                token = response.admin.token;
            } else {
                throw new Error('Invalid login response structure');
            }
            
            // Store authentication data
            StorageManager.setAuthToken(token);
            StorageManager.setUserData(userData, userType);
            
            // For partners, we need to fetch user details to get the role
            if (userType === 'partner') {
                try {
                    const userDetails = await ApiService.getUser(userData.id, userType);
                    // For partners, API returns "admin" object with type field
                    if (userDetails.admin) {
                        const role = userDetails.admin.type; // 'superAdmin' or 'adminStaff'
                        StorageManager.setUserData(userData, userType, role);
                    }
                } catch (error) {
                    console.warn('Could not fetch partner role:', error);
                    // Default to superAdmin for new partner registrations
                    StorageManager.setUserData(userData, userType, 'superAdmin');
                }
            }
            
            return {
                success: true,
                userData: StorageManager.getUserData(),
                userType,
                message: 'Login successful'
            };
            
        } catch (error) {
            console.error('Login failed:', error);
            return {
                success: false,
                message: error.message || 'Login failed. Please check your credentials.'
            };
        }
    }

    /**
     * Register new user
     * @param {object} userData - User registration data
     * @param {string} userType - 'customer' or 'partner'
     * @returns {Promise<object>} Registration result
     */
    static async register(userData, userType) {
        try {
            const response = await ApiService.postRegister(userData, userType);
            
            // Handle different response structures
            let userResponse, token;
            
            if (response.user) {
                // Customer registration response
                userResponse = response.user;
                token = response.user.token;
            } else if (response.admin) {
                // Partner registration response
                userResponse = response.admin;
                token = response.admin.token;
            } else {
                throw new Error('Invalid registration response structure');
            }
            
            // Store authentication data
            StorageManager.setAuthToken(token);
            StorageManager.setUserData(userResponse, userType);
            
            // For partners registering, they are automatically superAdmin
            if (userType === 'partner') {
                StorageManager.setUserData(userResponse, userType, 'superAdmin');
            }
            
            return {
                success: true,
                userData: StorageManager.getUserData(),
                userType,
                message: 'Registration successful'
            };
            
        } catch (error) {
            console.error('Registration failed:', error);
            return {
                success: false,
                message: error.message || 'Registration failed. Please try again.'
            };
        }
    }

    /**
     * Logout user and clear session
     */
    static logout() {
        StorageManager.clearAuth();
        UIManager.showInfo('You have been logged out');
        
        // Redirect to login page after a short delay
        setTimeout(() => {
            window.location.href = '/views/pages/login.html';
        }, 1000);
    }

    /**
     * Check if current session is valid
     * @returns {Promise<boolean>} True if session is valid
     */
    static async validateSession() {
        if (!StorageManager.isAuthenticated()) {
            return false;
        }

        try {
            const userData = StorageManager.getUserData();
            if (!userData) return false;

            // Get user type from stored data to determine which API to call
            const userType = userData.userType;
            if (!userType) return false;

            // Try to fetch user details to validate token using correct endpoint
            await ApiService.getUser(userData.id, userType);
            return true;
        } catch (error) {
            console.warn('Session validation failed:', error);
            this.logout();
            return false;
        }
    }

    /**
     * Get current user data with role information
     * @returns {object|null} Current user data
     */
    static getCurrentUser() {
        return StorageManager.getUserData();
    }

    /**
     * Check if user is authenticated
     * @returns {boolean} True if user is logged in
     */
    static isAuthenticated() {
        return StorageManager.isAuthenticated();
    }

    /**
     * Check if user is customer
     * @returns {boolean} True if user is customer
     */
    static isCustomer() {
        return StorageManager.isCustomer();
    }

    /**
     * Check if user is partner/admin
     * @returns {boolean} True if user is partner
     */
    static isPartner() {
        return StorageManager.isPartner();
    }

    /**
     * Check if user is super admin
     * @returns {boolean} True if user is super admin
     */
    static isSuperAdmin() {
        return StorageManager.isSuperAdmin();
    }

    /**
     * Check if user is admin staff
     * @returns {boolean} True if user is admin staff
     */
    static isAdminStaff() {
        return StorageManager.isAdminStaff();
    }

    /**
     * Initialize authentication state on page load
     * Redirects to login if not authenticated and page requires auth
     * @param {boolean} requireAuth - Whether page requires authentication
     */
    static async initializeAuth(requireAuth = false) {
        if (requireAuth && !this.isAuthenticated()) {
            window.location.href = '/views/pages/login.html';
            return false;
        }

        if (this.isAuthenticated()) {
            const isValid = await this.validateSession();
            if (requireAuth && !isValid) {
                return false;
            }
        }

        return true;
    }

    /**
     * Update user data in storage
     * @param {object} newUserData - Updated user data
     */
    static updateUserData(newUserData) {
        const currentData = StorageManager.getUserData();
        if (currentData) {
            const updatedData = { ...currentData, ...newUserData };
            StorageManager.setUserData(
                updatedData,
                updatedData.userType,
                updatedData.role
            );
        }
    }
}

window.AuthService = AuthService;
