import ApiRequest from "../utils/ApiRequest.js";
import Mustache from "../utils/mustache.js";
import Template from "../utils/Template.js";
import {renderHeaderWithBrand, showError} from "../utils/helpers.js";
import renderPagination from "./components/pagination.js";

// ─── Data mapper ──────────────────────────────────────────────────────────────
function mapBookingToView(b) {
    const time = new Date(b.bookingTime);
    const ok   = !isNaN(time);
    return {
        id:                 b.id,
        status:             b.status,
        customerName:       b.restaurant ? `${b?.restaurant?.name}` : `${b.user?.firstName || 'Guest'} ${b.user?.lastName}`,
        restaurantID:       b.restaurant ? b.restaurant?.id : null,
        customerEmail:      b.user?.email  || 'No email',
        customerPhone:      b.user?.phone  || 'No phone',
        numGuests:          b.guestsNumber || 0,
        formattedDate:      ok ? time.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
        formattedStartTime: ok ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'
    };
}

// ─── Chat bubble builder ──────────────────────────────────────────────────────
function buildBubbles(discussion) {
    if (!discussion?.length) {
        return '<p class="bc-chat-empty">No messages yet.</p>';
    }
    return discussion.map(msg => {
        const isCustomer = msg.authorType === 'user';
        const author = `${msg.firstName || (isCustomer ? 'Customer' : 'Staff')} ${msg.lastName || ''}`.trim();
        const time   = new Date(msg.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        return `<div class="bc-bubble ${isCustomer ? 'bc-bubble--customer' : 'bc-bubble--staff'}">
            <span class="bc-bubble-author">${author}</span>
            <p class="bc-bubble-text">${msg.message}</p>
            <span class="bc-bubble-time">${time}</span>
        </div>`;
    }).join('');
}

// ─── Main export ──────────────────────────────────────────────────────────────
export default async function loadBookings(options = { page: 1 }) {
    const $list = $("#bookings-list");
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const restaurantID = params.get("id");


    const $fromInput   = $("#filter-from");
    const $toInput     = $("#filter-to");
    const $statusInput = $("#filter-status");

    // Default to today
    if (!$fromInput.val()) {
        const today = new Date().toISOString().split('T')[0];
        $fromInput.val(today);
        $toInput.val(today);
    }

    // ── Fetch & render ──────────────────────────────────────────────────────
    const fetchBookings = async (page) => {
        const fromVal = $fromInput.val();
        const toVal   = $toInput.val();
        if (!fromVal || !toVal) {
            $list.html('<p class="bc-state-msg">Please select a date range and try again.</p>');
            return;
        }

        $list.html('<p class="bc-state-msg">Loading bookings…</p>');

        const query = {
            dateFrom: fromVal + "T00:00:00.000Z",
            dateTo:   toVal   + "T23:59:59.999Z",
            page,
            limit: 20,
        };

        const selectedStatus = $statusInput.val();
        if (selectedStatus) query.statuses = [selectedStatus];

        let res;
        try {
            res = await ApiRequest.getBookings(query, restaurantID);
        } catch (err) {
            showError(err)
        }

        if (!res?.bookings) {
            $list.html('<p class="bc-state-msg bc-state-msg--error">Failed to load bookings. Please refresh and try again.</p>');
            return;
        }

        // Title + count badge
        const count = res.bookings.length;
        $("#dashboardTitle").html(
            `Bookings for <span style="color:var(--accent-white)">${res.restaurant?.name || ''}</span>` +
            ` <span class="bc-count-badge">${count}</span>`
        );

        // Brand
        if (res.restaurant) {
            renderHeaderWithBrand(res.restaurant.brand, 'Manage Bookings', 'Today\'s mission control overview.');
        }

        renderPagination(res.pagination, loadBookings)

        if (count === 0) {
            $list.html('<p class="bc-state-msg">No bookings found for the selected filters.</p>');
            return;
        }
        const bookingCardTemplate = Template.component.bookingCard()
        // Render cards
        const cardsHtml = res.bookings
            .map(b => Mustache.render(bookingCardTemplate, mapBookingToView(b)))
            .join('');
        $list.html(cardsHtml);

        // Inject chat bubbles post-render
        res.bookings.forEach(b => {
            const $card = $list.find(`.booking-card[data-id="${b.id}"]`);
            $card.find('.bc-chat-messages').html(buildBubbles(b.discussion));
        });

        // Scroll chats to bottom
        $list.find('.bc-chat').each(function () {
            const msgs = this.querySelector('.bc-chat-messages');
            if (msgs) msgs.scrollTop = msgs.scrollHeight;
        });

        // ── Queue message ──────────────────────────────────────────────────
        $list.off('click', '.js-chat-send').on('click', '.js-chat-send', async function () {
            const $card  = $(this).closest('.booking-card');
            const $input = $card.find('.bc-chat-input');
            const message    = $input.val()?.trim();
            if (!message) return;

            const bId     = $card.data('id');
            await ApiRequest.updateBooking(bId, { message })
            fetchBookings(options.page)

        });

        $list.off('keydown', '.bc-chat-input').on('keydown', '.bc-chat-input', function (e) {
            if (e.key === 'Enter') $(this).siblings('.js-chat-send').trigger('click');
        });

        // ── Status actions ─────────────────────────────────────────────────
        $list.off('click', '.js-action').on('click', '.js-action', async function () {
            const $btn    = $(this);
            const $card   = $btn.closest('.booking-card');
            const bId     = $card.data('id');
            const pending = $card.data('pending-message');
            const payload = { status: $btn.data('status') };

            const oldStatus  = $card.data('status');
            const $dot       = $card.find('.bc-status-dot');
            const $pill      = $card.find('.bc-status-pill');
            const origText   = $btn.text();

            $btn.prop('disabled', true).text('UPDATING…');

            const success = await ApiRequest.updateBooking(bId, payload);

            if (success) {
                // Update card in-place
                $card.data('status', status).attr('data-status', status);
                $dot.removeClass(`status-${oldStatus}`).addClass(`status-${status}`);
                $pill.removeClass(`status-pill-${oldStatus}`).addClass(`status-pill-${status}`).text(status);
                $card.css('outline', '2px solid var(--accent-yellow)');
                setTimeout(() => $card.css('outline', ''), 1500);
                $card.removeData('pending-message');
                $card.find('.js-action').prop('disabled', false);
                $btn.text(origText);

                // Optimistic chat bubble
                if (pending) {
                    const $msgs = $card.find('.bc-chat-messages');
                    $msgs.find('.bc-chat-empty').remove();
                    $msgs.append(`<div class="bc-bubble bc-bubble--staff">
                        <span class="bc-bubble-author">You</span>
                        <p class="bc-bubble-text">${pending}</p>
                        <span class="bc-bubble-time">Just now</span>
                    </div>`);
                    $msgs[0].scrollTop = $msgs[0].scrollHeight;
                    $card.find('.bc-chat-input').val('').prop('disabled', false);
                    $card.find('.js-chat-send').prop('disabled', false);
                }
            } else {
                $dot.removeClass(`status-${status}`).addClass(`status-${oldStatus}`);
                $pill.removeClass(`status-pill-${status}`).addClass(`status-pill-${oldStatus}`).text(oldStatus);
                $btn.prop('disabled', false).text(origText);
            }
        });
    };

    // ── Filter button ───────────────────────────────────────────────────────
    $(document).off('click', '#apply-filters').on('click', '#apply-filters', (e) => {
        e.preventDefault();
        fetchBookings(1);
    });

    fetchBookings(options.page);
}