import Mustache from "../utils/mustache.js";
import ApiRequest from "../utils/ApiRequest.js";
import {Template} from "../config.js";

export default async function loadBookingsManage() {
    const restaurantList = document.getElementById("restaurant-list");

    const response = await ApiRequest.getBookingSummaries({ page: 1, limit: 20 });

    $('#brand-container').replaceWith(Mustache.render(Template.component.brandCard(), response.brand));
    $('#booking-items').empty();

    if (response && response.restaurants && response.restaurants.length > 0) {
        const template = `
            {{#restaurants}}
            <div class="manage-bookings-grid-item">
                <a href="/#bookings?id={{id}}" class="restaurant-card">
                    <div class="restaurant-banner">
                        <img src="{{bannerURL}}" onerror="this.src='/assets/img/default-banner.png'"/>
                        <div class="restaurant-overlay">
                            <span class="restaurant-cta">Manage Bookings</span>
                        </div>
                    </div>
                    <div class="restaurant-content">
                        <h3 class="restaurant-name">{{name}}</h3>
                        <div class="restaurant-details">
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

        const data = {
            restaurants: response.restaurants.map(r => {
                // bookingsDailySummaries is a flat object with totalPendingBookings etc.
                const summary = r.bookingsDailySummaries || {};

                return {
                    ...r,
                    todayPending:  summary.totalPendingBookings || 0,
                    todayApproved: summary.totalApprovedAndConfirmedBookings || 0
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