// Configuration file for RestB Frontend
// Simple backend selection system

// Backend configurations
const backends = {
    github: {
        url: 'https://automatic-adventure-5p6rj7465jwh5rv-3000.app.github.dev',
        timeout: 15000
    },
    local: {
        url: 'http://localhost:3000',
        timeout: 10000
    },
    production: {
        url: 'https://api.restb.com', // TODO: Replace with actual production URL
        timeout: 20000
    }
};

// Main configuration - just change this value!
const config = {
    // CHANGE THIS to switch backends: 'github', 'local', or 'production'
    usebackend: 'local', // Use GitHub Codespace backend
    
    // Auto-populated based on usebackend
    get current() {
        return backends[this.usebackend] || backends.github;
    },
    
    // Get base URL
    get baseUrl() {
        return this.current.url;
    },
    
    // Get timeout
    get timeout() {
        return this.current.timeout;
    }
};

// Export for use in other files
window.RestBConfig = {
    // Get current backend config
    getConfig: () => config,
    
    // Switch backend
    setBackend: (backendName) => {
        if (backends[backendName]) {
            config.usebackend = backendName;
            localStorage.setItem('restb_backend', backendName);
            console.log(`Backend switched to: ${backendName} (${config.baseUrl})`);
            return true;
        }
        console.error(`Backend '${backendName}' not found. Available: ${Object.keys(backends).join(', ')}`);
        return false;
    },
    
    // Get current backend name
    getBackend: () => config.usebackend,
    
    // Get all available backends
    getAvailableBackends: () => Object.keys(backends),
    
    // Quick switch function for console use
    switchTo: {
        github: () => window.RestBConfig.setBackend('github'),
        local: () => window.RestBConfig.setBackend('local'),
        production: () => window.RestBConfig.setBackend('production')
    }
};

// Initialize from localStorage or use default
const savedBackend = localStorage.getItem('restb_backend');
if (savedBackend && backends[savedBackend]) {
    config.usebackend = savedBackend;
}

// For debugging - log current config on load
console.log('RestB Config loaded. Current backend:', config.usebackend);
console.log('Base URL:', config.baseUrl);
