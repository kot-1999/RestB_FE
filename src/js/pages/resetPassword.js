import {getFormData, showError} from "../utils/helpers.js";
import ApiRequest from "../utils/ApiRequest.js";

export default function () {
    $('#resetPasswordForm').submit(async function ( e) {
        e.preventDefault();

        const hash = window.location.hash

        const queryString = hash.includes('?')
            ? hash.substring(hash.indexOf('?'))
            : ''

        const params = new URLSearchParams(queryString)

        const userType = params.get('userType')
        const token = params.get('token')
        const formData = getFormData(e.target)

        if (!userType || !token) {
            showError(new Error('Required data from backend are missing'))
        }

        if (formData.passwordRepeat !== formData.password) {
            showError(new Error('Passwords dont match'))
        }
        console.log('userType:', userType)
        console.log('token:', token)

        await ApiRequest.resetPassword(token, userType, formData.password)
    })
}