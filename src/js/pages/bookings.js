import ApiRequest from "../utils/ApiRequest.js";
import Mustache from "../utils/mustache.js";

// ─── Booking Card Template (mirrors bookingCard.pug) ─────────────────────────
// This string is the compiled output of bookingCard.pug.
// Mustache {{}} tokens are injected at render time.
const BOOKING_CARD_TEMPLATE = `
<div class="booking-slick-row" data-id="{{id}}" data-status="{{status}}">
    <div class="booking-content-wrap">
        <div class="booking-header">
            <div class="header-top-row">
                <span class="status-indicator status-{{status}}"></span>
                <span class="res-ref-tag">#{{id}}</span>
            </div>
            <h2 class="res-name">{{customerName}}</h2>
        </div>
        <div class="booking-meta-row">
            <div class="meta-item"><i class="fas fa-calendar"></i><span>{{formattedDate}}</span></div>
            <div class="meta-item"><i class="fas fa-clock"></i><span>{{formattedStartTime}} - {{formattedEndTime}}</span></div>
            <div class="meta-item"><i class="fas fa-users"></i><span>{{numGuests}} Guests</span></div>
            <div class="meta-item"><i class="fas fa-envelope"></i><span>{{customerEmail}}</span></div>
            <div class="meta-item"><i class="fas fa-phone"></i><span>{{customerPhone}}</span></div>
            <div class="meta-item"><i class="fas fa-info-circle"></i><span class="status-text">{{status}}</span></div>
        </div>
    </div>

    <div class="messaging-section">
        <div class="chat-window">
            <div class="chat-messages"></div>
            <div class="chat-input-wrap">
                <input type="text" class="chat-input" placeholder="Type a message... (send with a status action below)">
                <button class="chat-send-btn" title="Queue message — then click a status button to send">&#9658;</button>
            </div>
            <div class="chat-queued-notice" style="display:none; color: var(--accent-yellow); font-size: 0.75rem; padding: 4px 8px;">
                &#10003; Message queued — click a status button below to send it.
            </div>
        </div>
    </div>

    <div class="actions-container">
        <button class="slick-manage-btn js-action" data-status="Approved">CONFIRM</button>
        <button class="slick-manage-btn btn-outline-danger js-action" data-status="Cancelled">DECLINE</button>
        <button class="slick-manage-btn js-action" data-status="Completed">COMPLETE</button>
        <button class="slick-manage-btn js-action" data-status="NoShow">NO SHOW</button>
    </div>
</div>`;

// ─── Data mapper: API booking → Mustache view object ─────────────────────────
function mapBookingToView(b) {
    const time = new Date(b.bookingTime);
    const isValidTime = !isNaN(time);

    const formattedDate = isValidTime
        ? time.toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })
        : 'N/A';

    const formattedStartTime = isValidTime
        ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'N/A';

    const formattedEndTime = b.duration && isValidTime
        ? new Date(time.getTime() + b.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : 'N/A';

    return {
        id:               b.id,
        status:           b.status,
        customerName:     `${b.user?.firstName || 'Guest'} ${b.user?.lastName || ''}`.trim(),
        customerEmail:    b.user?.email    || 'No email provided',
        customerPhone:    b.user?.phone    || 'No phone provided',
        numGuests:        b.guestsNumber   || 0,
        formattedDate,
        formattedStartTime,
        formattedEndTime,
        _discussion:      b.discussion || [],  // kept for post-render injection
    };
}

