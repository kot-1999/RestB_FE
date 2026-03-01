import { Template } from "./config.js";

import loadAuth from "./pages/auth.js";
import loadHome from "./pages/home.js";
import loadProfile from "./pages/profile.js";
import loadRestaurantDetails from "./pages/restaurantDetails.js";
import loadDashboard from "./pages/dashboard.js";
import loadMyBookings from "./pages/mybooking.js";
import loadAdminRestaurants from "./pages/adminrestaurants.js";

import ApiRequest from "./utils/ApiRequest.js";
import { showError } from "./utils/helpers.js";

function showContent() {
  $("#content").css("visibility", "visible");
}

function loadPage(template, loader, navId) {
  $(".navItem").removeClass("navActive");

  if (navId && $(navId).length) {
    $(navId).addClass("navActive");
  }

  $("#content").empty().append(template());

  if (typeof loader === "function") {
    loader();
  }

  window.scrollTo({ top: 0, behavior: "auto" });
}

const logout = () => {
  ApiRequest.logout().then(() => {
    window.location.hash = "#home";
  });
};

function renderFromHash() {
  try {
    const routes = {

      "#signin": {
        template: Template.page.auth,
        loader: loadAuth,
        nav: "#signin",
      },

      "#signout": {
        template: Template.page.home,
        loader: logout,
        nav: "#home",
      },

      "#profile": {
        template: Template.page.profile,
        loader: loadProfile,
        nav: "#profile",
      },

      "#home": {
        template: Template.page.home,
        loader: loadHome,
        nav: "#home",
      },

      "#restaurant-details": {
        template: Template.page.restaurantDetails,
        loader: loadRestaurantDetails,
        nav: "#restaurant-details",
      },

      "#dashboard": {
        template: Template.page.dashboard,
        loader: loadDashboard,
        nav: "#dashboard",
      },

      "#mybooking": {
        template: Template.page.mybooking,
        loader: loadMyBookings,
        nav: null,
      },

      "#adminrestaurants": {
        template: Template.page.adminrestaurants,
        loader: loadAdminRestaurants,
        nav: "#adminrestaurants",
      },

    };

    // If route not found → go home
    if (!routes[window.location.hash]) {
      window.location.hash = "#home";
      return;
    }

    const route = routes[window.location.hash];
    loadPage(route.template, route.loader, route.nav);

  } catch (err) {
    showError(err);
  }
}

$(document).ready(function () {
  renderFromHash();
  showContent();
});

window.addEventListener("hashchange", renderFromHash);