import Mustache from "../utils/mustache.js";
import ApiRequest from "../utils/ApiRequest.js";
import Template from "../utils/Template.js";
import renderPagination from "./components/pagination.js";
import {renderHeaderWithBrand} from "../utils/helpers.js";

export default async function loadBookingsManage(options = { page: 1 }) {
    const restaurantList =$("#restaurant-list");

    const response = await ApiRequest.getBookingSummaries({ page: options.page, limit: 9 });


    restaurantList.empty();
    renderPagination(response.pagination, loadBookingsManage)
    renderHeaderWithBrand(response.brand, 'Bookings Manage', 'Select a restaurant to manage its bookings.')
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