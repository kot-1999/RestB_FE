// Configuration file for RestB Frontend
// Contains different environment settings for API endpoints and database connections

const configs = {
    // Local development environment
    local: {
        apiUrl: 'http://localhost:3000',
        apiVersion: 'v1',
        timeout: 10000
    },
    
    // GitHub workspace/backend environment  
    github: {
        apiUrl: 'https://your-github-backend-url.com', // TODO: Replace with actual GitHub backend URL
        apiVersion: 'v1',
        timeout: 15000
    },
    
    // Production environment
    production: {
        apiUrl: 'https://api.restb.com', // TODO: Replace with actual production URL
        apiVersion: 'v1', 
        timeout: 20000
    }
};

// Get current environment from localStorage or default to local
function getCurrentEnvironment() {
    return localStorage.getItem('restb_env') || 'local';
}

// Set current environment
function setEnvironment(env) {
    if (configs[env]) {
        localStorage.setItem('restb_env', env);
        return true;
    }
    return false;
}

// Get current config
function getConfig() {
    const env = getCurrentEnvironment();
    return configs[env];
}

// Export for use in other files
window.RestBConfig = {
    configs,
    getCurrentEnvironment,
    setEnvironment,
    getConfig
};

// For debugging - log current config on load
console.log('RestB Config loaded. Current environment:', getCurrentEnvironment());
console.log('Current config:', getConfig());
