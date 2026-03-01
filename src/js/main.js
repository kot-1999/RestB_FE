// File: /js/main.js
import "./nav.js";

console.log("RestB main.js loaded");

document.addEventListener("DOMContentLoaded", initRouter);
window.addEventListener("hashchange", initRouter);

async function initRouter() {
  const content = document.getElementById("content");
  if (!content) return;

  const hash = window.location.hash.replace("#", "") || "home";

  function loadTemplate(id) {
    const template = document.getElementById(id);
    if (!template) {
      console.error("Template not found:", id);
      return;
    }
    content.innerHTML = template.innerHTML;
  }

  try {

    // ===== ADMIN RESTAURANTS =====
    if (hash === "admin" || hash === "adminrestaurants") {
      loadTemplate("admin-restaurants-template");
      const module = await import("/js/pages/adminrestaurants.js");
      if (module.default) module.default();
      return;
    }

    // ===== MY BOOKINGS =====
    if (hash === "mybooking") {
      loadTemplate("mybooking-template");
      const module = await import("/js/pages/mybooking.js");
      if (module.default) module.default();
      return;
    }

    // ===== PROFILE =====
    if (hash === "profile") {
      loadTemplate("profile-template");
      const module = await import("/js/pages/profile.js");
      if (module.default) module.default();
      return;
    }

    // ===== DASHBOARD =====
    if (hash === "dashboard") {
      loadTemplate("dashboard-template");
      const module = await import("/js/pages/dashboard.js");
      if (module.default) module.default();
      return;
    }

    // ===== RESTAURANT DETAILS =====
    if (hash === "restaurant") {
      loadTemplate("restaurant-details-template");
      const module = await import("/js/pages/restaurantDetails.js");
      if (module.default) module.default();
      return;
    }

    // ===== RESET PASSWORD =====
    if (hash.startsWith("reset-password")) {
      loadTemplate("reset-password-component-template");
      const module = await import("/js/pages/resetPassword.js");
      if (module.default) module.default();
      return;
    }

    // ===== DEFAULT HOME =====
    loadTemplate("home-template");

  } catch (err) {
    console.error("Router failed:", err);
  }
}