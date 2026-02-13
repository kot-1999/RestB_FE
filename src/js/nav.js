// Show page content
import {Template} from "./config.js";
import loadAuth from "./pages/auth.js"
import loadHome from "./pages/home.js"
import ApiRequest from "./utils/ApiRequest.js";

function showContent() {
    $('#content').css('visibility', 'visible')
}

// First load on when document DOM is ready
$(document).ready(function () {
    renderFromHash()
    showContent()

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
})

// Load page
function loadPage(template, loader, navId) {
    $('.navItem').removeClass('navActive')

    $(navId).addClass('navActive')

    $('#content').empty()
        .append(template())

    loader()

    window.scrollTo({
        top: 0,
        behavior: 'auto'
    })
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
            template: Template.page.home(),
            loader: () => {
                ApiRequest.logout().catch(error =>   console.log(error.message))
                loadHome()
            },
            nav: '#navMain'
        },
        '#profile': {
            template: Template.page.profile,
            loader: () => { console.log('profile')},
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
