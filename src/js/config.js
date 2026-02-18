export const Template =  {
    page: {
        auth: () => document.getElementById('auth-template').innerHTML,
        profile: () => document.getElementById('profile-template').innerHTML,
        home: () => document.getElementById('home-template').innerHTML,
    },
    component: {
        login: () => document.getElementById('login-component-template').innerHTML,
        register: () => document.getElementById('register-component-template').innerHTML,
        forgotPassword: () => document.getElementById('forgot-password-component-template').innerHTML,
        dummyProfileTemplate: () => document.getElementById('dummy-profile-template').innerHTML,
        restaurantCard: () => document.getElementById('restaurant-card-template').innerHTML,
    }
}
