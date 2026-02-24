// Show page content
import { Template } from "./config.js";
import loadAuth from "./pages/auth.js"
import loadHome from "./pages/home.js"
import loadProfile from "./pages/profile.js"
import loadRestaurantDetails from "./pages/restaurantDetails.js"
import loadDashboard from "./pages/dashboard.js"
import loadResetPassword from "./pages/resetPassword.js"
import ApiRequest from "./utils/ApiRequest.js";
import { showError, LocalStorage } from "./utils/helpers.js";

function showContent() {
    $('#content').css('visibility', 'visible')
}

const STATE = {
    NO_AUTH: 'No-auth',
    USER: 'User',
    EMPLOYEE: 'Employee',
    ADMIN: 'Admin'
}

function getState() {
    const authData = LocalStorage.get('auth')
    if (!authData) {
        return STATE.NO_AUTH
    }
    else if (!authData?.role) {
        return STATE.USER
    } else if (authData.role === STATE.ADMIN || authData.role === STATE.EMPLOYEE) {
        return authData.role
    }

}

// Update navigation visibility based on authentication status
function updateNavigationAuth() {
    const authData = LocalStorage.get('auth')
    // const isAuthenticated = authData && authData.token // old method
    const isAuthenticated = !!(authData && authData.token) // fixed now it returns boolean
    console.log(`updateNavigationAuth: ${authData}`)
    // Show/hide sign in and sign up buttons
    // $('#navSignIn').toggle(!isAuthenticated)
    // $('#navSignUp').toggle(!isAuthenticated)
    //
    // // Show/hide sign out and profile buttons
    // $('#navSignOut').toggle(isAuthenticated)
    // $('#navProfile').toggle(isAuthenticated)
}

// First load on when document DOM is ready
$(document).ready(function () {
    try {
        renderFromHash()
        showContent()

        // Navigation clicks ONLY change hash
        $(document).on('click', '#signin', () => {
            location.hash = '#signin'
        })

        $(document).on('click', '#signup', () => {
            location.hash = '#signup'
        })

        $(document).on('click', '#signout', () => {
            location.hash = '#signout'
        })

        $(document).on('click', '#profile', () => {
            location.hash = '#profile'
        })

        $(document).on('click', '#restaurant-details', () => {
            location.hash = '#restaurant-details'
        })

        $(document).on('click', '#dashboard', () => {
            location.hash = '#dashboard'
        })
    } catch (err) {
        showError(err)
    }
})

// Load page
function loadPage(template, loader, navId) {
    $('.navItem')?.removeClass('navActive')

    $(navId)?.addClass('navActive')

    $('#content').empty()
        .append(template())

    loader()

    window.scrollTo({
        top: 0,
        behavior: 'auto'
    })
}
const logout = () => {
    ApiRequest.logout().then(() => {
        loadHome()
    })
}
// Handles page reload. Assures that page will reload on same page
function renderFromHash() {
    try {
        const routes = {
            '#signin': {
                template: Template.page.auth,
                loader: loadAuth,
                nav: '#signin'
            },
            '#signout': {
                template: Template.page.home,
                loader: logout,
                nav: '#home'
            },
            '#profile': {
                template: Template.page.profile,
                loader: loadProfile,
                nav: '#profile'
            },
            '#home': {
                template: Template.page.home,
                loader: loadHome,
                nav: '#home'
            },
            '#restaurant-details': {
                template: Template.page.restaurantDetails,
                loader: loadRestaurantDetails,
                nav: '#restaurant-details'
            },
            '#dashboard': {
                template: Template.page.dashboard,
                loader: loadDashboard,
                nav: '#dashboard'
            },
            '#reset-password': {
                template: Template.page.resetPassword,
                loader: loadResetPassword
            }
        }

        // Load main page if url hash is not available
        // Extract route without query params
        const fullHash = window.location.hash || '#home'
        const routeHash = fullHash.split('?')[0]

        // Load main page if route does not exist
        if (!routes[routeHash]) {
            window.location.hash = '#home'
            return
        }

        const route = routes[routeHash]
        loadPage(route.template, route.loader, route.nav)
    } catch (err) {
        showError(err)
    }
}

// Handles nav toggle
$(document).on('click', '#navToggle', function () {
    $('#navMenu').toggleClass('open')
})

// Close naw if clicked outside
$(document).on('click', function (e) {
    const $navMenu = $('#navMenu')
    const $toggle = $('#navToggle')

    if ($navMenu.hasClass('open') && !$(e.target).closest($navMenu).length && !$(e.target).is($toggle)) {
        $navMenu.removeClass('open')
    }
})

// Reacts on any hash changes
window.addEventListener('hashchange', renderFromHash)
