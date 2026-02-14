// Show page content
import {Template} from "./config.js";
import loadAuth from "./pages/auth.js"
import loadHome from "./pages/home.js"
import loadProfile from "./pages/profile.js"

import ApiRequest from "./utils/ApiRequest.js";
import {showError, LocalStorage} from "./utils/helpers.js";

function showContent() {
    $('#content').css('visibility', 'visible')
}

// Update navigation visibility based on authentication status
function updateNavigationAuth() {
    const authData = LocalStorage.get('auth')
    const isAuthenticated = authData && authData.token
    
    // Show/hide sign in button
    $('#navProjects').toggle(!isAuthenticated)
    
    // Show/hide sign out and profile buttons
    $('#navTechStack').toggle(isAuthenticated)
    $('#navLibrary').toggle(isAuthenticated)
}

// First load on when document DOM is ready
$(document).ready(function () {
    try {
        renderFromHash()
        showContent()
        updateNavigationAuth()

        // Expose updateNavigationAuth to global scope for other modules
        window.updateNavigationAuth = updateNavigationAuth

        // Navigation clicks ONLY change hash
        $(document).on('click', '#signin', () => {
            location.hash = '#signin'
        })

        $(document).on('click', '#signout', () => {
            location.hash = '#signout'
        })

        $(document).on('click', '#profile', () => {
            location.hash = '#profile'
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
        updateNavigationAuth()
        loadHome()
    }).catch(error => console.log(error.message))
}
// Handles page reload. Assures that page will reload on same page
function renderFromHash() {
    const routes = {
        '#signin': {
            template: Template.page.auth,
            loader: loadAuth,
            nav: '#signin'
        },
        '#signout': {
            template: Template.page.home,
            loader: logout,
            nav: '#navMain'
        },
        '#profile': {
            template: Template.page.profile,
            loader: loadProfile,
            nav: '#profile'
        }
    }

    // Load main page if url hash is not available
    const route = routes[window.location.hash] || {
        template: Template.page.home,
        loader: loadHome,
        nav: '#navMain'
    }

    loadPage(route.template, route.loader, route.nav)
}

// Handles nav toggle
$(document).on('click', '#navToggle', function () {
    $('#navMenu').toggleClass('open')
})

// Close naw if clicked outside
$(document).on('click', function(e) {
    const $navMenu = $('#navMenu')
    const $toggle = $('#navToggle')

    if ($navMenu.hasClass('open') && !$(e.target).closest($navMenu).length && !$(e.target).is($toggle)) {
        $navMenu.removeClass('open')
    }
})

// Reacts on any hash changes
window.addEventListener('hashchange', renderFromHash)
