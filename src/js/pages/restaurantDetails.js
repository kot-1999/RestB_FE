export default async function () {
  document.addEventListener("DOMContentLoaded", () => {
    // ===== Helpers =====
    const $ = (sel) => document.querySelector(sel);
    const $$ = (sel) => Array.from(document.querySelectorAll(sel));

    const clampGuests = (n) => {
      const v = Number(n);
      if (!Number.isFinite(v)) return 1;
      return Math.max(1, Math.min(20, v));
    };

    // Seating duration rule (tweak as you like)
    // 1–2: 75 mins, 3–4: 90, 5–6: 105, 7+: 120
    const durationMinutes = (guests) => {
      if (guests <= 2) return 75;
      if (guests <= 4) return 90;
      if (guests <= 6) return 105;
      return 120;
    };

    const addMinutesToTimeHHMM = (timeHHMM, minsToAdd) => {
      if (!timeHHMM || !timeHHMM.includes(":")) return "";
      const [hh, mm] = timeHHMM.split(":").map(Number);
      if (!Number.isFinite(hh) || !Number.isFinite(mm)) return "";

      const total = hh * 60 + mm + minsToAdd;
      const wrapped = (total + 24 * 60) % (24 * 60);
      const nh = String(Math.floor(wrapped / 60)).padStart(2, "0");
      const nm = String(wrapped % 60).padStart(2, "0");
      return `${nh}:${nm}`;
    };

    const uid = () => {
      // crypto.randomUUID is supported in modern browsers
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
        status: "pending", // mock for now; backend will overwrite later
        createdAt: new Date().toISOString(),
        ...booking,
      };

      existing.unshift(enriched);
      localStorage.setItem(listKey, JSON.stringify(existing));
      localStorage.setItem(lastKey, JSON.stringify(enriched)); // compatibility
      return enriched;
    };

    // ===== Read query params (restaurant info) =====
    const params = new URLSearchParams(window.location.search);

    const nameEl = document.getElementById("rb-name");
    const tagsEl = document.getElementById("rb-tags");
    const locEl = document.getElementById("rb-location");
    const imgEl = document.querySelector(".rb-hero-img");

    const qpRestaurant = params.get("restaurant");
    const qpTags = params.get("tags");
    const qpLocation = params.get("location");
    const qpImg = params.get("img");
    const qpRestaurantId = params.get("restaurantId") || params.get("id"); // optional if you have it

    if (qpRestaurant && nameEl) nameEl.textContent = qpRestaurant;
    if (qpTags && tagsEl) tagsEl.textContent = qpTags;
    if (qpLocation && locEl) locEl.textContent = `📍 ${qpLocation}`;
    if (qpImg && imgEl) imgEl.src = qpImg;

    // ===== Elements =====
    const dateEl = document.getElementById("rb-date");
    const timeEl = document.getElementById("rb-time"); // input[type=time] OR hidden input used by time-slot buttons
    const guestsEl = document.getElementById("rb-guests");
    const untilEl = document.getElementById("rb-until"); // optional
    const confirmBtn = document.getElementById("rb-confirm");
    const msgEl = document.getElementById("rb-msg");

    const timeButtons = $$(".time-slot");

    // If these aren’t present on the page, exit gracefully
    if (!confirmBtn) return;

    // ===== State =====
    let selectedTime = timeEl?.value || null;

    // ===== UI functions =====
    const clearMessage = () => {
      if (msgEl) msgEl.textContent = "";
    };

    const setMessage = (text) => {
      if (msgEl) msgEl.textContent = text;
    };

    const setActiveTimeButton = (time) => {
      timeButtons.forEach((b) => b.classList.toggle("active", b.dataset.time === time));
    };

    const refreshUntil = () => {
      if (!untilEl || !timeEl) return;

      const guests = clampGuests(guestsEl?.value);
      const t = timeEl.value;

      if (!t) {
        untilEl.value = "";
        return;
      }

      const mins = durationMinutes(guests);
      untilEl.value = addMinutesToTimeHHMM(t, mins);
    };

    const validate = () => {
      const hasDate = !!dateEl?.value;
      const guests = clampGuests(guestsEl?.value);
      if (guestsEl) guestsEl.value = String(guests);

      const hasTime = !!timeEl?.value;

      // only enable when required fields exist
      confirmBtn.disabled = !(hasDate && hasTime && guests >= 1);
    };

    const syncTime = (time) => {
      selectedTime = time;
      if (timeEl) timeEl.value = time || "";
      setActiveTimeButton(time);
      refreshUntil();
      validate();
      clearMessage();
    };

    // ===== Time slot buttons =====
    if (timeButtons.length) {
      timeButtons.forEach((btn) => {
        btn.addEventListener("click", () => {
          const t = btn.dataset.time;
          if (!t) return;
          syncTime(t);
        });
      });
    }

    // ===== Manual inputs =====
    dateEl?.addEventListener("change", () => {
      validate();
      clearMessage();
    });

    guestsEl?.addEventListener("input", () => {
      refreshUntil();
      validate();
      clearMessage();
    });

    timeEl?.addEventListener("input", () => {
      syncTime(timeEl.value);
    });

    // ===== Confirm booking =====
    confirmBtn.addEventListener("click", () => {
      const restaurantName = (nameEl?.textContent || qpRestaurant || "Restaurant").trim();
      const restaurant = {
        id: qpRestaurantId || null,
        name: restaurantName,
        tags: qpTags || (tagsEl?.textContent || ""),
        location: qpLocation || (locEl?.textContent || "").replace("📍", "").trim(),
        imageUrl: qpImg || (imgEl?.src || ""),
      };

      const booking = {
        restaurant, // store structured restaurant info for My Bookings UI
        date: dateEl?.value || "",
        time: timeEl?.value || selectedTime || "",
        until: untilEl?.value || "",
        guests: clampGuests(guestsEl?.value),
      };

      const saved = saveBookingToList(booking);

      setMessage(
          `✅ Booked ${restaurant.name} on ${saved.date || "?"} at ${saved.time || "?"} for ${saved.guests} guests${saved.until ? ` (until ${saved.until})` : ""}.`
      );

      // Optional: keep alert if you want it
      // alert(`Booked ${restaurant.name} at ${saved.time} for ${saved.guests} guests ✅`);
    });

    // ===== Initial state =====
    // If there is a default selected time button, use it
    const firstActive = timeButtons.find((b) => b.classList.contains("active"))?.dataset.time;
    const defaultTime = firstActive || selectedTime || timeButtons[0]?.dataset.time || "";

    if (defaultTime) syncTime(defaultTime);
    refreshUntil();
    validate();
  });
}