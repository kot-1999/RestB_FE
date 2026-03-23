import {LocalStorage, showError, showSuccess} from "./helpers.js";

export default class ApiRequest {
    static baseUrl = 'http://localhost:3000/api'

    static checkResponse = async (response) => {
        if (!response.ok) {
            let message = 'An error occurred';
            try {
                const errorData = await response.json();
                message = errorData.messages || errorData.message || message;
            } catch (e) {
                message = await response.text();
            }
            throw new Error(`${response.status}: ${message}`);
        }
    }

    // Helper for common headers
    static getHeaders(authData) {
        const headers = { 'Content-Type': 'application/json' };
        if (authData?.token) {
            headers['Authorization'] = `Bearer ${authData.token}`;
        }
        return headers;
    }

    // B2B: Admin Restaurant List (With Daily Summary)
    // Endpoint: GET /b2b/v1/booking/
    static async getAdminRestaurants(queryParams = {}) {
        try {
            const authData = LocalStorage.get("auth");
            const params = new URLSearchParams(queryParams).toString();
            const url = `${this.baseUrl}/b2b/v1/booking/${params ? '?' + params : ''}`;
            const response = await fetch(url, {
                headers: this.getHeaders(authData),
                method: "GET",
            });
            await ApiRequest.checkResponse(response);
            return await response.json();
        } catch (err) {
            showError(err);
            return null;
        }
    }

    // B2C: Public Restaurant List
    static async getRestaurants(queryParams = {}) {
        try {
            const params = new URLSearchParams();
            Object.entries(queryParams).forEach(([key, value]) => {
                if (value === undefined || value === null) return;
                if (Array.isArray(value)) {
                    value.forEach(v => params.append(`${key}[]`, v));
                } else {
                    params.append(key, value);
                }
            });
            const queryString = params.toString();
            const url = `${this.baseUrl}/b2c/v1/restaurant/${queryString ? '?' + queryString : ''}`;
            const response = await fetch(url, {
                headers: { 'Content-Type': 'application/json' },
                method: 'GET'
            });
            await ApiRequest.checkResponse(response);
            return await response.json();
        } catch (err) {
            showError(err);
            return null;
        }
    }

    // SHARED: Restaurant Details
    static async getRestaurantDetails(id) {
        try {
            const authData = LocalStorage.get("auth");
            // Check for 'Admin' (capital A) as seen in user's localStorage
            const isAdmin = authData?.role === 'Admin';
            const isPublicPage = window.location.hash.startsWith('#restaurant-details');
            const userType = (isAdmin && !isPublicPage) ? "b2b" : "b2c";

            const response = await fetch(`${this.baseUrl}/${userType}/v1/restaurant/${id}`, {
                headers: this.getHeaders(authData),
                method: 'GET'
            });
            await ApiRequest.checkResponse(response);
            return await response.json();
        } catch (err) {
            showError(err);
            return null;
        }
    }

    // BOOKINGS: List/Create/Update
    static async getBookings(queryParams = {}, restaurantID = null) {
        try {
            const authData = LocalStorage.get('auth');
            const isAdmin = authData?.role === 'Admin';

            let url;
            let method = 'GET';
            let body = null;

            if (isAdmin && restaurantID) {
                // B2B Path: GET /b2b/v1/booking/{restaurantID}
                const params = new URLSearchParams();
                if (queryParams.page) params.append('page', queryParams.page);
                if (queryParams.limit) params.append('limit', queryParams.limit);
                if (queryParams.dateFrom) params.append('dateFrom', queryParams.dateFrom);
                if (queryParams.dateTo) params.append('dateTo', queryParams.dateTo);

                const queryString = params.toString();
                url = `${this.baseUrl}/b2b/v1/booking/${restaurantID}${queryString ? '?' + queryString : ''}`;
            } else {
                // B2C Path: POST /b2c/v1/booking/list
                url = `${this.baseUrl}/b2c/v1/booking/list`;
                method = 'POST';
                body = JSON.stringify(queryParams);
            }

            const response = await fetch(url, {
                headers: this.getHeaders(authData),
                method: method,
                body: body
            });
            await ApiRequest.checkResponse(response);
            return await response.json();
        } catch (err) {
            showError(err);
            return null;
        }
    }

    static async updateBooking(bookingID, body) {
        try {
            const authData = LocalStorage.get('auth');
            const isAdmin = authData?.role === 'Admin';
            const userType = isAdmin ? 'b2b' : 'b2c';

            const response = await fetch(`${this.baseUrl}/${userType}/v1/booking/${bookingID}`, {
                headers: this.getHeaders(authData),
                method: 'PATCH',
                body: JSON.stringify(body)
            });
            await ApiRequest.checkResponse(response);
            const res = await response.json();
            showSuccess(res.message || "Booking updated");
            return res;
        } catch (err) {
            showError(err);
            return null;
        }
    }

    // AUTH & OTHER METHODS
    static async login(body, userType = 'b2c') {
        try {
            const response = await fetch(`${this.baseUrl}/${userType}/v1/authorization/login`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(body)
            });
            await ApiRequest.checkResponse(response);
            const res = await response.json();
            LocalStorage.set('auth', res.user ?? res.admin);
            showSuccess(res.message);
            return res;
        } catch (err) {
            showError(err);
            return null;
        }
    }

    static async register(body, userType = 'b2c') {
        try {
            if (userType === 'b2c') delete body.brandName;
            const response = await fetch(`${this.baseUrl}/${userType}/v1/authorization/register`, {
                headers: { 'Content-Type': 'application/json' },
                method: 'POST',
                body: JSON.stringify(body)
            });
            await ApiRequest.checkResponse(response);
            const res = await response.json();
            LocalStorage.set('auth', res.user ?? res.admin);
            showSuccess(res.message);
            return res;
        } catch (err) {
            showError(err);
            return null;
        }
    }

    static async logout() {
        try {
            const authData = LocalStorage.get('auth');
            const isAdmin = authData?.role === 'Admin';
            const userType = isAdmin ? 'b2b' : 'b2c';
            const response = await fetch(`${this.baseUrl}/${userType}/v1/authorization/logout`, {
                headers: this.getHeaders(authData),
                method: 'GET'
            });
            LocalStorage.set('auth', null);
            await ApiRequest.checkResponse(response);
            return await response.json();
        } catch (err) {
            showError(err);
            return null;
        }
    }
}