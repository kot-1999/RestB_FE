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
        UIManager.showFormMessage('Please fill in all fields', 'error', '.login-form');
        return;
    }
    
    if (!isValidEmail(email)) {
        UIManager.showFormMessage('Please enter a valid email address', 'error', '.login-form');
        return;
    }
    
    // Show loading state
    UIManager.setButtonLoading('.login-submit', 'Logging in...');
    
    try {
        console.log('Attempting login for:', { email, userType });
        
        // Use AuthService to handle login
        const result = await AuthService.login(email, password, userType);
        
        if (result.success) {
            UIManager.showSuccess(result.message);
            
            // Redirect based on user type
            setTimeout(() => {
                if (userType === 'partner') {
                    window.location.href = '/pages/admin.html';
                } else {
                    window.location.href = '/index.html';
                }
            }, 1500);
        } else {
            UIManager.showFormMessage(result.message, 'error', '.login-form');
        }
        
    } catch (error) {
        console.error('Login error:', error);
        UIManager.showError('Network error. Please check your connection and try again.');
    }
    
    UIManager.resetButton('.login-submit');
}

// These functions are now handled by UIManager
// Keeping isValidEmail for validation
function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
