import Mustache from "../utils/mustache.js";
import ApiRequest from "../utils/ApiRequest.js";
import Template from "../utils/Template.js";

export default async function loadBookingsManage() {
    const restaurantList =$("#restaurant-list");

    const response = await ApiRequest.getBookingSummaries({ page: 1, limit: 20 });

    $('#brand-container').replaceWith(Mustache.render(Template.component.brandCard(), response.brand));
    restaurantList.empty();

    if (response && response.restaurants && response.restaurants.length > 0) {
        const template = Template.component.restaurantBookingCard()
        response.restaurants.forEach((restaurant) => {

            restaurantList.append(Mustache.render(template, {
                ...restaurant,
                approvedLabel: restaurant.bookingsDailySummaries.totalApprovedAndConfirmedBookings === 1 ? 'Booking' : 'Bookings',
                pendingLabel: restaurant.bookingsDailySummaries.totalPendingBookings === 1 ? 'Booking' : 'Bookings',
                guestLabel: restaurant.bookingsDailySummaries.totalGuests === 1 ? 'Guest' : 'Guests'
            }))
        })
    } else {
        restaurantList.replaceWith(`
            <div class="col-12 text-center py-5">
                <div class="empty-state p-5">
                    <p class="text-white mb-0">No restaurants found in your management console.</p>
                </div>
            </div>
        `)
    }
}