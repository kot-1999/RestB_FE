# RestB Frontend API Endpoints

## Simple Backend Configuration

The frontend now uses a **super simple** configuration system. Just change **one line** to switch backends:

### 🎯 **How to Switch Backends**

**Option 1: Edit Config File**
```javascript
// In src/assets/js/config.js, line 23:
const config = {
    usebackend: 'github', // CHANGE THIS: 'github', 'local', or 'production'
    // ...
};
```

**Option 2: Use Console (Runtime)**
```javascript
// Switch to local backend
window.RestBConfig.switchTo.local();

// Switch to GitHub backend  
window.RestBConfig.switchTo.github();

// Switch to production backend
window.RestBConfig.switchTo.production();
```

### 📍 **Available Backends**

| Backend | URL | When to Use |
|---------|-----|-------------|
| `github` | `https://automatic-adventure-5p6rj7465jwh5rv-3000.app.github.dev` | GitHub Codespace development |
| `local` | `http://localhost:3000` | Local backend development |
| `production` | `https://api.restb.com` | Production environment |

## User Type Management

The frontend manages two distinct user types with separate API endpoints:

### 1. Customer Users (B2C)
- **User Type**: `user` (stored in hidden input field)
- **Login Endpoint**: `{baseurl}/b2c/v1/authorization/login`
- **Register Endpoint**: `{baseurl}/b2c/v1/authorization/register`

### 2. Partner Users (B2B) 
- **User Type**: `partner` (stored in hidden input field)
- **Login Endpoint**: `{baseurl}/b2b/v1/authorization/login`
- **Register Endpoint**: `{baseurl}/b2b/v1/authorization/register`

## API Request Format

### Login (Both B2C & B2B)
```http
POST {endpoint}
Content-Type: application/json

{
  "email": "string (required)",
  "password": "string (required)"
}
```

### Register (Both B2C & B2B)
```http
POST {endpoint}
Content-Type: application/json

{
  "firstName": "string (min:2, max:255, required)",
  "lastName": "string (min:2, max:255, required)", 
  "email": "string (email, required)",
  "password": "string (min:3, required)"
}
```

## Frontend Implementation

### User Type Selection
- Tab-based UI in login form
- Hidden input field stores selected type (`user` or `partner`)
- JavaScript dynamically determines API endpoint

### API Flow
1. User selects Customer or Partner tab
2. Form submission captures user type
3. JavaScript determines correct endpoint:
   - Partner → `{baseurl}/b2b/v1/authorization/login`
   - Customer → `{baseurl}/b2c/v1/authorization/login`
4. Request sent with proper JSON payload
5. Response handling and token storage

### Configuration Persistence
- Backend choice is saved to localStorage
- Automatically loads last used backend on page refresh
- Console logging shows current backend and URLs

## Quick Start

1. **Build frontend**: `npm run build`
2. **Choose backend**: Edit `usebackend` in config.js or use console
3. **Run locally**: `npm run dev`
4. **Test login**: Open browser, check console for API calls

## Current Status
- ✅ **Super simple backend switching** - just change one line!
- ✅ **B2B/B2C endpoint routing** based on user type
- ✅ **Proper request payloads** for both user types
- ✅ **Runtime backend switching** via console commands
- ⏳ **Backend endpoints** need to be implemented

## Debugging

Open browser console to see:
- Current backend: `window.RestBConfig.getBackend()`
- Available backends: `window.RestBConfig.getAvailableBackends()`
- API request details during login attempts
