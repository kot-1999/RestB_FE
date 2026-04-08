import ApiRequest from "../utils/ApiRequest.js";
import Mustache from "../utils/mustache.js";

// ─── Booking Card Template ────────────────────────────────────────────────────
const BOOKING_CARD_TEMPLATE = `
<div class="booking-card" data-id="{{id}}" data-status="{{status}}">

    <!-- ── HEADER: name, ref, status pill ─────────────────────────────────── -->
    <div class="bc-header">
        <div class="bc-header-left">
            <span class="bc-status-dot status-{{status}}"></span>
            <div>
                <h2 class="bc-name">{{customerName}}</h2>
                <span class="bc-ref">#{{id}}</span>
            </div>
        </div>
        <span class="bc-status-pill status-pill-{{status}}">{{status}}</span>
    </div>

    <!-- ── META: date / time / guests / contact ───────────────────────────── -->
    <div class="bc-meta">
        <div class="bc-meta-row">
            <div class="bc-meta-item">
                <i class="fas fa-calendar-alt"></i>
                <span>{{formattedDate}}</span>
            </div>
            <div class="bc-meta-item">
                <i class="fas fa-clock"></i>
                <span>{{formattedStartTime}} – {{formattedEndTime}}</span>
            </div>
            <div class="bc-meta-item">
                <i class="fas fa-users"></i>
                <span>{{numGuests}} Guests</span>
            </div>
        </div>
        <div class="bc-meta-row">
            <div class="bc-meta-item">
                <i class="fas fa-envelope"></i>
                <span>{{customerEmail}}</span>
            </div>
            <div class="bc-meta-item">
                <i class="fas fa-phone"></i>
                <span>{{customerPhone}}</span>
            </div>
        </div>
    </div>

    <!-- ── CHAT ───────────────────────────────────────────────────────────── -->
    <div class="bc-chat">
        <div class="bc-chat-messages"></div>
        <div class="bc-chat-input-row">
            <input type="text" class="bc-chat-input" placeholder="Type a message… send with a status button below">
            <button class="bc-chat-send js-chat-send" title="Queue message">&#9658;</button>
        </div>
        <div class="bc-chat-queued" style="display:none;">
            &#10003; Message queued — click a status button to send.
        </div>
    </div>

    <!-- ── ACTIONS ────────────────────────────────────────────────────────── -->
    <div class="bc-actions">
        <button class="bc-btn bc-btn-confirm  js-action" data-status="Approved">CONFIRM</button>
        <button class="bc-btn bc-btn-decline  js-action" data-status="Cancelled">DECLINE</button>
        <button class="bc-btn bc-btn-complete js-action" data-status="Completed">COMPLETE</button>
        <button class="bc-btn bc-btn-noshow   js-action" data-status="NoShow">NO SHOW</button>
    </div>

</div>`;

// ─── Data mapper ──────────────────────────────────────────────────────────────
function mapBookingToView(b) {
    const time = new Date(b.bookingTime);
    const ok   = !isNaN(time);

    return {
        id:                 b.id,
        status:             b.status,
        customerName:       `${b.user?.firstName || 'Guest'} ${b.user?.lastName || ''}`.trim(),
        customerEmail:      b.user?.email  || 'No email',
        customerPhone:      b.user?.phone  || 'No phone',
        numGuests:          b.guestsNumber || 0,
        formattedDate:      ok ? time.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A',
        formattedStartTime: ok ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A',
        formattedEndTime:   ok && b.duration
            ? new Date(time.getTime() + b.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : 'N/A',
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
export default async function loadBookings() {
    const $list = $("#bookings-list");
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const restaurantID = params.get("id");

    if (!restaurantID) {
        return $list.html('<p class="bc-state-msg">No restaurant selected.</p>');
    }

    const $fromInput   = $("#filter-from");
    const $toInput     = $("#filter-to");
    const $statusInput = $("#filter-status");

    // Default to today
    if (!$fromInput.val()) {
        const today = new Date().toISOString().split('T')[0];
        $fromInput.val(today);
        $toInput.val(today);
    }

    // ── Brand component ─────────────────────────────────────────────────────
    function updateBrandComponent(restaurant) {
        if (!restaurant?.brand) return;
        const name = restaurant.brand.name || "Unknown Brand";
        const logo = restaurant.brand.logoURL || "/assets/img/default-avatar.png";
        const nameEl = document.querySelector('.dash-brand-name');
        const imgEl  = document.querySelector('.js-brand-img');
        if (nameEl) nameEl.textContent = name;
        if (imgEl)  { imgEl.src = logo; imgEl.alt = name; }
    }

    // ── Fetch & render ──────────────────────────────────────────────────────
    const fetchBookings = async () => {
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
            page:  1,
            limit: 50
        };

        const selectedStatus = $statusInput.val();
        if (selectedStatus) query.statuses = [selectedStatus];

        let res;
        try {
            res = await ApiRequest.getBookings(query, restaurantID);
        } catch (err) {
            $list.html('<p class="bc-state-msg bc-state-msg--error">Failed to load bookings. Please refresh and try again.</p>');
            return;
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
            updateBrandComponent(res.restaurant);
        } else if (res.bookings[0]?.restaurant) {
            updateBrandComponent(res.bookings[0].restaurant);
        }

        if (count === 0) {
            $list.html('<p class="bc-state-msg">No bookings found for the selected filters.</p>');
            return;
        }

        // Render cards
        const cardsHtml = res.bookings
            .map(b => Mustache.render(BOOKING_CARD_TEMPLATE, mapBookingToView(b)))
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
        $list.off('click', '.js-chat-send').on('click', '.js-chat-send', function () {
            const $card  = $(this).closest('.booking-card');
            const $input = $card.find('.bc-chat-input');
            const msg    = $input.val()?.trim();
            if (!msg) return;
            $card.data('pending-message', msg);
            $input.prop('disabled', true);
            $(this).prop('disabled', true);
            $card.find('.bc-chat-queued').show();
        });

        $list.off('keydown', '.bc-chat-input').on('keydown', '.bc-chat-input', function (e) {
            if (e.key === 'Enter') $(this).siblings('.js-chat-send').trigger('click');
        });

        // ── Status actions ─────────────────────────────────────────────────
        $list.off('click', '.js-action').on('click', '.js-action', async function () {
            const $btn    = $(this);
            const $card   = $btn.closest('.booking-card');
            const status  = $btn.data('status');
            const bId     = $card.data('id');
            const pending = $card.data('pending-message');
            const payload = { status };
            if (pending) payload.message = pending;

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
                    $card.find('.bc-chat-queued').hide();
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
        fetchBookings();
    });

    fetchBookings();
}