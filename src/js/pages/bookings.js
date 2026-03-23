import Mustache from "../utils/mustache.js";
import ApiRequest from "../utils/ApiRequest.js";
import {BookingStatus} from "../utils/enums.js";
import {Template} from "../config.js";

// User: Pending -> Canceled, Approved -> Canceled
// Admin: Pending -> (Approve, Cancel)
// Approved -> (Cancel, after booking happened (NoShow, Completed))

export default async function loadBookings() {
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const restaurantID = params.get("id");
    const list = document.getElementById("bookings-list");

    if (!restaurantID) {
        if (list) list.innerHTML =
            `<div class="col-12 text-center text-white"><p>No restaurant selected.</p></div>`;
        return;
    }
    // 1. Fetch Today's Bookings
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 5);

    // TODO Add filters
    const response = await ApiRequest.getBookings({
        dateFrom: today.toISOString(),
        dateTo: tomorrow.toISOString(),
        statuses: [BookingStatus.NoShow, BookingStatus.Completed, BookingStatus.Approved, BookingStatus.Pending, BookingStatus.Cancelled],
        page: 1,
        limit: 50
    }, restaurantID);

    const bookingCardTemplate = Template.component.bookingCard()
    const brandTemplate = Template.component.brandCard()
    if (response && response.bookings && response.bookings.length > 0) {
        // Update Restaurant Name in the header
        const titleEl = document.getElementById("dashboardTitle");
        if (titleEl && response.restaurant) {
            titleEl.innerHTML = `Bookings for <span style="color:var(--accent-white)">${response.restaurant.name}</span>`;
        }

        // TODO move to bookingCard.pug
        const template = `
            {{#bookings}}
            <div class="bookings-grid-item">
                <div class="booking-slick-row">
                    <div class="booking-content-wrap">
                        <div class="booking-header">
                            <div class="d-flex align-items-center gap-2 mb-2">
                                <span class="status-indicator status-{{status}}" id="dot-{{id}}"></span>
                                <span class="res-brand-tag">Booking #{{id_short}}</span>
                            </div>
                            <h3 class="res-name">{{user.firstName}} {{user.lastName}}</h3>
                        </div>

                        <div class="booking-meta-row">
                            <div class="meta-item">
                                <span>{{formattedTime}} - {{formattedEndTime}}</span>
                            </div>
                            <div class="meta-item">
                                <span>{{guestsNumber}} Guests</span>
                            </div>
                            <div class="meta-item">
                                <span id="text-{{id}}">{{status}}</span>
                            </div>
                        </div>
                    </div>

                    <div class="actions-container" id="actions-{{id}}">
                        {{#isPending}}
                        <button class="slick-manage-btn js-action" data-id="{{id}}" data-status="Approved">Confirm</button>
                        <button class="btn-outline-danger js-action" data-id="{{id}}" data-status="Cancelled">Decline</button>
                        {{/isPending}}
                        {{^isPending}}
                        <span class="text-muted small uppercase">Managed</span>
                        {{/isPending}}
                    </div>

                    {{#customerMessage}}
                    <div class="customer-message-section">
                        <p><strong>Customer Note:</strong> {{customerMessage}}</p>
                    </div>
                    {{/customerMessage}}

                    <div class="message-input-container">
                        <textarea class="message-textarea" placeholder="Type your message..."></textarea>
                        <button class="send-message-btn js-send-message" data-id="{{id}}">Send</button>
                    </div>
                </div>
            </div>
            {{/bookings}}
        `;

        const data = {
            bookings: response.bookings.map(b => ({
                ...b,
                id_short: b.id.substring(0, 8),
                // Check if bookingTime is a valid date before formatting
                formattedTime: b.bookingTime && !isNaN(new Date(b.bookingTime)) ? new Date(b.bookingTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Invalid Date',
                formattedEndTime: b.bookingTime && !isNaN(new Date(b.bookingTime)) && b.duration ? new Date(new Date(b.bookingTime).getTime() + b.duration * 60 * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Invalid Date',
                isPending: b.status === 'Pending',
                customerMessage: b.customerMessage || null, // Assuming customerMessage might be present
                restaurant: response.restaurant
            }))
        };
        list.innerHTML = Mustache.render(template, data);

        list.querySelectorAll(".js-action").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const status = btn.dataset.status;
                btn.disabled = true;

                const ok = await ApiRequest.updateBooking(id, { status });
                if (ok) {
                    document.getElementById(`dot-${id}`).className = `status-indicator status-${status}`;
                    document.getElementById(`text-${id}`).textContent = status;
                    document.getElementById(`actions-${id}`).innerHTML =
                        `<span class="text-muted small uppercase">Updated</span>`;
                } else {
                    btn.disabled = false;
                }
            };
        });

        list.querySelectorAll(".js-send-message").forEach(btn => {
            btn.onclick = async () => {
                const id = btn.dataset.id;
                const textarea = btn.previousElementSibling; // The textarea is the previous sibling
                const message = textarea.value.trim();

                if (message) {
                    // Placeholder for sending message via API
                    // await ApiRequest.sendMessage(id, message);
                    alert(`Sending message to booking ${id}: ${message}`);
                    console.log(`Sending message to booking ${id}: ${message}`);
                    textarea.value = ""; // Clear textarea after sending
                } else {
                    alert("Message cannot be empty.");
                }
            };
        });

    } else {
        list.innerHTML = `
            <div class="col-12 text-center py-5">
                <p class="text-muted">No bookings found for today.</p>
            </div>
        `;
    }
}