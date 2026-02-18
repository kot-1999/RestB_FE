import {Template} from "../config.js";
import ApiRequest from "../utils/ApiRequest.js";
import {LocalStorage} from "../utils/helpers.js";


// Generic function to toggle active button in a group and update hidden input and form
function setupButtonGroup(buttonSelector, hiddenInputSelector, dataAttr) {
    $(buttonSelector).on('click', function () {
        // Remove active from all buttons in this group
        $(buttonSelector).removeClass('active')
        // Add active to clicked button
        $(this).addClass('active')

        // Update hidden input with the clicked button's data attribute
        const value = $(this).data(dataAttr)
        $(hiddenInputSelector).val(value)

        if (value === 'login') {
            $('#auth01').empty().append(Template.component.login())
        } else if (value === 'register') {
            $('#auth01').empty().append(Template.component.register())
        } else if (value === 'forgotPassword') {
            $('#auth01').empty().append(Template.component.forgotPassword())
        }
        console.log(value)
    })
}

const load = () => {
    $('#auth01').append(Template.component.login())

    // Setup both button groups
    setupButtonGroup('.user-type-btn', '#userType', 'type')
    setupButtonGroup('.auth-btn', '#authType', 'auth')

    // Handle form submission
    $('#authForm').submit(async function ( e) {
        e.preventDefault() // prevent page reload


        const userType = $('#userType').val()
        const authType = $('#authType').val()
        let res

        try {
            if (authType === 'register') {
                res = await ApiRequest.register({
                    email: $('#email').val(),
                    password: $('#password').val(),
                    firstName: $('#firstName').val(),
                    lastName: $('#lastName').val(),
                    phone: $('#phone').val(),
                }, userType)
                if (res) updateNavigationAfterAuth()
            }
            else if (authType === 'login') {
                res = await ApiRequest.login({
                    email: $('#email').val(),
                    password: $('#password').val(),
                }, userType)
                if (res) updateNavigationAfterAuth()
            }
            else if (authType === 'forgotPassword') {
                res = await ApiRequest.forgotPassword({
                    email: $('#email').val(),
                }, userType)
            }
        } catch (err) {
            console.log(err)
        }

        console.log('Submitting form data:', res)

        // Example AJAX request to backend
    })
}

export default load