import {LocalStorage, showError, showSuccess} from "./helpers.js";

export default class ApiRequest {
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
                `http://localhost:3000/api/${userType}/v1/authorization/register`, {
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
                `http://localhost:3000/api/${userType}/v1/authorization/login`, {
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
                `http://localhost:3000/api/${userType}/v1/authorization/forgot-password`, {
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
                throw new Error('Token is required for this action')
            }

            const response = await fetch(
                `http://localhost:3000/api/${authData?.role ? 'b2b' : 'b2c'}/v1/authorization/logout`, {
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
}