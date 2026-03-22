import {getFormData, showError} from "../utils/helpers.js";
import ApiRequest from "../utils/ApiRequest.js";

export default function () {
    $('#authForm').submit(async function ( e) {
        e.preventDefault();

        const hash = window.location.hash

        const queryString = hash.includes('?')
            ? hash.substring(hash.indexOf('?'))
            : ''

        const params = new URLSearchParams(queryString)

        const token = params.get('token')
        const formData = getFormData(e.target)

        if (!token) {
            showError(new Error('Required data from backend are missing'))
        }

        if (formData.passwordRepeat !== formData.password) {
            showError(new Error('Passwords dont match'))
        }

        await ApiRequest.registerEmployee(token, {
            firstName: formData.firstName,
            lastName: formData.lastName,
            phone: formData.phone,
            password: formData.password
        })
    })
}