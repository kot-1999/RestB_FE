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
        UIManager.showFormMessage('Please fill in all fields', 'error', '.register-form');
        return;
    }
    
    if (firstName.length < 2 || firstName.length > 255) {
        UIManager.showFormMessage('First name must be between 2 and 255 characters', 'error', '.register-form');
        return;
    }
    
    if (lastName.length < 2 || lastName.length > 255) {
        UIManager.showFormMessage('Last name must be between 2 and 255 characters', 'error', '.register-form');
        return;
    }
    
    if (password.length < 3) {
        UIManager.showFormMessage('Password must be at least 3 characters long', 'error', '.register-form');
        return;
    }
    
    if (!isValidEmail(email)) {
        UIManager.showFormMessage('Please enter a valid email address', 'error', '.register-form');
        return;
    }
    
    // Show loading state
    UIManager.setButtonLoading('.register-submit', 'Registering...');
    
    try {
        console.log('Attempting registration for:', { firstName, lastName, email, userType });
        
        // Prepare registration data
        const registerData = {
            firstName,
            lastName,
            email,
            password
        };
        
        // Use AuthService to handle registration
        const result = await AuthService.register(registerData, userType);
        
        if (result.success) {
            UIManager.showSuccess(result.message);
            
            // Redirect to login or dashboard after successful registration
            setTimeout(() => {
                if (userType === 'partner') {
                    window.location.href = '/views/pages/admin-dashboard.html';
                } else {
                    window.location.href = '/views/pages/customer-dashboard.html';
                }
            }, 2000);
        } else {
            UIManager.showFormMessage(result.message, 'error', '.register-form');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        UIManager.showError('Network error. Please check your connection and try again.');
    }
    
    UIManager.resetButton('.register-submit');
}

// These functions are now handled by UIManager
// Keeping isValidEmail for validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
