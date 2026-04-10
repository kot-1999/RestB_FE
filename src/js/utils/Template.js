export default {
    page: {
        auth: () => document.getElementById('auth-template').innerHTML,
        profile: () => document.getElementById('profile-template').innerHTML,
        home: () => document.getElementById('home-template').innerHTML,
        restaurantDetails: () => document.getElementById('restaurant-details-template').innerHTML,
        dashboard: () => document.getElementById('dashboard-template').innerHTML,
        resetPassword: () => document.getElementById('reset-password-template').innerHTML,
        mybooking: () => document.getElementById("mybooking-template").innerHTML,
        adminrestaurants: () => document.getElementById("admin-restaurants-template").innerHTML,
        registerEmployee: () => document.getElementById("register-employee-template").innerHTML,
        manageBookings: () => document.getElementById("bookings-manage").innerHTML,

    },
    component: {
        login: () => document.getElementById('login-component-template').innerHTML,
        register: () => document.getElementById('register-component-template').innerHTML,
        forgotPassword: () => document.getElementById('forgot-password-component-template').innerHTML,
        dummyProfileTemplate: () => document.getElementById('dummy-profile-template').innerHTML,
        restaurantCard: () => document.getElementById('restaurant-card-template').innerHTML,
        bookingCard: () => document.getElementById('booking-card-template').innerHTML,
        headerWithBrand: () => document.getElementById('header-with-brand-template').innerHTML,
        restaurantBookingCard: () => document.getElementById('restaurant-booking-card-template').innerHTML
    }
}

