// Global JavaScript for RestB Frontend
document.addEventListener('DOMContentLoaded', function() {
    console.log('RestB Frontend loaded');
    
    // Global functionality that runs on all pages
    initializeNavigation();
    initializeGlobalEvents();
});

function initializeNavigation() {
    // Add smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
}

function initializeGlobalEvents() {
    // Add any global event listeners here
    console.log('Global events initialized');
}

// Utility functions that can be used across pages
const Utils = {
    // API helper functions
    async apiCall(endpoint, options = {}) {
        const defaultOptions = {
            headers: {
                'Content-Type': 'application/json',
            }
        };
        
        const finalOptions = { ...defaultOptions, ...options };
        
        try {
            const response = await fetch(`/api${endpoint}`, finalOptions);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.json();
        } catch (error) {
            console.error('API call failed:', error);
            throw error;
        }
    },
    
    // Form validation helper
    validateEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },
    
    // Show notification helper
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem;
            background: ${type === 'error' ? '#e74c3c' : type === 'success' ? '#27ae60' : '#3498db'};
            color: white;
            border-radius: 4px;
            z-index: 1000;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }
};

function getRole() {
  // pick ONE key and stick to it
  // Example: localStorage.setItem("restb_user", JSON.stringify({ role: "admin" }))
  const raw = localStorage.getItem("restb_user");
  if (!raw) return "guest";

  try {
    const user = JSON.parse(raw);
    return user?.role || "guest";
  } catch {
    return "guest";
  }
}

function renderNavbar() {
  const role = getRole();

  // map backend roles -> your nav names
  const nav =
    role === "admin" ? "admin" :
    role === "staff" || role === "employee" ? "staff" :
    role === "user" || role === "customer" ? "user" :
    "guest";

  document.querySelectorAll(".nav-shell").forEach(el => {
    el.classList.toggle("is-active", el.dataset.nav === nav);
  });

  console.log("[NAV]", { role, nav });
}

document.addEventListener("DOMContentLoaded", () => {
  renderNavbar();
});

document.addEventListener("DOMContentLoaded", () => {
  // Example: get role from localStorage (change this to your real source later)
  const role = localStorage.getItem("restb_role") || "guest";

  document.querySelectorAll(".nav-shell").forEach(el => el.classList.remove("is-active"));

  const active = document.querySelector(`.nav-shell[data-nav="${role}"]`);
  if (active) active.classList.add("is-active");
  else document.querySelector(`.nav-shell[data-nav="guest"]`)?.classList.add("is-active");
});
