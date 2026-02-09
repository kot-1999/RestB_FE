// Register page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Register page loaded');
    
    // Only run on register page
    if (!document.querySelector('.register-form')) return;
    
    // Initialize user type tabs
    initializeUserTypeTabs();
    
    // Initialize form submission
    const registerForm = document.querySelector('.register-form form');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
});

// Initialize user type selection tabs
function initializeUserTypeTabs() {
    const tabs = document.querySelectorAll('.user-type-tab');
    const userTypeInput = document.getElementById('userType');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Update hidden input value
            const userType = this.getAttribute('data-type');
            userTypeInput.value = userType;
            
            // Update form title
            const formTitle = document.querySelector('.register-form h2');
            if (userType === 'partner') {
                formTitle.textContent = 'Partner Registration - RestB';
            } else {
                formTitle.textContent = 'Customer Registration - RestB';
            }
            
            console.log('User type selected:', userType);
        });
    });
}

async function handleRegister(e) {
    e.preventDefault();
    
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
    // Validation
    if (!firstName || !lastName || !email || !password) {
        showError('Please fill in all fields');
        return;
    }
    
    if (firstName.length < 2 || firstName.length > 255) {
        showError('First name must be between 2 and 255 characters');
        return;
    }
    
    if (lastName.length < 2 || lastName.length > 255) {
        showError('Last name must be between 2 and 255 characters');
        return;
    }
    
    if (password.length < 3) {
        showError('Password must be at least 3 characters long');
        return;
    }
    
    if (!isValidEmail(email)) {
        showError('Please enter a valid email address');
        return;
    }
    
    // Show loading state
    showLoading();
    
    try {
        // Get API configuration
        const config = window.RestBConfig.getConfig();
        
        // Determine API endpoint based on user type
        let apiUrl;
        if (userType === 'partner') {
            // B2B endpoint for partners
            apiUrl = `${config.baseUrl}/api/b2b/v1/authorization/register`;
        } else {
            // B2C endpoint for customers
            apiUrl = `${config.baseUrl}/api/b2c/v1/authorization/register`;
        }
        
        console.log('Attempting registration for:', { firstName, lastName, email, userType, apiUrl });
        console.log('Current backend:', window.RestBConfig.getBackend());
        
        // Prepare registration data according to backend requirements
        const registerData = {
            firstName: firstName,
            lastName: lastName,
            email: email,
            password: password
        };
        
        console.log('Registration payload:', registerData);
        
        // Send registration request to backend
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(registerData)
        });
        
        let result;
        try {
            result = await response.json();
        } catch (e) {
            // If response is not JSON, get text
            result = { error: await response.text() };
        }
        
        console.log('API Response:', { status: response.status, result });
        
        if (response.ok) {
            // Registration successful
            console.log('Registration successful:', result);
            
            showSuccess('Registration successful! You can now login.');
            
            // DISABLED: Auto redirect to login page
            // setTimeout(() => {
            //     window.location.href = '/views/pages/login.html';
            // }, 2000);
            
        } else {
            // Registration failed - check if it's an endpoint not found error
            if (response.status === 404) {
                showError(`Registration endpoint not found: ${apiUrl}. Backend may not be implemented yet.`);
            } else {
                showError(result.message || result.error || 'Registration failed. Please try again.');
            }
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        hideLoading();
        showError('Network error. Please check your connection and try again.');
    }
    
    hideLoading();
}

function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
    // Remove existing messages
    removeMessages();
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    errorDiv.textContent = message;
    errorDiv.style.cssText = 'color: #e74c3c; margin-top: 1rem; padding: 0.5rem; background: #fdf2f2; border-radius: 4px; border: 1px solid #f5c6cb;';
    
    const form = document.querySelector('.register-form form');
    form.appendChild(errorDiv);
}

function showSuccess(message) {
    // Remove existing messages
    removeMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'color: #27ae60; margin-top: 1rem; padding: 0.5rem; background: #f0f9f4; border-radius: 4px; border: 1px solid #c3e6cb;';
    
    const form = document.querySelector('.register-form form');
    form.appendChild(successDiv);
}

function removeMessages() {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) existingSuccess.remove();
}

function showLoading() {
    const submitBtn = document.querySelector('.register-submit');
    submitBtn.textContent = 'Registering...';
    submitBtn.disabled = true;
}

function hideLoading() {
    const submitBtn = document.querySelector('.register-submit');
    submitBtn.textContent = 'Register';
    submitBtn.disabled = false;
}
