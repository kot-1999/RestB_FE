
export default async function () {

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
    document.addEventListener("DOMContentLoaded", () => {
        const dateEl = document.getElementById("rb-date");
        const guestsEl = document.getElementById("rb-guests");
        const startEl = document.getElementById("rb-start");
        const timeFromEl = document.getElementById("rb-timefrom");
        const timeToEl = document.getElementById("rb-timeto");
        const confirmBtn = document.getElementById("rb-confirm");
        const msgEl = document.getElementById("rb-msg");

        const timeButtons = Array.from(document.querySelectorAll(".time-slot"));

        function addHours(time, hoursToAdd) {
            // time = "19:00"
            const [h, m] = (time || "00:00").split(":").map(Number);
            const d = new Date();
            d.setHours(h, m, 0, 0);
            d.setHours(d.getHours() + hoursToAdd);
            const hh = String(d.getHours()).padStart(2, "0");
            const mm = String(d.getMinutes()).padStart(2, "0");
            return `${hh}:${mm}`;
        }

        function syncTimes(startTime) {
            if (!startTime) return;
            startEl.value = startTime;
            timeFromEl.value = startTime;
            timeToEl.value = addHours(startTime, 2); // default seating duration
        }

        function validate() {
            const hasDate = !!dateEl?.value;
            const guests = Number(guestsEl?.value || 0);
            const hasGuests = guests >= 1;
            const hasTime = !!startEl?.value;

            const ok = hasDate && hasGuests && hasTime;
            confirmBtn.disabled = !ok;
        }

        // Clicking quick time buttons
        timeButtons.forEach((btn) => {
            btn.addEventListener("click", () => {
                timeButtons.forEach((b) => b.classList.remove("active"));
                btn.classList.add("active");
                syncTimes(btn.dataset.time);
                validate();
            });
        });

        // Manual edits
        startEl?.addEventListener("change", () => {
            syncTimes(startEl.value);
            validate();
        });
        dateEl?.addEventListener("change", validate);
        guestsEl?.addEventListener("input", validate);

        confirmBtn?.addEventListener("click", () => {
            const booking = {
                restaurant: document.getElementById("rb-name")?.textContent || "Unknown",
                date: dateEl.value,
                timeFrom: timeFromEl.value,
                timeTo: timeToEl.value,
                guests: Number(guestsEl.value || 1),
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem("restb:lastBooking", JSON.stringify(booking));
            msgEl.textContent = `Booked ✅ ${booking.restaurant} on ${booking.date} from ${booking.timeFrom} to ${booking.timeTo} for ${booking.guests}`;
        });

        // Initial state
        syncTimes(startEl?.value || "19:00");
        validate();
    });

    const timeInput = document.getElementById("rb-time");

    document.querySelectorAll(".time-slot").forEach(btn => {
        btn.addEventListener("click", () => {
            document.querySelectorAll(".time-slot").forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            if (timeInput) timeInput.value = btn.dataset.time;
        });
    });
    document.addEventListener("DOMContentLoaded", () => {
        const dateEl = document.getElementById("rb-date");
        const timeEl = document.getElementById("rb-time");
        const guestsEl = document.getElementById("rb-guests");
        const untilEl = document.getElementById("rb-until");
        const confirmBtn = document.getElementById("rb-confirm");
        const msgEl = document.getElementById("rb-msg");

        if (!dateEl || !timeEl || !guestsEl || !untilEl || !confirmBtn) return;

        function clampGuests(n) {
            const v = Number(n);
            if (!Number.isFinite(v)) return 1;
            return Math.max(1, Math.min(20, v));
        }

        // Simple duration logic (tweak however you want)
        // 1–2 people: 75 mins
        // 3–4 people: 90 mins
        // 5–6 people: 105 mins
        // 7+: 120 mins
        function durationMinutes(guests) {
            if (guests <= 2) return 75;
            if (guests <= 4) return 90;
            if (guests <= 6) return 105;
            return 120;
        }

        function addMinutesToTimeHHMM(timeHHMM, minsToAdd) {
            if (!timeHHMM || !timeHHMM.includes(":")) return "";
            const [hh, mm] = timeHHMM.split(":").map(Number);
            if (!Number.isFinite(hh) || !Number.isFinite(mm)) return "";

            const total = hh * 60 + mm + minsToAdd;
            const newTotal = (total + 24 * 60) % (24 * 60); // wrap around day
            const nh = String(Math.floor(newTotal / 60)).padStart(2, "0");
            const nm = String(newTotal % 60).padStart(2, "0");
            return `${nh}:${nm}`;
        }

        function refresh() {
            const guests = clampGuests(guestsEl.value);
            guestsEl.value = guests;

            const dateOk = !!dateEl.value;
            const timeOk = !!timeEl.value;

            if (timeOk) {
                const mins = durationMinutes(guests);
                untilEl.value = addMinutesToTimeHHMM(timeEl.value, mins);
            } else {
                untilEl.value = "";
            }

            confirmBtn.disabled = !(dateOk && timeOk && guests > 0);

            if (msgEl) msgEl.textContent = "";
        }

        confirmBtn.addEventListener("click", () => {
            const booking = {
                restaurant: document.getElementById("rb-name")?.textContent?.trim() || "Restaurant",
                date: dateEl.value,
                time: timeEl.value,
                until: untilEl.value,
                guests: clampGuests(guestsEl.value),
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem("restb:lastBooking", JSON.stringify(booking));
            if (msgEl) msgEl.textContent = `Booked for ${booking.guests} at ${booking.time} (until ${booking.until}) ✅`;
        });

        ["input", "change"].forEach((evt) => {
            dateEl.addEventListener(evt, refresh);
            timeEl.addEventListener(evt, refresh);
            guestsEl.addEventListener(evt, refresh);
        });

        refresh();
    });
    document.addEventListener("DOMContentLoaded", () => {
        const dateEl = document.getElementById("rb-date");
        const timeEl = document.getElementById("rb-time");
        const guestsEl = document.getElementById("rb-guests");
        const untilEl = document.getElementById("rb-until");
        const confirmBtn = document.getElementById("rb-confirm");
        const msgEl = document.getElementById("rb-msg");

        if (!dateEl || !timeEl || !guestsEl || !untilEl || !confirmBtn) return;

        function clampGuests(n) {
            const v = Number(n);
            if (!Number.isFinite(v)) return 1;
            return Math.max(1, Math.min(20, v));
        }

        // Simple duration logic (tweak however you want)
        // 1–2 people: 75 mins
        // 3–4 people: 90 mins
        // 5–6 people: 105 mins
        // 7+: 120 mins
        function durationMinutes(guests) {
            if (guests <= 2) return 75;
            if (guests <= 4) return 90;
            if (guests <= 6) return 105;
            return 120;
        }

        function addMinutesToTimeHHMM(timeHHMM, minsToAdd) {
            if (!timeHHMM || !timeHHMM.includes(":")) return "";
            const [hh, mm] = timeHHMM.split(":").map(Number);
            if (!Number.isFinite(hh) || !Number.isFinite(mm)) return "";

            const total = hh * 60 + mm + minsToAdd;
            const newTotal = (total + 24 * 60) % (24 * 60); // wrap around day
            const nh = String(Math.floor(newTotal / 60)).padStart(2, "0");
            const nm = String(newTotal % 60).padStart(2, "0");
            return `${nh}:${nm}`;
        }

        function refresh() {
            const guests = clampGuests(guestsEl.value);
            guestsEl.value = guests;

            const dateOk = !!dateEl.value;
            const timeOk = !!timeEl.value;

            if (timeOk) {
                const mins = durationMinutes(guests);
                untilEl.value = addMinutesToTimeHHMM(timeEl.value, mins);
            } else {
                untilEl.value = "";
            }

            confirmBtn.disabled = !(dateOk && timeOk && guests > 0);

            if (msgEl) msgEl.textContent = "";
        }

        confirmBtn.addEventListener("click", () => {
            const booking = {
                restaurant: document.getElementById("rb-name")?.textContent?.trim() || "Restaurant",
                date: dateEl.value,
                time: timeEl.value,
                until: untilEl.value,
                guests: clampGuests(guestsEl.value),
                createdAt: new Date().toISOString(),
            };

            localStorage.setItem("restb:lastBooking", JSON.stringify(booking));
            if (msgEl) msgEl.textContent = `Booked for ${booking.guests} at ${booking.time} (until ${booking.until}) ✅`;
        });

        ["input", "change"].forEach((evt) => {
            dateEl.addEventListener(evt, refresh);
            timeEl.addEventListener(evt, refresh);
            guestsEl.addEventListener(evt, refresh);
        });

        refresh();
    });

}