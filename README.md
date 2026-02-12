# RestB Frontend

A simple website built with Pug templates that compiles to HTML.

## How It Works

- **Build**: Node.js converts Pug files to HTML
- **Run**: Browser shows the HTML files
- **Backend**: Separate - talks through APIs

## Files

```
RestB_FE/
├── src/
│   ├── views/           # Pug templates
│   │   ├── layouts/     # Base layouts
│   │   │   └── base.pug
│   │   ├── pages/       # Page templates
│   │   │   ├── index.pug
│   │   │   └── login.pug
│   │   └── partials/    # Reusable parts
│   │       ├── header.pug
│   │       └── footer.pug
│   └── assets/          # CSS and JavaScript
│       ├── css/
│       │   └── style.css
│       └── js/
│           ├── main.js
│           └── login.js
├── dist/                # Built website (deploy this)
├── package.json         # Project settings
├── package-lock.json    # Dependency lock
├── instructions.txt     # Setup guide
└── README.md           # This file
```

## Quick Start

### 1. Install
```bash
npm install
```

### 2. Run Development Server
```bash
npm run devmon
```
This builds your site and starts it at `http://localhost:3000`

### 3. Make Changes
- Edit files in `src/`
- Changes auto-rebuild and refresh

## Commands

```bash
npm run build        # Build the website
npm run dev          # Build and serve
npm run devmon       # Build, serve, and watch changes
npm run clean        # Delete build folder
```

## How to Add a New Page

1. Copy `src/views/pages/index.pug` to `src/views/pages/yourpage.pug`
2. Edit the new file
3. Run `npm run build`
4. Visit `http://localhost:3000/pages/yourpage.html`

## Deploy

Upload the `dist/` folder to any web host or simply open `dist/index.html`.

That's it!


## Pages overview

### IMPLEMENTED (Watch api docs)
`/api/ b2c | b2b /auth/login`             USER, ADMIN, EMPLOYEE
`/api/ b2c | b2b /auth/register`          USER, ADMIN, EMPLOYEE
`/api/ b2c | b2b /auth/forgotPassword`    USER, ADMIN, EMPLOYEE
`/api/ b2c | b2b /auth/resetPassword`     USER, ADMIN, EMPLOYEE

Fir this two UPDATE must be added, and phone number field must be created
`/api/b2c/user`                           USER, ADMIN, EMPLOYEE (GET, DELETE)
`/api/b2b/admin`                          USER, ADMIN, EMPLOYEE (GET, DELETE)

### COMMON
`api/b2c/bookings/:id`
- UPDATE (USER, ADMIN, EMPLOYEE) Update booking status

### B2C

`/api/b2c/restaurants/`
- GET (PUBLIC) List of restaurants (restaurants, addresses, brands, booking_daily_summary)

`api/b2c/restaurants/:id`
- GET (PUBLIC) Restaurant details (restaurants, addresses, brands, booking_daily_summary)

`api/b2c/bookings`
- GET (USER) List of user's bookings (bookings, restaurants, brands)
- POST (USER) Create new booking

### B2B

`/api/b2b/auth/employee`
- POST (ADMIN) Send invitation to a new admin
- DELETE (ADMIN) Delete employee admin (admins)

`/api/b2b/auth/employee/register`
- POST (EMPLOYEE) Register new employee (admins)

`/api/b2b/bookings`
- GET (ADMIN, EMPLOYEE) List of restaurants with short stats about bookings (restaurants, addresses, brands, bookings_daily_summary)

`/api/b2b/bookings/:id`
- GET (ADMIN, EMPLOYEE) Details of restaurant bookings (restaurants, addresses, brands, bookings)
- POST (ADMIN, EMPLOYEE) CAN BE ADDED IN FUTURE Add new bookings manually
- DELETE (ADMIN, EMPLOYEE) CAN BE ADDED IN FUTURE Add new bookings manually

`/api/b2b/restaurants`
- GET (ADMIN, EMPLOYEE) List of restaurant details with brand, employees (restaurants, addresses, brands, restaurant_staff)

`/api/b2b/brands/:id`
- UPDATE Update brand name / logo


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