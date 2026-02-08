# RestB Frontend

A modern frontend application built with Pug templating, compiled to static HTML for deployment.

## Architecture

This frontend is designed to be completely independent from the backend, communicating only through REST APIs.

### Build Process

- **Build Time**: Node.js compiles Pug templates into static HTML
- **Runtime**: Browser serves static HTML, CSS, and JavaScript
- **Communication**: JavaScript communicates with backend via HTTP APIs (fetch/axios)

### Directory Structure

```
RestB_FE/
├── src/
│   ├── views/
│   │   ├── layouts/          # Base layouts
│   │   │   └── base.pug
│   │   ├── pages/            # Individual pages
│   │   │   ├── index.pug
│   │   │   └── about.pug
│   │   └── partials/         # Reusable components
│   │       ├── header.pug
│   │       └── footer.pug
│   └── assets/
│       ├── css/
│       │   └── style.css
│       └── js/
│           └── main.js
├── dist/                     # Built static files (deployable)
├── package.json
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (for build process only)
- npm

### Installation

```bash
npm install
```

### Build Commands

```bash
# Build the static site
npm run build

# Clean the dist directory
npm run clean

# Compile Pug templates only
npm run compile-pug

# Copy assets only
npm run copy-assets

# Build and serve locally for development
npm run dev

# Build with watch mode for development
npm run build:watch
```

### Development

1. Make changes to Pug templates in `src/views/`
2. Update CSS in `src/assets/css/`
3. Update JavaScript in `src/assets/js/`
4. Run `npm run build` to compile changes
5. Or use `npm run dev` for automatic rebuilding and serving

## Deployment

Only the `dist/` folder needs to be deployed. This contains:
- Static HTML files (compiled from Pug)
- CSS files
- JavaScript files

The `dist/` folder can be deployed to any static hosting service:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront
- etc.

## API Communication

The frontend communicates with the backend through REST APIs. Configure the backend URL in `src/assets/js/main.js`:

```javascript
const API = {
    baseURL: 'http://localhost:3000/api', // Update to your backend URL
    // ... API methods
};
```

## Key Concepts

### Node.js Usage
- **Required**: For build process (Pug compilation)
- **Not Required**: For runtime (browser serves static files)

### Express Usage
- **Not Used**: Frontend is completely static
- **Backend Only**: Express runs in separate RestB_BE repository

### Pug Compilation
- Templates are compiled to HTML during build
- No server-side rendering
- Static HTML is served directly to browsers

## Features

- ✅ Pug templating with layouts and partials
- ✅ Responsive CSS design
- ✅ API integration utilities
- ✅ Build process with watch mode
- ✅ Static site generation
- ✅ Separate frontend/backend architecture

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- No server-side requirements
- Static file serving only

---

# Restaurant Booking App Pages

## Pages overview

`/auth/login`             User, Admin, Staff

`/auth/register`          User, Admin, Staff

`/auth/forgotPassword`


`/restaurants`            User (browse all restaurant locations)

`/restaurants/:id`        User (view & book a specific restaurant)

`/brands/:id`             User (view brand info + all its restaurants)

`/profile`                User (profile, settings)

`/profile/bookings`       User (own bookings)

`/admin`                  Admin/Staff (dashboard)

`/admin/brand`            Admin/Staff (manage brand info)

`/admin/restaurants`      Admin (manage all restaurants under the brand)

`/admin/restaurants/:id`  Admin (restaurant settings, booking rules, employees)

`/admin/bookings`         Admin/Staff (all bookings across brand)

# Page Details

## AUTH

### `/auth/login`  
**Roles:** User, Admin, Staff  
**Features:**
- Email + password login
- Role-based redirect

### `/auth/register`  
**Roles:** User, Admin  
**Features:**
- User registration
- Admin (brand owner) registration

### `/auth/forgotPassword`  
**Features:**
- Password reset flow

---

## USER (PUBLIC)

### `/restaurants`  
**Role:** User  
**Features:**
- Restaurants (locations) list
- Search
- Filtering (rating, availability)
- Sorting
- Average rating & reviews count

### `/restaurants/:id`  
**Role:** User  
**Features:**
- Restaurant details (address)
- Uses brand logo
- Restaurant gallery
- Availability calendar
- Booking form
- Booking rules display
- Reviews & ratings

### `/brands/:id`  
**Role:** User  
**Features:**
- Brand information
- Brand logo & description
- Brand gallery
- List of brand restaurants

---

## USER PROFILE

### `/profile`  
**Role:** User  
**Features:**
- User settings
- Contact information
- Password change

### `/profile/bookings`  
**Role:** User  
**Features:**
- Booking list
- Booking status tracking
- Cancel booking
- Approve / reject time change
- Leave review (after completed booking)

---

## ADMIN / STAFF DASHBOARD

### `/admin`  
**Roles:** Admin, Staff  
**Features:**
- Dashboard overview
- Pending bookings
- Quick actions

---

## BRAND MANAGEMENT

### `/admin/brand`  
**Roles:** Admin, Staff  
**Features:**
- Brand details
- Brand logo management
- Brand gallery
- Brand settings

---

## RESTAURANT (LOCATION) MANAGEMENT

### `/admin/restaurants`  
**Role:** Admin  
**Features:**
- List of restaurants under brand
- Create / edit / delete restaurant

### `/admin/restaurants/:id`  
**Role:** Admin  
**Features:**
- Restaurant details (address, photos)
- Booking rules:
  - Auto-approval ON/OFF
  - Max auto-approved bookings
- Opening hours
- Employee assignment

---

## BOOKINGS

### `/admin/bookings`  
**Roles:** Admin, Staff  
**Features:**
- Bookings list
- Filter by restaurant
- Accept / reject bookings
- Propose booking time change:
  - New date/time
  - Mandatory reason
- **Staff access limited to assigned restaurants only**

---

## ROLE SUMMARY

### User
- Browse restaurants
- Create bookings
- Manage own bookings
- Leave reviews

### Admin (Brand Owner)
- Manage brand
- Manage restaurants
- Manage staff
- Manage all bookings

### Staff
- Invited by Admin
- Manage bookings only
- Limited to assigned restaurants
