import ApiRequest from "../utils/ApiRequest.js";

export default async function () {
    const restaurants = await ApiRequest.getBookingSummaries()

    console.log('Bookings Manage', restaurants)
}