// ─── Main export ─────────────────────────────────────────────────────────────
export default async function loadBookings() {
    const $list = $("#bookings-list");
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const restaurantID = params.get("id");

    if (!restaurantID) {
        return $list.html('<p class="text-center text-white">No restaurant selected.</p>');
    }

    const $fromInput   = $("#filter-from");
    const $toInput     = $("#filter-to");
    const $statusInput = $("#filter-status");

    // Default date range to today
    if (!$fromInput.val()) {
        const today = new Date().toISOString().split('T')[0];
        $fromInput.val(today);
        $toInput.val(today);
    }

    // ── Brand component helper ──────────────────────────────────────────────
    function updateBrandComponent(restaurant) {
        if (!restaurant?.brand) return;
        const brandName = restaurant.brand.name || "Unknown Brand";
        const brandLogo = restaurant.brand.logoURL || "/assets/img/default-avatar.png";

        const brandNameEl = document.querySelector('.dash-brand-name');
        const brandImgEl  = document.querySelector('.js-brand-img');

        if (brandNameEl) brandNameEl.textContent = brandName;
        if (brandImgEl) {
            brandImgEl.src = brandLogo;
            brandImgEl.alt = brandName;
        }
    }

    // ── Fetch & render bookings ─────────────────────────────────────────────
    const fetchBookings = async () => {
        // Fix 1: Guard against empty date inputs
        const fromVal = $fromInput.val();
        const toVal   = $toInput.val();
        if (!fromVal || !toVal) {
            $list.html('<p class="text-center text-muted py-5">Please select a date range and try again.</p>');
            return;
        }

        // Fix 3: Show loading state
        $list.html('<p class="text-center text-muted py-5">Loading bookings...</p>');

        const query = {
            dateFrom: fromVal + "T00:00:00.000Z",
            dateTo:   toVal   + "T23:59:59.999Z",
            page:  1,
            limit: 50
        };

        const selectedStatus = $statusInput.val();
        if (selectedStatus) query.statuses = [selectedStatus];

        // Fix 2: Wrap in try/catch for error state
        let res;
        try {
            res = await ApiRequest.getBookings(query, restaurantID);
        } catch (err) {
            $list.html('<p class="text-center text-danger py-5">Failed to load bookings. Please refresh and try again.</p>');
            return;
        }
        if (!res?.bookings) {
            $list.html('<p class="text-center text-danger py-5">Failed to load bookings. Please refresh and try again.</p>');
            return;
        }

        // Update page title with booking count badge
        const count = res.bookings.length;
        $("#dashboardTitle").html(
            `Bookings for <span style="color:var(--accent-white)">${res.restaurant?.name || ''}</span> <span style="font-size:0.65em; background:var(--accent-yellow); color:#000; border-radius:4px; padding:2px 8px; vertical-align:middle; font-weight:700;">${count}</span>`
        );

        // Update brand component
        if (res.restaurant) {
            updateBrandComponent(res.restaurant);
        } else if (res.bookings.length > 0 && res.bookings[0].restaurant) {
            updateBrandComponent(res.bookings[0].restaurant);
        }

        if (res.bookings.length === 0) {
            $list.html('<p class="text-center text-muted py-5">No bookings found for the selected filters.</p>');
            return;
        }

        // Render each booking card using Mustache
        const cardsHtml = res.bookings
            .map(b => Mustache.render(BOOKING_CARD_TEMPLATE, mapBookingToView(b)))
            .join('');

        $list.html(cardsHtml);

        // Inject chat bubbles into each card (post-render, avoids Pug/Mustache escaping issues)
        res.bookings.forEach(b => {
            const $card = $list.find(`.booking-slick-row[data-id="${b.id}"]`);
            const $msgs = $card.find('.chat-messages');
            const discussion = b.discussion || [];
            if (discussion.length === 0) {
                $msgs.html('<p class="chat-empty">No messages yet.</p>');
                return;
            }
            const bubblesHtml = discussion.map(msg => {
                const isCustomer = msg.authorType === 'user';
                const authorName = `${msg.firstName || (isCustomer ? 'Customer' : 'Admin')} ${msg.lastName || ''}`.trim();
                const messageTime = new Date(msg.createdAt).toLocaleString([], {
                    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                });
                return `<div class="chat-bubble ${isCustomer ? 'customer' : 'admin'}">
                    <div class="chat-bubble-author">${authorName}</div>
                    <p>${msg.message}</p>
                    <span class="chat-bubble-time">${messageTime}</span>
                </div>`;
            }).join('');
            $msgs.html(bubblesHtml);
        });

        // Scroll all chat windows to the bottom
        $list.find('.chat-window').each(function () {
            this.scrollTop = this.scrollHeight;
        });

        // ── Queue message on send button click ─────────────────────────────
        $list.off('click', '.chat-send-btn').on('click', '.chat-send-btn', function () {
            const $card   = $(this).closest('.booking-slick-row');
            const $input  = $card.find('.chat-input');
            const message = $input.val()?.trim();

            if (!message) return;

            $card.data('pending-message', message);
            $input.prop('disabled', true);
            $(this).prop('disabled', true);
            $card.find('.chat-queued-notice').show();
        });

        // Allow queuing with Enter key
        $list.off('keydown', '.chat-input').on('keydown', '.chat-input', function (e) {
            if (e.key === 'Enter') {
                $(this).siblings('.chat-send-btn').trigger('click');
            }
        });

        // ── Status action buttons ───────────────────────────────────────────
        $list.off('click', '.js-action').on('click', '.js-action', async function () {
            const $btn   = $(this);
            const $card  = $btn.closest('.booking-slick-row');
            const status = $btn.data('status');
            const bId    = $card.data('id');

            const pendingMessage = $card.data('pending-message');
            const payload = { status };
            if (pendingMessage) payload.message = pendingMessage;

            const oldStatus  = $card.find('.status-text').text();
            const $indicator = $card.find('.status-indicator');
            $card.find('.status-text').text(status);
            $indicator.removeClass(`status-${oldStatus}`).addClass(`status-${status}`);

            const originalBtnText = $btn.text();
            $btn.prop('disabled', true).text('UPDATING...');

            const success = await ApiRequest.updateBooking(bId, payload);

            if (success) {
                // Fix 5: Update card in-place instead of re-fetching the whole list
                $card.removeData('pending-message');
                $card.attr('data-status', status);
                $card.css('border-color', 'var(--accent-yellow)');
                $card.find('.status-text').text(status);
                $indicator
                    .removeClass(`status-${oldStatus}`)
                    .addClass(`status-${status}`);
                // Re-enable all action buttons on this card
                $card.find('.js-action').prop('disabled', false);
                $btn.text(originalBtnText);
                // If a message was sent, add it to the chat window optimistically
                if (pendingMessage) {
                    const $msgs = $card.find('.chat-messages');
                    $msgs.find('.chat-empty').remove();
                    $msgs.append(`<div class="chat-bubble admin">
                        <div class="chat-bubble-author">You</div>
                        <p>${pendingMessage}</p>
                        <span class="chat-bubble-time">Just now</span>
                    </div>`);
                    const chatWin = $card.find('.chat-window')[0];
                    if (chatWin) chatWin.scrollTop = chatWin.scrollHeight;
                    $card.find('.chat-input').val('').prop('disabled', false);
                    $card.find('.chat-send-btn').prop('disabled', false);
                    $card.find('.chat-queued-notice').hide();
                }
            } else {
                $card.find('.status-text').text(oldStatus);
                $indicator.removeClass(`status-${status}`).addClass(`status-${oldStatus}`);
                $btn.prop('disabled', false).text(originalBtnText);
            }
        });
    };

    // ── Filter button ───────────────────────────────────────────────────────
    $(document).off('click', '#apply-filters').on('click', '#apply-filters', (e) => {
        e.preventDefault();
        fetchBookings();
    });

    // Initial load
    fetchBookings();
}