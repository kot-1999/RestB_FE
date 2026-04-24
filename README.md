## How to start

### Prerequisites

Ensure the following are installed:

- Node.js (v18+ recommended)
- npm

---

### Run application

1. Clone the repository:

```bash
git clone https://github.com/<your-username>/RestB_FE.git
```
https://github.com/kot-1999/RestB_FE/blob/main/README.md
2. Enter the project directory:

```bash
cd RestB_FE
```

3. Install dependencies:

```bash
npm install
```

4. Run development server:

```bash
npm run dev
```

The application will be available at:

```text
http://localhost:3055
```

> The frontend connects to the backend API (default: http://localhost:3000). Make sure the backend is running.

---

## Useful links

- http://localhost:3055 → Frontend
- http://localhost:3000 → Backend API
- http://localhost:3000/api/docs → Swagger docs

---

## Project Structure

```text
RestB_FE/
│
├── src/
│   ├── views/
│   │   ├── pages/               # Page templates (Pug)
│   │   └── components/          # Reusable UI components
│   │
│   ├── js/
│   │   ├── pages/               # Page logic
│   │   ├── components/          # UI logic
│   │   └── utils/               # API layer, helpers
│   │
│   ├── css/                     # Global styles
│   └── assets/                  # Images and static files
│
├── dist/                        # Compiled output (deploy this)
├── package.json
├── package-lock.json
├── README.md
```

---

## Frontend Features

### Template System

- Pug for templating
- Mustache for rendering dynamic data
- Clean separation of structure and data

### API Layer

- Centralised API handling (`ApiRequest.js`)
- Handles authentication tokens and errors
- Supports B2C and B2B endpoints

### Component-Based UI

Reusable components:

- Restaurant cards
- Booking cards
- Admin restaurant editor
- Brand editor

### State Handling

- Lightweight state via DOM + LocalStorage
- No heavy framework required

### File Uploads

- Uses presigned URLs
- S3-compatible backend

### Role-Based UI

- User: browsing + booking
- Admin: full control
- Staff: limited booking access

---

## Pages Overview

### AUTH

#### `/auth/login`

- Login for User, Admin, Staff

#### `/auth/register`

- User and Admin registration

#### `/auth/forgotPassword`

- Password reset

---

### USER

#### `/restaurants`

- Restaurant list
- Search and filtering

#### `/restaurants/:id`

- Restaurant details
- Booking form
- Gallery and reviews

---

### USER PROFILE

#### `/profile`

- User settings

#### `/profile/bookings`

- Booking history
- Status tracking
- Cancel / update bookings

---

### ADMIN / STAFF DASHBOARD

#### `/admin`

- Dashboard overview

---

### BRAND MANAGEMENT

#### `/admin/brand`

- Update brand name
- Upload logo

---

### RESTAURANT MANAGEMENT

#### `/admin/restaurants`

- Create / edit / delete restaurants
- Manage employees
- Upload images

---

### BOOKINGS MANAGEMENT

#### `/admin/bookings`

- Manage bookings
- Accept / reject
- Modify booking times

---

## Architecture

![Architecture Diagram](./docs/images/architecture.png)

---

## Gallery

Place screenshots in:

```text
/docs/screenshots/
```

Suggested screenshots:

- Homepage
- Search results
- Restaurant details
- Booking flow
- Admin dashboard
- Restaurant editor
- Brand editor

---

## Team

**Oleksandr Kashytskyi**  
[sashakashytskyy@gmail.com](mailto:sashakashytskyy@gmail.com)  
Backend developer, system architect

**Stephen Lyne**  
[slyne234@gmail.com](mailto:slyne234@gmail.com)  
Frontend developer, UI/UX designer

---

## License

This project is licensed under the Apache-2.0 License.
