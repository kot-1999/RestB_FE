// src/js/pages/mybooking.js
import Mustache from "../utils/mustache.js";

export default function loadMyBookings() {
    const container = document.getElementById("bookings-container");
    const emptyState = document.getElementById("bookings-empty");
    const modal = document.getElementById("cancelModal");
    const modalConfirm = modal?.querySelector(".mb-modal-confirm");
    const modalCancel = modal?.querySelector(".mb-modal-cancel");
    const toast = document.getElementById("toast");
    const undoBtn = document.getElementById("undoToast");
    const searchInput = document.querySelector(".mb-search input");

    if (!container) return;
    container.innerHTML = "";

    let bookings = [];
    try {
        bookings = JSON.parse(localStorage.getItem("restb:bookings")) || [];
    } catch {
        bookings = [];
    }

    // Seed fallback if empty
    if (!bookings.length) {
        bookings = [
            { id: 1, restaurantName: "Sakura Sushi", date: "2026-03-02", time: "19:00", guests: 2, status: "pending" },
            { id: 2, restaurantName: "La Benetti", date: "2026-03-05", time: "20:30", guests: 4, status: "approved" },
            { id: 3, restaurantName: "Pasta House", date: "2026-03-07", time: "18:30", guests: 3, status: "cancelled" },
        ];
        localStorage.setItem("restb:bookings", JSON.stringify(bookings));
    }

    function fmtDate(iso) {
        return new Intl.DateTimeFormat("en-GB", {
            month: "short",
            day: "numeric",
            year: "numeric"
        }).format(new Date(`${iso}T00:00`));
    }

    // Render bookings
    function render(filterQuery = "") {
        container.innerHTML = "";
        let filtered = bookings;

        if (filterQuery) {
            const q = filterQuery.toLowerCase();
            filtered = bookings.filter(b => b.restaurantName.toLowerCase().includes(q));
        }

        if (!filtered.length) {
            if (emptyState) emptyState.hidden = false;
            return;
        }
        if (emptyState) emptyState.hidden = true;

        const templateEl = document.getElementById("booking-card-template");
        if (!templateEl) return;
        const template = templateEl.innerHTML;

        filtered.forEach(b => {
            const statusClass = b.status.toLowerCase();
            const badgeClass = `badge-${statusClass}`;
            const html = Mustache.render(template, {
                ...b,
                status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
                statusClass,
                badgeClass,
                canCancel: b.status === "pending" || b.status === "approved",
                canMessage: true
            });
            container.insertAdjacentHTML("beforeend", html);
        });

        // Cancel button
        container.querySelectorAll(".mb-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                openCancelModal(id);
            });
        });

        // Message button
        container.querySelectorAll(".mb-message-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const card = btn.closest(".mb-card");
                let area = card.querySelector(".mb-message-area");
                if (!area) {
                    // Create message area dynamically
                    area = document.createElement("div");
                    area.className = "mb-message-area";
                    area.innerHTML = `
            <input class="mb-message-input" placeholder="Write a message…" />
            <button class="mb-message-send">Send</button>
          `;
                    card.appendChild(area);
                }
                area.style.display = area.style.display === "block" ? "none" : "block";

                const input = area.querySelector(".mb-message-input");
                const sendBtn = area.querySelector(".mb-message-send");
                sendBtn.onclick = () => {
                    if (input.value.trim()) {
                        alert(`Message sent to ${card.querySelector("h3").textContent}: ${input.value}`);
                        input.value = "";
                        area.style.display = "none";
                    }
                };
            });
        });
    }

    // Cancel modal logic
    let bookingToCancel = null;
    function openCancelModal(id) {
        bookingToCancel = id;
        if (!modal) return;
        modal.classList.add("active");
    }

    modalCancel?.addEventListener("click", () => {
        bookingToCancel = null;
        modal?.classList.remove("active");
    });

    modalConfirm?.addEventListener("click", () => {
        if (bookingToCancel !== null) {
            const index = bookings.findIndex(b => b.id === bookingToCancel);
            if (index > -1) {
                const removed = bookings[index];
                bookings[index].status = "cancelled";
                localStorage.setItem("restb:bookings", JSON.stringify(bookings));
                render(searchInput?.value || "");
                showToast(removed.restaurantName);
            }
            bookingToCancel = null;
        }
        modal?.classList.remove("active");
    });

    // Toast
    function showToast(name) {
        if (!toast) return;
        toast.hidden = false;
        toast.querySelector("span")?.remove();
        const textNode = document.createTextNode(`${name} canceled`);
        toast.insertBefore(textNode, undoBtn);
        setTimeout(() => { if (toast) toast.hidden = true; }, 3000);
    }

    undoBtn?.addEventListener("click", () => {
        alert("Undo not implemented yet");
        toast.hidden = true;
    });

    // Search input
    searchInput?.addEventListener("input", e => render(e.target.value));

    render();
}