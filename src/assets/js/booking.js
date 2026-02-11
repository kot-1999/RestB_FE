// src/assets/js/booking.js

document.addEventListener("DOMContentLoaded", () => {
  console.log("BOOKING JS LOADED");

  const confirmBtn = document.getElementById("confirm-booking");
  const guestsInput = document.getElementById("guests");

  if (!confirmBtn) {
    console.warn("confirm-booking button not found");
    return;
  }

  confirmBtn.addEventListener("click", () => {
    console.log("CONFIRM CLICKED");

    // Read query params: ?restaurant=...&time=...
    const params = new URLSearchParams(window.location.search);
    const restaurant = params.get("restaurant") || "-";
    const time = params.get("time") || "-";

    const guests = guestsInput ? Number(guestsInput.value || 1) : 1;

    // Create a booking object
    const booking = {
      restaurant,
      time,
      guests,
      createdAt: new Date().toISOString(),
    };

    // Save to localStorage (use ONE key consistently)
    localStorage.setItem("restb:lastBooking", JSON.stringify(booking));

    alert(`Booked ${restaurant} at ${time} for ${guests} guests ✅`);

    // optional: redirect back to restaurants list
    // window.location.href = "/views/pages/restaurants";
  });
});
