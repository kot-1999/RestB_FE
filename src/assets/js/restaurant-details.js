// src/assets/js/restaurant-details.js
document.addEventListener("DOMContentLoaded", () => {
  const btn = document.getElementById("book-now");
  if (!btn) return;

  let selectedTime = null;

  document.querySelectorAll(".time-slot").forEach((b) => {
    b.addEventListener("click", () => {
      document.querySelectorAll(".time-slot").forEach(x => x.classList.remove("active"));
      b.classList.add("active");
      selectedTime = b.textContent.trim();
      btn.disabled = false;
    });
  });

  btn.addEventListener("click", () => {
    // hardcode restaurant for now, or grab it from the page
    const restaurant = "Sakura Sushi";
    if (!selectedTime) return;

    window.location.href =
      `/views/pages/booking?restaurant=${encodeURIComponent(restaurant)}&time=${encodeURIComponent(selectedTime)}`;
  });
});
