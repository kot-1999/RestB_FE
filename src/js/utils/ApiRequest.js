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

    static async logout() {
        try {
            const authData = LocalStorage.get('auth')
            if (!authData?.token) {
                throw new Error('logout - Token is required for this action')
            }

            const response = await fetch(
                `${this.baseUrl}/${(authData?.role === 'Admin' || authData?.role === 'Employee') ? 'b2b' : 'b2c'}/v1/authorization/logout`, {
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

    static async getProfile(id = null) {
        try {
            const authData = LocalStorage.get('auth')
            if (!authData?.token) {
                throw new Error('getProfile - Token is required for this action')
            }

            const response = await fetch(
                `${this.baseUrl}/${(authData?.role === 'Admin' || authData?.role === 'Employee') ? 'b2b' : 'b2c'}/v1/${(authData?.role === 'Admin' || authData?.role === 'Employee') ? 'admin' : 'user'}/${id ?? authData.id}`, {
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

    static async updateProfile(data) {
        try {
            const authData = LocalStorage.get('auth')
            if (!authData?.token) {
                throw new Error('getProfile - Token is required for this action')
            }

            const response = await fetch(
                `${this.baseUrl}/${(authData?.role === 'Admin' || authData?.role === 'Employee') ? 'b2b' : 'b2c'}/v1/${(authData?.role === 'Admin' || authData?.role === 'Employee') ? 'admin' : 'user'}`, {
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
            // Build query string from parameters
            const queryString = new URLSearchParams();
            
            // Add query parameters if they exist
            if (queryParams.search) queryString.append('search', queryParams.search);
            if (queryParams.radius) queryString.append('radius', queryParams.radius);
            if (queryParams.brandID) queryString.append('brandID', queryParams.brandID);
            if (queryParams.date) queryString.append('date', queryParams.date);
            if (queryParams.categories && Array.isArray(queryParams.categories)) {
                queryParams.categories.forEach(cat => queryString.append('categories', cat));
            }
            if (queryParams.page) queryString.append('page', queryParams.page);
            if (queryParams.limit) queryString.append('limit', queryParams.limit);

            const url = queryString.toString() 
                ? `${this.baseUrl}/b2c/v1/restaurant/?${queryString.toString()}`
                : `${this.baseUrl}/b2c/v1/restaurant/`;

            const response = await fetch(url, {
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
    //getBookings b2c (user bookings) and b2b (bookings for a specific restaurant)
    static async getBookings(queryParams = {}, restaurantID = null) {
        try {
            const authData = LocalStorage.get('auth');
            const userType = (authData?.role === 'Admin' || authData?.role === 'Employee') ? 'b2b' : 'b2c';
            
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
    //getBookingSummaries b2b only endpoint
    static async getBookingSummaries(queryParams = {}) {
        try {
            const authData = LocalStorage.get('auth');
            if (!authData?.role || (authData.role !== 'Admin' && authData.role !== 'Employee')) {
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
    //getDashboard b2b only endpoint
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
}