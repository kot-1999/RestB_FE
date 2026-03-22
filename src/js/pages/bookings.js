import Mustache from "../utils/mustache.js";
import ApiRequest from "../utils/ApiRequest.js";
import {BookingStatus} from "../utils/enums.js";

export default async function loadMyBookings() {
    const hash = window.location.hash

    const queryString = hash.includes('?')
        ? hash.substring(hash.indexOf('?'))
        : ''

    const params = new URLSearchParams(queryString)

    const restaurantID = params.get('id')

    const bookings = await ApiRequest.getBookings({
        // dateFrom: new Date(),
        // dateTo: new Date(),
        statuses: [BookingStatus.Cancelled, BookingStatus.Approved, BookingStatus.Pending, BookingStatus.Completed, BookingStatus.NoShow],
        page: 1,
        limit: 20
    }, restaurantID ?? undefined)

    console.log(bookings)
}