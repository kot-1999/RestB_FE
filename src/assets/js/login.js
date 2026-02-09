// Login page specific JavaScript
document.addEventListener('DOMContentLoaded', function() {
    console.log('Login page loaded');
    
    // Only run on login page
    if (!document.querySelector('.login-form')) return;
    
    // Initialize user type tabs
    initializeUserTypeTabs();
    
    // Initialize form submission
    const loginForm = document.querySelector('.login-form form');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
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
            const formTitle = document.querySelector('.login-form h2');
            if (userType === 'partner') {
                formTitle.textContent = 'Partner Login - RestB';
            } else {
                formTitle.textContent = 'Customer Login - RestB';
            }
            
            console.log('User type selected:', userType);
        });
    });
}

async function handleLogin(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const userType = document.getElementById('userType').value;
    
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
    
    try {
        // Get API configuration
        const config = window.RestBConfig.getConfig();
        
        // Determine API endpoint based on user type
        let apiUrl;
        if (userType === 'partner') {
            // B2B endpoint for partners
            apiUrl = `${config.baseUrl}/b2b/v1/authorization/login`;
        } else {
            // B2C endpoint for customers
            apiUrl = `${config.baseUrl}/b2c/v1/authorization/login`;
        }
        
        console.log('Attempting login for:', { email, userType, apiUrl });
        console.log('Current backend:', window.RestBConfig.getBackend());
        
        // Prepare login data according to backend requirements
        const loginData = {
            email: email,
            password: password
        };
        
        console.log('Login payload:', loginData);
        
        // Send login request to backend
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(loginData)
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
            // Login successful
            console.log('Login successful:', result);
            
            // Store auth token (if provided)
            if (result.token) {
                localStorage.setItem('restb_token', result.token);
            }
            
            // Store user info
            if (result.user) {
                localStorage.setItem('restb_user', JSON.stringify(result.user));
            }
            
            showSuccess('Login successful! Redirecting...');
            
            // Redirect based on user type
            setTimeout(() => {
                if (userType === 'partner') {
                    // Redirect to partner dashboard
                    window.location.href = '/pages/admin.html';
                } else {
                    // Redirect to customer profile or home
                    window.location.href = '/index.html';
                }
            }, 1500);
            
        } else {
            // Login failed - check if it's an endpoint not found error
            if (response.status === 404) {
                showError(`Login endpoint not found: ${apiUrl}. Backend may not be implemented yet.`);
            } else {
                showError(result.message || result.error || 'Login failed. Please check your credentials.');
            }
        }
        
    } catch (error) {
        console.error('Login error:', error);
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
    
    const form = document.querySelector('.login-form form');
    form.appendChild(errorDiv);
}

function showSuccess(message) {
    // Remove existing messages
    removeMessages();
    
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.textContent = message;
    successDiv.style.cssText = 'color: #27ae60; margin-top: 1rem; padding: 0.5rem; background: #f0f9f4; border-radius: 4px; border: 1px solid #c3e6cb;';
    
    const form = document.querySelector('.login-form form');
    form.appendChild(successDiv);
}

function removeMessages() {
    const existingError = document.querySelector('.error-message');
    if (existingError) existingError.remove();
    
    const existingSuccess = document.querySelector('.success-message');
    if (existingSuccess) existingSuccess.remove();
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
