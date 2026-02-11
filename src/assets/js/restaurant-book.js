document.addEventListener("DOMContentLoaded", () => {
  // Optional: read query params like ?restaurant=...&img=...&tags=...&location=...
  const params = new URLSearchParams(window.location.search);

  const nameEl = document.getElementById("rb-name");
  const tagsEl = document.getElementById("rb-tags");
  const locEl = document.getElementById("rb-location");
  const imgEl = document.querySelector(".rb-hero-img");

  if (params.get("restaurant") && nameEl) nameEl.textContent = params.get("restaurant");
  if (params.get("tags") && tagsEl) tagsEl.textContent = params.get("tags");
  if (params.get("location") && locEl) locEl.textContent = `📍 ${params.get("location")}`;
  if (params.get("img") && imgEl) imgEl.src = params.get("img");

  const timeButtons = document.querySelectorAll(".time-slot");
  const confirmBtn = document.getElementById("rb-confirm");
  const guestsInput = document.getElementById("rb-guests");
  const dateInput = document.getElementById("rb-date");
  const msgEl = document.getElementById("rb-msg");

  let selectedTime = null;

  timeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      timeButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      selectedTime = btn.dataset.time;
      confirmBtn.disabled = !selectedTime;
      if (msgEl) msgEl.textContent = "";
    });
  });

  confirmBtn.addEventListener("click", () => {
    const restaurant = (nameEl?.textContent || "Restaurant").trim();
    const guests = Number(guestsInput?.value || 1);
    const date = dateInput?.value || "";

    // Frontend-only “booking” (until backend exists)
    const booking = {
      restaurant,
      date,
      time: selectedTime,
      guests,
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("restb:lastBooking", JSON.stringify(booking));

    if (msgEl) msgEl.textContent = `✅ Booked ${restaurant} on ${date || "?"} at ${selectedTime} for ${guests} guests.`;
    alert(`Booked ${restaurant} at ${selectedTime} for ${guests} guests ✅`);
  });
});
