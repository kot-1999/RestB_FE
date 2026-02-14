/**
 * Centralized API Service for RestB Frontend
 * Handles all API requests with authentication, error handling, and response formatting
 */

class ApiService {
    /**
     * Make API request with authentication and error handling
     * @param {string} endpoint - API endpoint (without base URL)
     * @param {object} options - Request options
     * @returns {Promise<object>} API response
     */
    static async request(endpoint, options = {}) {
        const config = window.RestBConfig.getConfig();
        const token = StorageManager.getAuthToken();
        
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
                ...(token && { 'Authorization': `Bearer ${token}` })
            }
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        // Handle request body
        if (finalOptions.body && typeof finalOptions.body === 'object') {
            finalOptions.body = JSON.stringify(finalOptions.body);
        }
        
        try {
            const response = await fetch(`${config.baseUrl}${endpoint}`, finalOptions);
            
            // Handle 401 Unauthorized - token expired
            if (response.status === 401) {
                StorageManager.clearAuth();
                window.location.href = '/views/pages/login.html';
                throw new Error('Session expired. Please login again.');
            }
            
            let data;
            try {
                data = await response.json();
            } catch {
                data = { error: await response.text() };
            }
            
            if (!response.ok) {
                throw new Error(data.message || data.error || `HTTP ${response.status}`);
            }
            
            return data;
        } catch (error) {
            console.error('API request failed:', error);
            throw error;
        }
    }

    // Authentication endpoints
    static async postLogin(email, password) {
        const endpoint = userType === 'partner' 
            ? '/api/b2b/v1/authorization/login'
            : '/api/b2c/v1/authorization/login';
            
        return this.request(endpoint, {
            method: 'POST',
            body: { email, password }
        });
    }

    static async postRegister(userData, userType) {
        const endpoint = userType === 'partner'
            ? '/api/b2b/v1/authorization/register'
            : '/api/b2c/v1/authorization/register';
            
        return this.request(endpoint, {
            method: 'POST',
            body: userData
        });
    }

    // User endpoints
    static async getUser(userId, userType = 'customer') {
        // Determine endpoint based on user type
        const endpoint = userType === 'partner' 
            ? `/api/b2b/v1/user/${userId}`  // B2B for partners
            : `/api/b2c/v1/user/${userId}`; // B2C for customers
            
        return this.request(endpoint);
    }

    static async updateUser(userId, userData) {
        return this.request(`/api/b2c/v1/user/${userId}`, {
            method: 'PUT',
            body: userData
        });
    }

    // Booking endpoints
    static async getBookings() {
        return this.request('/api/b2c/v1/bookings');
    }

    static async postBooking(bookingData) {
        return this.request('/api/b2c/v1/bookings', {
            method: 'POST',
            body: bookingData
        });
    }

    // Admin endpoints
    static async getAdminUsers() {
        return this.request('/api/b2b/v1/users');
    }

    static async getAdminBookings() {
        return this.request('/api/b2b/v1/bookings');
    }
}

window.ApiService = ApiService;
