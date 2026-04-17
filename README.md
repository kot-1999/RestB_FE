RestB Frontend

Restaurant booking app

Content
About RestB Frontend
How to start
Prerequisites
Run application
Useful links
Project Structure
Frontend Features
Pages Overview
Gallery
Architecture
Team
License
About RestB Frontend

RestB Frontend is the client-side application for the RestBoo restaurant booking platform. It provides a structured and scalable user interface for customers, administrators, and staff to interact with the system.

The frontend is designed to work seamlessly with the RestBoo backend API, enabling real-time booking management, restaurant discovery, and administrative control.

The application focuses on delivering a clean, responsive, and intuitive user experience while maintaining a modular and maintainable codebase. It separates concerns between templates, logic, and API communication, ensuring scalability as the platform evolves.

The frontend supports:

Restaurant browsing and filtering for users
Real-time booking creation and management
Administrative dashboards for restaurant and staff management
Brand and restaurant configuration tools
Role-based UI rendering for User, Admin, and Staff

Overall, the frontend complements the backend by providing a modern interface that simplifies complex booking workflows and operational tasks.

How to start
Prerequisites

Ensure the following are installed on your system:

Node.js (v18 or higher recommended)
npm (comes with Node.js)
Run application
1. Clone the repository
   git clone https://github.com/<your-username>/RestB_FE.git
2. Enter the project directory
   cd RestB_FE
3. Install dependencies
   npm install
4. Run the development environment
   npm run devmon

The application will be available at:

http://localhost:3055

📝 The frontend connects to the backend API (default: http://localhost:3000). Ensure the backend is running.

Useful links
http://localhost:3055
→ Frontend application
http://localhost:3000
→ Backend API
http://localhost:3000/api/docs
→ Swagger API documentation
Project Structure
RestB_FE/
│
├── src/
│   ├── views/
│   │   ├── pages/               # Page templates
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
Frontend Features
Template System
Uses Pug for structured templating
Uses Mustache for dynamic rendering
Clear separation between structure and data
API Layer
Centralised API handling via ApiRequest.js
Handles authentication tokens and error management
Supports both B2C and B2B endpoints
Component-Based UI

Reusable components including:

Restaurant cards
Booking cards
Admin restaurant editor
Brand editor
State Handling
Lightweight state via DOM + LocalStorage
No heavy frontend framework required
File Uploads
Supports image uploads via presigned URLs
Integrated with backend S3-compatible storage
Role-Based UI
User: booking + browsing
Admin: full management access
Staff: limited booking management
Pages Overview
AUTH

/auth/login
User, Admin, Staff login

/auth/register
User and Admin registration

/auth/forgotPassword
Password reset flow

USER

/restaurants

Restaurant list
Search and filtering

/restaurants/:id

Restaurant details
Booking form
Gallery and reviews
USER PROFILE

/profile

User settings

/profile/bookings

Booking history
Status tracking
Cancel / update bookings
ADMIN / STAFF DASHBOARD

/admin

Dashboard overview
BRAND MANAGEMENT

/admin/brand

Update brand name
Upload logo
RESTAURANT MANAGEMENT

/admin/restaurants

Create / edit / delete restaurants
Manage employees
Upload images
BOOKINGS MANAGEMENT

/admin/bookings

Manage bookings
Accept / reject
Modify booking times
Gallery

📁 Place screenshots inside: /docs/screenshots/

Homepage & Search

Filtered Results

Restaurant Details

Booking Flow

Admin – Restaurant Management

Admin – Brand Editor

Booking Management

Architecture
![mermaid-diagram.png](../OneDrive/Desktop/q%20movies/mermaid-diagram.png)

Team

Oleksandr Kashytskyi — sashakashytskyy@gmail.com

Idea creator, backend developer, system architect, database designer

Stephen Lyne — slyne234@gmail.com

Frontend developer, UI/UX designer

License

This project is licensed under the Apache-2.0 License.