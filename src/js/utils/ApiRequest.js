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
        return await response.json()
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
        return await response.json()
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
}