export const Template =  {
    page: {
        auth: () => document.getElementById('auth-template').innerHTML,       // select the template
        profile: () => document.getElementById('profile-template').innerHTML,          // select the template
    },
    component: {
        login: () => document.getElementById('login-component-template').innerHTML,       // select the template
        register: () => document.getElementById('register-component-template').innerHTML,       // select the template
        forgotPassword: () => document.getElementById('forgot-password-component-template').innerHTML,       // select the template

    }
}
