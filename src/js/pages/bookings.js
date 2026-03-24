import ApiRequest from "../utils/ApiRequest.js";

const template = (b) => {
    const time = new Date(b.bookingTime);
    const start = !isNaN(time) ? time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';
    const end = b.duration && !isNaN(time) ? new Date(time.getTime() + b.duration * 60000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A';

    const guestCount = b.guestsNumber || 0;
    const userMsgs = (b.discussion || []).filter(m => m.authorType === 'user');
    const adminMsgs = (b.discussion || []).filter(m => m.authorType === 'admin');

    const msg = (label, content, box, isSent, isEditable) => `
        <div class="message-box ${isSent ? 'sent' : ''} ${isEditable ? 'admin-message' : 'user-message'}" data-box="${box}">
            <div class="message-label">${label}</div>
            ${isEditable && !isSent ?
        `<textarea class="message-input" placeholder="Type your reply...">${content || ''}</textarea>` :
        `<div class="message-content">${content || 'No message provided.'}</div>`
    }
        </div>`;

    return `
    <div class="booking-slick-row" data-id="${b.id}">
        <div class="booking-content-wrap">
            <div class="booking-header">
                <div class="header-top-row">
                    <span class="status-indicator status-${b.status}"></span>
                    <span class="res-ref-tag">#${b.id}</span>
                </div>
                <h2 class="res-name">${b.user?.firstName || 'Guest'} ${b.user?.lastName || ''}</h2>
            </div>
            <div class="booking-meta-row">
                <div class="meta-item"><i class="fas fa-clock"></i><span>${start} - ${end}</span></div>
                <div class="meta-item"><i class="fas fa-users"></i><span>${guestCount} Guests</span></div>
                <div class="meta-item"><i class="fas fa-envelope"></i><span>${b.user?.email || 'No email provided'}</span></div>
                <div class="meta-item"><i class="fas fa-info-circle"></i><span class="status-text">${b.status}</span></div>
            </div>
        </div>
        <div class="messaging-section">
            <div class="message-grid-container">
                ${msg('Customer Request', userMsgs[0]?.message, 1, !!userMsgs[0], false)}
                ${msg('Your First Reply', adminMsgs[0]?.message, 2, !!adminMsgs[0], true)}
                ${msg('Customer Response', userMsgs[1]?.message, 3, !!userMsgs[1], false)}
                ${msg('Your Second Reply', adminMsgs[1]?.message, 4, !!adminMsgs[1], true)}
            </div>
        </div>
        <div class="actions-container">
            <button class="slick-manage-btn js-action" data-status="Approved">CONFIRM</button>
            <button class="slick-manage-btn btn-outline-danger js-action" data-status="Cancelled">DECLINE</button>
            <button class="slick-manage-btn js-action" data-status="Completed">COMPLETE</button>
            <button class="slick-manage-btn js-action" data-status="NoShow">NO SHOW</button>
        </div>
    </div>`;
};

export default async function loadBookings() {
    const $list = $("#bookings-list");
    const params = new URLSearchParams(window.location.hash.split("?")[1]);
    const restaurantID = params.get("id");

    if (!restaurantID) return $list.html('<p class="text-center text-white">No restaurant selected.</p>');

    const $fromInput = $("#filter-from");
    const $toInput = $("#filter-to");
    const $statusInput = $("#filter-status");

    if (!$fromInput.val()) {
        const today = new Date().toISOString().split('T')[0];
        $fromInput.val(today);
        $toInput.val(today);
    }

    const fetchBookings = async () => {
        const query = {
            dateFrom: new Date($fromInput.val() + "T00:00:00").toISOString(),
            dateTo: new Date($toInput.val() + "T23:59:59").toISOString(),
            page: 1,
            limit: 50,
            statuses: []
        };

        const selectedStatus = $statusInput.val();
        if (selectedStatus) {
            query.statuses = [selectedStatus];
        }

        const res = await ApiRequest.getBookings(query, restaurantID);

        if (res?.bookings) {
            $("#dashboardTitle").html(`Bookings for <span style="color:var(--accent-white)">${res.restaurant?.name || ''}</span>`);

            if (res.bookings.length > 0) {
                $list.empty().append(res.bookings.map(b => template(b)));

                $list.off('click', '.js-action').on('click', '.js-action', async function() {
                    const $btn = $(this), $card = $btn.closest('.booking-slick-row'), status = $btn.data('status'), bId = $card.data('id');
                    const $activeBox = $card.find('.admin-message:not(.sent)').first(), msg = $activeBox.find('textarea').val()?.trim();

                    if (status === 'Cancelled' && !msg) return alert('Message required to decline.');

                    const oldStatus = $card.find('.status-text').text();
                    const $indicator = $card.find('.status-indicator');
                    $card.find('.status-text').text(status);
                    $indicator.removeClass(`status-${oldStatus}`).addClass(`status-${status}`);

                    const originalBtnText = $btn.text();
                    $btn.prop('disabled', true).text('UPDATING...');

                    if (msg && $activeBox.length) {
                        $activeBox.addClass('sent').find('textarea').prop('disabled', true);
                    }

                    const updateData = { status };
                    if (msg) updateData.message = msg;

                    const success = await ApiRequest.updateBooking(bId, updateData);

                    if (success) {
                        $card.css('border-color', 'var(--accent-yellow)');
                        setTimeout(() => fetchBookings(), 600);
                    } else {
                        alert('Update failed. Reverting changes.');
                        $card.find('.status-text').text(oldStatus);
                        $indicator.removeClass(`status-${status}`).addClass(`status-${oldStatus}`);
                        $btn.prop('disabled', false).text(originalBtnText);
                        if (msg && $activeBox.length) {
                            $activeBox.removeClass('sent').find('textarea').prop('disabled', false);
                        }
                    }
                });
            } else {
                $list.html('<p class="text-center text-muted py-5">No bookings found for the selected filters.</p>');
            }
        }
    };

    $("#apply-filters").off('click').on('click', (e) => {
        e.preventDefault();
        fetchBookings();
    });

    fetchBookings();
}