# RestB Frontend Architecture Guide

## Overview

This refactored frontend architecture provides a clean, modular, and scalable structure for the RestB application. The system is built around centralized utilities that handle authentication, API requests, UI management, and role-based access control.

## Architecture Components

### 1. Storage Manager (`utils/storage.js`)
Centralized localStorage management with type safety and error handling.

**Key Features:**
- Safe storage and retrieval of data
- Authentication token management
- User data and role management
- Error handling for storage operations

**Usage Examples:**
```javascript
// Store authentication data
StorageManager.setAuthToken(token);
StorageManager.setUserData(userData, 'customer', 'superAdmin');

// Get user data
const user = StorageManager.getUserData();
const userType = StorageManager.getUserType();
const isAuthenticated = StorageManager.isAuthenticated();

// Clear authentication data
StorageManager.clearAuth();
```

### 2. UI Manager (`utils/ui.js`)
Centralized UI utilities for notifications, loading states, and form messages.

**Key Features:**
- Toast notifications (success, error, warning, info)
- Button loading states
- Loading overlays
- Form messages

**Usage Examples:**
```javascript
// Show notifications
UIManager.showSuccess('Login successful!');
UIManager.showError('Invalid credentials');
UIManager.showWarning('Session expiring soon');

// Manage button states
UIManager.setButtonLoading('.submit-btn', 'Loading...');
UIManager.resetButton('.submit-btn');

// Show form messages
UIManager.showFormMessage('Please fill all fields', 'error', '.form-container');
```

### 3. API Service (`utils/api.js`)
Centralized API request handling with authentication and error handling.

**Key Features:**
- Automatic token injection
- 401 error handling (auto-logout)
- Centralized error management
- Type-safe request methods

**Usage Examples:**
```javascript
// Authentication
await ApiService.postLogin(email, password, userType);
await ApiService.postRegister(userData, userType);

// User operations
await ApiService.getUser(userId);
await ApiService.updateUser(userId, userData);

// Bookings
await ApiService.getBookings();
await ApiService.postBooking(bookingData);
```

### 4. Authentication Service (`utils/auth.js`)
High-level authentication operations and session management.

**Key Features:**
- Login and registration handling
- Session validation
- Automatic role detection for partners
- User data management

**Usage Examples:**
```javascript
// Login
const result = await AuthService.login(email, password, 'customer');
if (result.success) {
    // User is logged in
}

// Registration
const result = await AuthService.register(userData, 'partner');

// Session management
const isValid = await AuthService.validateSession();
AuthService.logout();

// User checks
const isCustomer = AuthService.isCustomer();
const isSuperAdmin = AuthService.isSuperAdmin();
```

### 5. Access Control (`utils/access-control.js`)
Role-based access control system for permissions and UI visibility.

**Key Features:**
- Permission-based access control
- Automatic UI element hiding/showing
- Page access enforcement
- Role management

**Usage Examples:**
```javascript
// Check permissions
const canViewBookings = AccessControl.hasPermission('view_all_bookings');
const canAccessPage = AccessControl.canAccessPage('dashboard');

// Initialize access control (auto-hides elements with data attributes)
AccessControl.initialize();

// Manual element control
AccessControl.toggleElements('.admin-only', 'manage_system', true);
```

## HTML Data Attributes for Access Control

The system supports automatic UI control using HTML data attributes:

### Permission-based Control
```html
<!-- Only show if user has 'manage_system' permission -->
<button data-permission="manage_system">System Settings</button>

<!-- Only show to specific user types -->
<div data-user-type="partner">Admin Content</div>
<div data-user-type="customer,customer">Customer Content</div>

<!-- Only show to specific roles (partners only) -->
<div data-user-role="superAdmin">Super Admin Only</div>
<div data-user-role="superAdmin,adminStaff">All Admins</div>
```

### Page Authentication
```html
<!-- Page requires authentication -->
<body data-requires-auth>

<!-- Page accessible without authentication -->
<body>
```

### Action Controls
```html
<!-- Logout button -->
<button data-action="logout">Logout</button>

<!-- User menu toggle -->
<button data-toggle="user-menu" data-target="#userMenu">User Menu</button>
```

## User Types and Roles

### User Types
- **Customer**: Regular users who can book services
- **Partner**: Admin users with system access

### Partner Roles
- **Super Admin**: Full system access, can manage other admins
- **Admin Staff**: Limited admin access, can manage bookings and customers

### Permissions System

The system uses a granular permission system:

**Customer Permissions:**
- `view_own_bookings`
- `create_booking`
- `update_own_profile`

**Partner Permissions:**
- `view_all_bookings`
- `manage_bookings`
- `view_customers`
- `manage_customers`
- `view_admin_dashboard`
- `update_own_profile`

**Super Admin Additional Permissions:**
- `manage_admins`
- `view_system_settings`
- `export_data`
- `manage_system`

## Authentication Flow

### Login Flow
1. User submits login form
2. `AuthService.login()` handles the API call
3. Response structure is parsed (user vs admin)
4. For partners, additional API call gets role information
5. Data is stored in `StorageManager`
6. User is redirected based on user type

### Registration Flow
1. User submits registration form
2. `AuthService.register()` handles the API call
3. Response is processed and stored
4. Partners are automatically assigned `superAdmin` role
5. User is redirected to appropriate dashboard

### Session Validation
1. On page load, `AuthService.validateSession()` checks token validity
2. If token is invalid (401), user is logged out and redirected
3. Access control system initializes based on user permissions

## File Structure

```
src/assets/js/
├── config.js              # Backend configuration
├── main.js                # Global initialization and utilities
├── login.js               # Login page logic
├── register.js            # Registration page logic
└── utils/
    ├── storage.js         # LocalStorage management
    ├── ui.js              # UI utilities and notifications
    ├── api.js             # API service layer
    ├── auth.js            # Authentication service
    └── access-control.js  # Role-based access control
```

## Best Practices

### 1. Using the Utilities
- Always use `StorageManager` for localStorage operations
- Use `UIManager` for all user notifications
- Use `ApiService` for API calls (don't use fetch directly)
- Use `AuthService` for authentication operations

### 2. Error Handling
- The utilities handle errors automatically
- Use try-catch blocks for async operations
- Error messages are displayed automatically via `UIManager`

### 3. Page-Specific JavaScript
- Keep page-specific logic in separate files
- Use the utilities for common operations
- Initialize access control on authenticated pages

### 4. Access Control
- Use data attributes for automatic UI control
- Check permissions before performing sensitive operations
- Initialize access control on every page load

## Migration Guide

### From Old Code
1. Replace `localStorage.setItem/get` with `StorageManager.set/get`
2. Replace custom notification code with `UIManager.showNotification`
3. Replace fetch calls with `ApiService` methods
4. Replace authentication logic with `AuthService` methods

### Example Migration
```javascript
// Old way
localStorage.setItem('restb_token', token);
showError('Login failed');

// New way
StorageManager.setAuthToken(token);
UIManager.showError('Login failed');
```

## Extending the System

### Adding New Permissions
1. Add permission to `Permissions` object in `access-control.js`
2. Assign permission to appropriate user types/roles
3. Use `data-permission` attributes in HTML

### Adding New API Endpoints
1. Add method to `ApiService` class
2. Handle authentication and error cases
3. Use the method from page-specific JavaScript

### Adding New User Roles
1. Add role to `UserRoles` object
2. Update permission assignments
3. Handle role-specific logic in `AuthService`

This architecture provides a solid foundation for scaling the RestB frontend while maintaining clean, maintainable code.
