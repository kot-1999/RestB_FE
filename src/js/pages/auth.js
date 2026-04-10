import Template from "../utils/Template.js";
import ApiRequest from "../utils/ApiRequest.js";
import {LocalStorage, showError} from "../utils/helpers.js";


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

        const userType = $('#userType').val()

        if (userType === 'b2c') {
            $('label[for="brandName"], #brandName').hide();
        } else {
            $('label[for="brandName"], #brandName').show()
        }
    })
}

const load = () => {
    const authData = LocalStorage.get('auth')
    if (authData?.token) {
        showError(new Error(`Log Out First.`) )
        return
    }
    $('#auth01').append(Template.component.login())

    // Setup both button groups
    setupButtonGroup('.user-type-btn', '#userType', 'type')
    setupButtonGroup('.auth-btn', '#authType', 'auth')

    // Handle form submission
    $('#authForm').submit(async function ( e) {
        e.preventDefault() // prevent page reload


        const userType = $('#userType').val()
        const authType = $('#authType').val()

        try {
            if (authType === 'register') {
                await ApiRequest.register({
                    email: $('#email').val(),
                    password: $('#password').val(),
                    firstName: $('#firstName').val(),
                    lastName: $('#lastName').val(),
                    phone: $('#phone').val(),
                    brandName: $('#brandName').val(),
                }, userType)

                userType === 'b2c' ? window.location.hash = '#home' :  window.location.hash = '#dashboard'
            }
            else if (authType === 'login') {
                await ApiRequest.login({
                    email: $('#email').val(),
                    password: $('#password').val(),
                }, userType)
                userType === 'b2c' ? window.location.hash = '#home' :  window.location.hash = '#dashboard'
            }
            else if (authType === 'forgotPassword') {
                await ApiRequest.forgotPassword({
                    email: $('#email').val(),
                }, userType)
            }
        } catch (err) {
            showError(err)
        }
    })
}

export default load