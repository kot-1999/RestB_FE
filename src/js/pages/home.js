// home.js
import ApiRequest from "../utils/ApiRequest.js";
import Mustache from "../utils/mustache.js";
import { Template } from "../config.js";

export default async function () {
    console.log('Loading home page...');

    const res = await ApiRequest.getRestaurants();

    const restaurantCardTemplate = Template.component.restaurantCard(); // string template

    res.restaurants.forEach((restaurant) => {
        $('.restaurants-container').append(Mustache.render(restaurantCardTemplate, restaurant));
    });
}