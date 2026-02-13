import LocalStorage from './../utils/LocalStorage.js';

export default class ApiRequest {
    static checkResponse = async (response) => {
        if (!response.ok) {
            // Throw an error if status is not 2xx
            const text = await response.text()
            throw new Error(`HTTP ${response.status}: ${text}`)
        }
    }
    static async register(body, userType = 'b2c') {
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
        return res
    }

    static async login(body, userType = 'b2c') {
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
        return res
    }

    static async forgotPassword(body, userType = 'b2c') {
        const response = await fetch(
            `http://localhost:3000/api/${userType}/v1/authorization/forgot-password`, {
                headers: {
                    'Content-Type': 'application/json',
                },
                method: 'POST',
                body: JSON.stringify(body)
            });
        await ApiRequest.checkResponse(response)
        return await response.json()
    }

    static async logout() {
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
        LocalStorage.set('auth', null)
        console.log('User was logged out', LocalStorage.get('auth'))
        await ApiRequest.checkResponse(response)
        return await response.json()
    }
}