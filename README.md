# RestB_FE
Restaurant booking app


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

## Page Details

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
