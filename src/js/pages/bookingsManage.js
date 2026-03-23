import Mustache from "../utils/mustache.js";
import ApiRequest from "../utils/ApiRequest.js";
import {Template} from "../config.js";

export default async function loadBookingsManage() {
    const restaurantList = document.getElementById("restaurant-list");

    // Fetch restaurants with daily summary
    const response = await ApiRequest.getBookingSummaries({ page: 1, limit: 20 });
    const restaurantBookingCard = Template.component.restaurantBookingCard()
    // TODO move to restaurantBookingCard.pug
    if (response && response.restaurants && response.restaurants.length > 0) {
        const template = `
            {{#restaurants}}
            <div class="manage-bookings-grid-item">
                <a href="/#bookings?id={{id}}" class="restaurant-card">
                    <div class="restaurant-banner">
                        <img src="{{bannerURL}}" onerror="this.src='https://picsum.photos/seed/{{id}}/400/400'"/>
                        <div class="restaurant-overlay">
                            <span class="restaurant-cta">Manage Bookings</span>
                        </div>
                    </div>
                    <div class="restaurant-content">
                        <span class="restaurant-badge">{{brandName}}</span>
                        <h3 class="restaurant-name">{{name}}</h3>
                        
                        <div class="restaurant-details">
                            <div class="restaurant-detail-row">
                                <span class="detail-label">Today's Bookings</span>
                                <span class="detail-value">{{todaySummary.totalPendingBookings}} Pending / {{todaySummary.totalApprovedAndConfirmedBookings}} Approved</span>
                            </div>
                            <div class="restaurant-detail-row">
                                <span class="detail-label">Location</span>
                                <span class="detail-value">{{address.city}}, {{address.street}}</span>
                            </div>
                        </div>
                    </div>
                </a>
            </div>
            {{/restaurants}}
        `;

        // Prepare data for rendering
        const today = new Date().toISOString().split("T")[0];
        const data = {
            restaurants: response.restaurants.map(r => {
                const todaySummary = r.bookingsDailySummaries?.[today] || {
                    totalPendingBookings: 0,
                    totalApprovedAndConfirmedBookings: 0,
                    totalGuests: 0
                };

                return {
                    ...r,
                    brandName: response.brand?.name || "Independent",
                    todaySummary: todaySummary
                };
            })
        };

        restaurantList.innerHTML = Mustache.render(template, data);
    } else {
        restaurantList.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="empty-state p-5">
                    <p class="text-white mb-0">No restaurants found in your management console.</p>
                </div>
            </div>
        `;
    }
}