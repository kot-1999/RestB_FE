import Mustache from "./mustache.js";
import Template from "./Template.js";

const STATE = {
    NO_AUTH: 'No-auth',
    USER: 'User',
    EMPLOYEE: 'Employee',
    ADMIN: 'Admin'
}


export function getState() {
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

const elements = [
    {
        id: 'nav-dashboard',
        disabledFor: [STATE.USER, STATE.NO_AUTH]
    },
    {
        id: 'nav-profile',
        disabledFor: [STATE.NO_AUTH]
    },
    {
        id: 'profile-role',
        disabledFor: [STATE.USER]
    },
    {
        id: 'nav-signin',
        disabledFor: [STATE.ADMIN, STATE.USER, STATE.EMPLOYEE]
    },
    {
        id: 'nav-signup',
        disabledFor: [STATE.ADMIN, STATE.USER, STATE.EMPLOYEE]
    },
    {
        id: 'nav-signout',
        disabledFor: [STATE.NO_AUTH]
    },
    {
        id: 'nav-manage-restaurants',
        disabledFor: [STATE.NO_AUTH, STATE.USER]
    },
    {
        id: 'nav-bookings',
        disabledFor: [STATE.NO_AUTH, STATE.ADMIN, STATE.EMPLOYEE]
    },
    {
        id: 'nav-manage-bookings',
        disabledFor: [STATE.NO_AUTH, STATE.USER]
    },
    {
        id: 'booking-card-meta',
        disabledFor: [STATE.NO_AUTH, STATE.USER]
    },
    {
        id: 'booking-card-approve',
        disabledFor: [STATE.NO_AUTH, STATE.USER]
    },
    {
        id: 'booking-card-confirm',
        disabledFor: [STATE.NO_AUTH, STATE.USER]
    },
    {
        id: 'booking-card-noshow',
        disabledFor: [STATE.NO_AUTH, STATE.USER]
    },
    {
        id: 'booking-details-create-form',
        disabledFor: [STATE.ADMIN, STATE.EMPLOYEE]
    },
    {
        id: 'brand-admin-header',
        disabledFor: [STATE.USER]
    }
]

const magicClassName = 'trackable'

// Update navigation visibility based on authentication status
export function updateVisibility() {
    const state = getState()

    elements.forEach(({ id, disabledFor }) => {
        let $el = $('#' + id)

        // fallback to class if no id found
        if (!$el.length) {
            $el = $('.' + id)
        }

        if (!$el.length) {
            return
        }

        if (disabledFor.includes(state)) {
            $el.addClass(magicClassName)
        } else {
            $el.removeClass(magicClassName)
        }
    })
}

export class LocalStorage {
    static set(key, value) {
        localStorage.setItem(key, JSON.stringify(value));
    }

    static get(key) {
        const value = localStorage.getItem(key);
        return value ? JSON.parse(value) : null;
    }
}

export function showError(err) {
    console.error(err)
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message ?? err.messages,

        // Position logic
        position: 'bottom-end',

        // Toast mode looks better in corner
        toast: true,

        timer: 5000,
        timerProgressBar: true,

        showCloseButton: true,
        showConfirmButton: false,

        didOpen: (toast) => {
            // Pause timer when hovered
            toast.addEventListener('mouseenter', Swal.stopTimer)
            toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
    })
}

export function showSuccess(text) {
    if (text)
        Swal.fire({
            icon: 'success',
            title: 'Success',
            text,

            // Position logic
            position: 'bottom-end',

            // Toast mode looks better in corner
            toast: true,
            timer: 3000,
            timerProgressBar: true,

            showCloseButton: true,
            showConfirmButton: false,

            didOpen: (toast) => {
                // Pause timer when hovered
                toast.addEventListener('mouseenter', Swal.stopTimer)
                toast.addEventListener('mouseleave', Swal.resumeTimer)
            }
        })
}

export function getFormData(target) {
    const formData = new FormData(target)

    return Object.fromEntries(
        Array.from(formData.entries()).map(([key, value]) => {
            return [key, value]
        })
    )
}

export function renderHeaderWithBrand(brand, title, secondTitle) {
    console.log(brand)
    const $headerWithBrand = $('#brand-admin-header')
    const template = Template.component.headerWithBrand()
    $headerWithBrand.replaceWith(Mustache.render(template, { ...brand, title, secondTitle }))
}

export function authRequired() {

}