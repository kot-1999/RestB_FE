// Login page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Only run on login page
    if (!document.querySelector('.login-form')) return;
    
    const loginForm = document.querySelector('.login-form form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
});

function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    // Validation
    if (!email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    showLoading();
    
    // Here you would normally send to backend API
    setTimeout(() => {
        console.log('Login attempt:', { email, password });
        hideLoading();
        showSuccess('Login functionality would connect to backend API');
    }, 1000);
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    // Remove existing error messages
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #e74c3c; margin-top: 1rem; padding: 0.5rem; background: #fdf2f2; border-radius: 4px;';
    
    const form = document.querySelector('.login-form form');
    form.appendChild(errorDiv);
}

function showSuccess(message) {
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) existingSuccess.remove();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'color: #27ae60; margin-top: 1rem; padding: 0.5rem; background: #f0f9f4; border-radius: 4px;';
    
    const form = document.querySelector('.login-form form');
    form.appendChild(successDiv);
}

function showLoading() {
    const submitBtn = document.querySelector('.login-submit');
    submitBtn.textContent = 'Logging in...';
    submitBtn.disabled = true;
}

function hideLoading() {
    const submitBtn = document.querySelector('.login-submit');
    submitBtn.textContent = 'Login';
    submitBtn.disabled = false;
}
