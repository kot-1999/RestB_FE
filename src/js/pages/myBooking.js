import Mustache from "../utils/mustache.js";

export default function loadMyBookings() {
    const container = document.getElementById("bookings-container");
    const emptyState = document.getElementById("bookings-empty");
    const searchInput = document.querySelector(".mb-search input");

    const tabs = document.querySelectorAll(".mb-tab");
    const statusTabs = document.querySelectorAll(".mb-status-tab");

    let bookings = JSON.parse(localStorage.getItem("restb:bookings")) || [
        { id:1, restaurantName:"Sakura Sushi", date:"2026-03-02", time:"19:00", guests:2, status:"pending", customerName:"Alice", customerEmail:"alice@example.com", customerPhone:"123-456", reference:"AB123", specialRequest:"Window seat" },
        { id:2, restaurantName:"La Benetti", date:"2026-03-05", time:"20:30", guests:4, status:"confirmed", customerName:"Bob", customerEmail:"bob@example.com", customerPhone:"456-789", reference:"LB456" },
        { id:3, restaurantName:"Pasta House", date:"2026-03-07", time:"18:30", guests:3, status:"cancelled", customerName:"Charlie", customerEmail:"charlie@example.com", customerPhone:"789-012", reference:"PH789" }
    ];

    function render(filterQuery="", statusFilter="all", tab="upcoming") {
        container.innerHTML = "";

        let filtered = bookings;

        // Filter by search
        if(filterQuery){
            const q = filterQuery.toLowerCase();
            filtered = filtered.filter(b => 
                b.restaurantName.toLowerCase().includes(q) ||
                (b.customerName && b.customerName.toLowerCase().includes(q))
            );
        }

        // Filter by status
        if(statusFilter !== "all"){
            filtered = filtered.filter(b => b.status === statusFilter);
        }

        // Upcoming / Past filter
        const now = new Date();
        if(tab==="upcoming") filtered = filtered.filter(b => new Date(b.date) >= now);
        if(tab==="past") filtered = filtered.filter(b => new Date(b.date) < now);

        // Empty state
        emptyState.hidden = filtered.length > 0;

        // Pending count update
        const pendingCount = bookings.filter(b => b.status === "pending").length;
        const pendingTab = document.querySelector('.mb-status-tab[data-status="pending"]');
        if(pendingTab) pendingTab.textContent = `Pending${pendingCount ? ` (${pendingCount})` : ""}`;

        const template = document.getElementById("booking-card-template").innerHTML;

        filtered.forEach(b => {
            const statusClass = b.status.toLowerCase();
            const badgeClass = `badge-${statusClass}`;

            const html = Mustache.render(template, {
                ...b,
                status: b.status.charAt(0).toUpperCase() + b.status.slice(1),
                statusClass,
                badgeClass,
                isPending: b.status === "pending",
                canMessage: true, // Message button always visible
                dateISO: b.date
            });

            container.insertAdjacentHTML("beforeend", html);
        });

        addCardEventListeners();
    }

    function addCardEventListeners() {
        // Confirm button
        container.querySelectorAll(".mb-confirm-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                const booking = bookings.find(b => b.id === id);
                if(booking) {
                    booking.status = "confirmed";
                    localStorage.setItem("restb:bookings", JSON.stringify(bookings));
                    render(searchInput?.value||"", getActiveStatus(), getActiveTab());
                }
            });
        });

        // Cancel button
        container.querySelectorAll(".mb-cancel-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const id = parseInt(btn.dataset.id);
                const booking = bookings.find(b => b.id === id);
                if(booking) {
                    booking.status = "cancelled";
                    localStorage.setItem("restb:bookings", JSON.stringify(bookings));
                    render(searchInput?.value||"", getActiveStatus(), getActiveTab());
                }
            });
        });

        // Message button
        container.querySelectorAll(".mb-message-btn").forEach(btn => {
            btn.addEventListener("click", () => {
                const card = btn.closest(".mb-card");
                let area = card.querySelector(".mb-message-area");
                if(!area){
                    area = document.createElement("div");
                    area.className = "mb-message-area";
                    area.innerHTML = `<input class="mb-message-input" placeholder="Write a message…" />
                                      <button class="mb-message-send">Send</button>`;
                    card.appendChild(area);
                }
                area.style.display = area.style.display==="block" ? "none" : "block";
                area.querySelector(".mb-message-send").onclick = () => {
                    const input = area.querySelector(".mb-message-input");
                    if(input.value.trim()){ 
                        alert(`Message sent: ${input.value}`); 
                        input.value = ""; 
                        area.style.display = "none";
                    }
                };
            });
        });

        // User modal
        container.querySelectorAll(".mb-user-link").forEach(btn => {
            btn.addEventListener("click", () => {
                const modal = document.getElementById("userModal");
                modal.querySelector("#modalUserName").textContent = btn.dataset.name;
                modal.querySelector("#modalUserEmail").textContent = btn.dataset.email;
                modal.querySelector("#modalUserPhone").textContent = btn.dataset.phone;
                modal.classList.add("active");
            });
        });

        document.getElementById("closeUserModal")?.addEventListener("click", () => {
            document.getElementById("userModal")?.classList.remove("active");
        });
    }

    function getActiveTab() {
        return document.querySelector(".mb-tab.active")?.dataset.filter || "upcoming";
    }
    function getActiveStatus() {
        return document.querySelector(".mb-status-tab.active")?.dataset.status || "all";
    }

    // Search input
    searchInput?.addEventListener("input", e => render(e.target.value, getActiveStatus(), getActiveTab()));

    // Top tabs
    tabs.forEach(btn => {
        btn.addEventListener("click", () => {
            tabs.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            render(searchInput?.value||"", getActiveStatus(), getActiveTab());
        });
    });

    // Status tabs
    statusTabs.forEach(btn => {
        btn.addEventListener("click", () => {
            statusTabs.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            render(searchInput?.value||"", getActiveStatus(), getActiveTab());
        });
    });

    render();
}

document.addEventListener("DOMContentLoaded", loadMyBookings);