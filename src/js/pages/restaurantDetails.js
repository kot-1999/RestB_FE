import ApiRequest from "../utils/ApiRequest.js";

export default async function () {
  const hash = window.location.hash;
  const queryString = hash.includes("?") ? hash.substring(hash.indexOf("?")) : "";
  const params = new URLSearchParams(queryString);

  const restaurantID = params.get("id");
  const restaurant = await ApiRequest.getRestaurant(restaurantID);

  console.log("!!!!!!!!!", restaurantID, restaurant);

  // Helper function to run initialization logic
  const initPage = () => {
    // ===== Helpers =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    const clampGuests = (n) => {
      const v = Number(n);
      if (!Number.isFinite(v)) return 1;
      return Math.max(1, Math.min(20, v));
    };

    const uid = () => {
      try {
        return crypto.randomUUID();
      } catch {
        return `b_${Date.now()}_${Math.random().toString(16).slice(2)}`;
      }
    };

    const saveBookingToList = (booking) => {
      const listKey = "restb:bookings";
      const lastKey = "restb:lastBooking";

      let existing = [];
      try {
        existing = JSON.parse(localStorage.getItem(listKey) || "[]");
        if (!Array.isArray(existing)) existing = [];
      } catch {
        existing = [];
      }

      const enriched = {
        id: uid(),
        status: "pending",
        createdAt: new Date().toISOString(),
        ...booking,
      };

      existing.unshift(enriched);
      localStorage.setItem(listKey, JSON.stringify(existing));
      localStorage.setItem(lastKey, JSON.stringify(enriched));
      return enriched;
    };

    // ===== Populate UI from Backend Data =====
    const nameEl = document.getElementById("rb-name");
    const brandEl = document.getElementById("rb-brand");
    const locEl = document.getElementById("rb-location");
    const categoriesEl = document.getElementById("rb-categories");
    const openingTimesEl = document.getElementById("rb-hours");
    const descEl = document.getElementById("rb-desc");
    const bannerImg = document.querySelector(".rb-banner-img");

    if (restaurant) {
      if (nameEl) nameEl.textContent = restaurant.name || "Restaurant";
      if (brandEl) brandEl.textContent = restaurant.brand?.name || "—";

      if (locEl && restaurant.address) {
        const addr = restaurant.address;
        locEl.textContent = `${addr.building} ${addr.street}, ${addr.city}`;
      }

      if (categoriesEl) {
        categoriesEl.textContent = Array.isArray(restaurant.categories) ? restaurant.categories.join(', ') : '—';
      }

      if (openingTimesEl) {
        openingTimesEl.textContent = `${restaurant.timeFrom || '—'} to ${restaurant.timeTo || '—'}`;
      }

      // ✅ NEW: Description from backend (readonly display)
      if (descEl) {
        descEl.textContent = restaurant.description || "No description available.";
      }

      if (bannerImg && restaurant.bannerURL) {
        bannerImg.src = restaurant.bannerURL;
      }
    }

    // ===== Elements =====
    const dateEl = document.getElementById("rb-date");
    const timeEl = document.getElementById("rb-time");
    const guestsEl = document.getElementById("rb-guests");
    const untilEl = document.getElementById("rb-until"); // ✅ Now editable by user
    const confirmBtn = document.getElementById("rb-confirm");
    const msgEl = document.getElementById("rb-msg");

    if (!confirmBtn) return;

    // ===== UI functions =====
    const clearMessage = () => {
      if (msgEl) msgEl.textContent = "";
    };

    const setMessage = (text) => {
      if (msgEl) msgEl.textContent = text;
    };

    const validate = () => {
      const hasDate = !!dateEl?.value;
      const guests = clampGuests(guestsEl?.value);
      if (guestsEl) guestsEl.value = String(guests);

      const hasTime = !!timeEl?.value;
      const hasUntil = !!untilEl?.value; // ✅ Required for validation

      confirmBtn.disabled = !(hasDate && hasTime && hasUntil && guests >= 1);
    };

    // ===== Event Listeners =====
    [dateEl, timeEl, guestsEl, untilEl].forEach(el => {
      el?.addEventListener("change", () => {
        validate();
        clearMessage();
      });
      el?.addEventListener("input", () => {
        validate();
        clearMessage();
      });
    });

    // ===== Confirm booking =====
    confirmBtn.addEventListener("click", async () => {
      const bookingData = {
        restaurantID,
        date: dateEl?.value || "",
        startTime: timeEl?.value || "",
        endTime: untilEl?.value || "",
        guests: clampGuests(guestsEl?.value),
      };

      confirmBtn.disabled = true;
      confirmBtn.textContent = "Processing...";

      // Send to backend
      const result = await ApiRequest.createBooking(restaurantID, bookingData);

      if (result) {
        saveBookingToList({
          ...bookingData,
          restaurant: {
            name: nameEl?.textContent || "Restaurant",
            location: locEl?.textContent || "",
          }
        });
        setMessage(`✅ Booking confirmed for ${dateEl.value} at ${timeEl.value}!`);
        confirmBtn.textContent = "Confirmed";
      } else {
        setMessage("❌ Failed to book. Please try again.");
        confirmBtn.disabled = false;
        confirmBtn.textContent = "Confirm Booking";
      }
    });

    validate();
  };

  // Run immediately since nav.js already rendered the template
  initPage();
}