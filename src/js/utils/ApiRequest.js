import { LocalStorage, showError, showSuccess } from "./helpers.js";
import { mockResponses } from "./mockData.js";

export default class ApiRequest {
    static baseUrl = 'http://localhost:3000/api'
    static checkResponse = async (response) => {
        if (!response.ok) {
            // Throw an error if status is not 2xx

            const text = await response.json()

            throw new Error(`${response.status}: ${text.messages}`)
        }
    }
    static async register(body, userType = 'b2c') {
        try {
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

            LocalStorage.set('auth', res.user ?? res.admin)
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
                    ...(authData.token && { Authorization: `Bearer ${authData.token}` }),
                },
                method: 'GET'
            });
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

    static async getProfile(id) {
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


    static async getRestaurants(queryParams) {
        try {
            // Make a real HTTP request (will show in Network tab)
            // const response = await fetch(`${this.baseUrl}/b2c/restaurants`, {
            //     method: 'GET',
            //     headers: {
            //         'Content-Type': 'application/json'
            //     }
            // });
            //
            // // If the real API doesn't exist, fall back to mock data
            // if (!response.ok) {
            //     throw new Error('API not available, using mock data');
            // }
            //
            // const data = await response.json();
            // return {
            //     success: true,
            //     data: data,
            //     message: 'Restaurants fetched successfully'
            // };
            return mockResponses.getRestaurants()
        } catch (error) {
            showError(err)
            return null
        }
    }
}