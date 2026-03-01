// src/js/config.js
const byId = (id) => document.getElementById(id);

const getTemplateString = (id) => {
  const el = byId(id);
  return el ? el.innerHTML.trim() : "";
};

const getTemplateFragment = (id) => {
  const el = byId(id);
  if (!el || !el.content) return document.createDocumentFragment();
  return el.content.cloneNode(true);
};

export const Template = {
  page: {
    auth: () => getTemplateString("auth-template"),
    profile: () => getTemplateString("profile-template"),
    home: () => getTemplateString("home-template"),
    restaurantDetails: () => getTemplateString("restaurant-details-template"),
    dashboard: () => getTemplateString("dashboard-template"),
    mybooking: () => getTemplateString("mybooking-template"),
    adminrestaurants: () => getTemplateString("adminrestaurants-template"),
  },

  component: {
    login: () => getTemplateFragment("login-component-template"),
    register: () => getTemplateFragment("register-component-template"),
    forgotPassword: () => getTemplateFragment("forgot-password-component-template"),
    dummyProfileTemplate: () => getTemplateFragment("dummy-profile-template"),

    // Mustache templates
    restaurantCard: () => getTemplateString("restaurant-card-template"),
    bookingCard: () => getTemplateString("booking-card-template"),
  },
};