import {LocalStorage, showError, showSuccess} from "./helpers.js";
import {mockResponses} from "./mockData.js";

export default class ApiRequest {
    static baseUrl = 'http://localhost:3000/api'
    static checkResponse = async (response) => {
        if (!response.ok) {
            // Throw an error if status is not 2xx

            const text = await response.json()

            throw new Error(`${response.status}: ${text.messages}`)
        }
    }

    // SHARED: File upload
    // ENDPOINT: PUT /upload-url
    static async uploadFile(file) {
        try {
            const authData = LocalStorage.get('auth')
            if (!authData?.token) {
                throw new Error('uploadFile - Token is required for this action')
            }

            // Request presigned upload URL
            const response = await fetch(
                `${this.baseUrl}/upload-url`, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${authData.token}`
                    },
                    method: 'PUT',
                    body: JSON.stringify({
                        filename: file.name,
                        contentType: file.type
                    })
                });

            await ApiRequest.checkResponse(response)

            const res = await response.json();

            // Upload file directly to S3/RustFS
            await fetch(res.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                body: file
            });
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }



    // B2B & B2C: User registration
    // ENDPOINTS: POST /b2c/v1/authorization/register, POST /b2b/v1/authorization/register
    static async register(body, userType = 'b2c') {
        try {
            if (userType === 'b2c') {
                delete body.brandName
            }
            const response = await fetch(
                `${this.baseUrl}/${userType}/v1/authorization/register`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(body)
                });
            await ApiRequest.checkResponse(response)
            const res = await response.json()

            LocalStorage.set('auth', !!res.user ? res.user : res.admin)
            showSuccess(res.message)
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }

    // B2B & B2C: User login
    // ENDPOINTS: POST /b2c/v1/authorization/login, POST /b2b/v1/authorization/login
    static async login(body, userType = 'b2c') {
        try {
            const response = await fetch(
                `${this.baseUrl}/${userType}/v1/authorization/login`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(body)
                });
            await ApiRequest.checkResponse(response)
            const res = await response.json()

            LocalStorage.set('auth', res.user ?? res.admin)
            showSuccess(res.message)
            console.log(res)
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }

    // B2B & B2C: Forgot password
    // ENDPOINTS: POST /b2c/v1/authorization/forgot-password, POST /b2b/v1/authorization/forgot-password
    static async forgotPassword(body, userType = 'b2c') {
        try {
            const response = await fetch(
                `${this.baseUrl}/${userType}/v1/authorization/forgot-password`, {
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    method: 'POST',
                    body: JSON.stringify(body)
                });
            await ApiRequest.checkResponse(response)
            const res = await response.json()
            showSuccess(res.message)
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }

    // B2B & B2C: Reset password
    // ENDPOINTS: POST /b2c/v1/authorization/reset-password, POST /b2b/v1/authorization/reset-password
    static async resetPassword(token, userType, newPassword) {
        try {
            const response = await fetch(
                `${this.baseUrl}/${userType}/v1/authorization/reset-password`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    method: 'POST',
                    body: JSON.stringify({ newPassword })
                });
            await ApiRequest.checkResponse(response)
            const res = await response.json()
            showSuccess(res.message)
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }

    // B2B: Employee registration
    // ENDPOINT: POST /b2b/v1/authorization/employee/register
    static async registerEmployee(token, body) {
        try {
            const response = await fetch(
                `${this.baseUrl}/b2b/v1/authorization/employee/register`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`
                    },
                    method: 'POST',
                    body: JSON.stringify(body)
                });
            await ApiRequest.checkResponse(response)
            const res = await response.json()
            showSuccess(res.message)
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }

    // B2B & B2C: User logout
    // ENDPOINTS: GET /b2c/v1/authorization/logout, GET /b2b/v1/authorization/logout
    static async logout() {
        try {
            const authData = LocalStorage.get('auth')
            if (!authData?.token) {
                throw new Error('logout - Token is required for this action')
            }

            const response = await fetch(
                `${this.baseUrl}/${authData?.role ? 'b2b' : 'b2c'}/v1/authorization/logout`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${authData.token}`,
                    },
                    method: 'GET'
                });

            LocalStorage.set('auth', null)

            await ApiRequest.checkResponse(response)
            LocalStorage.set('auth', null)
            const res = await response.json()

            showSuccess(res.message)
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }

    // B2B & B2C: Get user profile
    // ENDPOINTS: GET /b2c/v1/user/{userID}, GET /b2b/v1/admin/{adminID}
    static async getProfile(id = null) {
        try {
            const authData = LocalStorage.get('auth')
            if (!authData?.token) {
                throw new Error('getProfile - Token is required for this action')
            }

            const response = await fetch(
                `${this.baseUrl}/${authData?.role ? 'b2b' : 'b2c'}/v1/${authData?.role ? 'admin' : 'user'}/${id ?? authData.id}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authData.token && { Authorization: `Bearer ${authData.token}` }),
                    },
                    method: 'GET'
                });
            await ApiRequest.checkResponse(response)
            const res = await response.json()

            showSuccess(res.message)
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }

    // B2B & B2C: Update user profile
    // ENDPOINTS: PATCH /b2c/v1/user/, PATCH /b2b/v1/admin/
    static async updateProfile(data) {
        try {
            const authData = LocalStorage.get('auth')
            if (!authData?.token) {
                throw new Error('getProfile - Token is required for this action')
            }

            const response = await fetch(
                `${this.baseUrl}/${authData?.role ? 'b2b' : 'b2c'}/v1/${authData?.role ? 'admin' : 'user'}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        ...(authData.token && { Authorization: `Bearer ${authData.token}` }),
                    },
                    method: 'PATCH',
                    body:  JSON.stringify({
                        firstName: data.firstName,
                        lastName: data.lastName,
                        email: data.email,
                        phone: data.phone,
                        avatarURL: data.avatarURL,
                    })
                });
            await ApiRequest.checkResponse(response)
            const res = await response.json()

            showSuccess(res.message)
            return res
        } catch (err) {
            showError(err)
            return null
        }
    }


    static async getRestaurants(queryParams = {}) {
        try {
            const queryString = new URLSearchParams();

            if (queryParams.search) queryString.append("search", queryParams.search);
            if (queryParams.radius) queryString.append("radius", queryParams.radius);
            if (queryParams.brandID) queryString.append("brandID", queryParams.brandID);
            if (queryParams.date) queryString.append("date", queryParams.date);

            // ✅ FIXED: categories must be array
            if (queryParams.categories && Array.isArray(queryParams.categories)) {
                queryParams.categories.forEach((category) => {
                    queryString.append("categories[]", category);
                });
            }

            if (queryParams.page) queryString.append("page", queryParams.page);
            if (queryParams.limit) queryString.append("limit", queryParams.limit);

            const url = queryString.toString()
                ? `${this.baseUrl}/b2c/v1/restaurant/?${queryString.toString()}`
                : `${this.baseUrl}/b2c/v1/restaurant/`;

            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            await ApiRequest.checkResponse(response);

            return await response.json();
        } catch (error) {
            showError(error);
            return null;
        }
    }
    // B2B & B2C: Get bookings
    // ENDPOINTS: GET /b2c/v1/booking/, GET /b2b/v1/booking/{restaurantID}
    static async getBookings(queryParams = {}, restaurantID = null) {
        try {
            const authData = LocalStorage.get('auth');
            const userType = authData?.role ? 'b2b' : 'b2c';
            
            // Build query string from parameters
            const queryString = new URLSearchParams();
            
            // Common parameters for both B2C and B2B with restaurantID
            if (queryParams.statuses && Array.isArray(queryParams.statuses)) {
                queryParams.statuses.forEach(status => queryString.append('statuses', status));
            }
            if (queryParams.page) queryString.append('page', queryParams.page);
            if (queryParams.limit) queryString.append('limit', queryParams.limit);
            
            let url;
            if (userType === 'b2c') {
                // B2C: User's bookings
                // Additional parameters: dateFrom, dateTo
                if (queryParams.dateFrom) queryString.append('dateFrom', queryParams.dateFrom);
                if (queryParams.dateTo) queryString.append('dateTo', queryParams.dateTo);
                
                url = queryString.toString() 
                    ? `${this.baseUrl}/b2c/v1/booking/?${queryString.toString()}`
                    : `${this.baseUrl}/b2c/v1/booking/`;
            } else {
                // B2B: Specific restaurant bookings
                if (restaurantID) {
                    url = queryString.toString() 
                        ? `${this.baseUrl}/b2b/v1/booking/${restaurantID}?${queryString.toString()}`
                        : `${this.baseUrl}/b2b/v1/booking/${restaurantID}`;
                } else {
                    throw new Error('getBookings - restaurantID is required for B2B bookings');
                }
            }

            const headers = {
                'Content-Type': 'application/json'
            };

            // Add authorization header for authenticated users
            if (authData?.token) {
                headers.Authorization = `Bearer ${authData.token}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            await ApiRequest.checkResponse(response);
            const res = await response.json();
            return res;
        } catch (error) {
            showError(error);
            return null;
        }
    }
    // B2B: Get booking summaries
    // ENDPOINT: GET /b2b/v1/booking/
    static async getBookingSummaries(queryParams = {}) {
        try {
            const authData = LocalStorage.get('auth');
            if (!authData?.role) {
                throw new Error('getBookingSummaries - This endpoint is for B2B users only');
            }

            // Build query string from parameters
            const queryString = new URLSearchParams();
            
            // B2B parameters: brandID, statuses, page, limit
            if (queryParams.brandID) queryString.append('brandID', queryParams.brandID);
            if (queryParams.statuses && Array.isArray(queryParams.statuses)) {
                queryParams.statuses.forEach(status => queryString.append('statuses', status));
            }
            if (queryParams.page) queryString.append('page', queryParams.page);
            if (queryParams.limit) queryString.append('limit', queryParams.limit);

            const url = queryString.toString() 
                ? `${this.baseUrl}/b2b/v1/booking/?${queryString.toString()}`
                : `${this.baseUrl}/b2b/v1/booking/`;

            const headers = {
                'Content-Type': 'application/json'
            };

            // Add authorization header for authenticated users
            if (authData?.token) {
                headers.Authorization = `Bearer ${authData.token}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            await ApiRequest.checkResponse(response);
            const res = await response.json();
            return res;
        } catch (error) {
            showError(error);
            return null;
        }
    }
    // B2B: Get dashboard data
    // ENDPOINT: GET /b2b/v1/dashboard/
    static async getDashboard(queryParams = {}) {
        try {
            const authData = LocalStorage.get('auth');
            if (!authData?.token) {
                throw new Error('getDashboard - Token is required for this action');
            }

            // Build query string for timeFrom and timeTo parameters
            const queryString = new URLSearchParams(queryParams).toString();
            const url = `${this.baseUrl}/b2b/v1/dashboard/${queryString ? `?${queryString}` : ''}`;
            
            const headers = {
                'Content-Type': 'application/json'
            };

            // Add authorization header for authenticated users
            if (authData?.token) {
                headers.Authorization = `Bearer ${authData.token}`;
            }

            const response = await fetch(url, {
                method: 'GET',
                headers
            });

            await ApiRequest.checkResponse(response);
            const res = await response.json();
            return res;
        } catch (error) {
            showError(error);
            return null;
        }
    }

    static async getRestaurant(id) {
        try {
            const response = await fetch(`${this.baseUrl}/b2c/v1/restaurant/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                }
            });

            await ApiRequest.checkResponse(response);
            const res = await response.json();
            return res;
        } catch (error) {
            showError(error);
            return null;
        }
    }
}