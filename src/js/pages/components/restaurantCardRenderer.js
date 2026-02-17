import Mustache from '../../utils/mustache.js';

// Restaurant card template as a string
const restaurantCardTemplate = `
<div class="restaurant-card">
    <div class="restaurant-banner">
        <img src="{{restaurant.bannerURL}}" alt="{{restaurant.name}}">
    </div>
    <div class="restaurant-content">
        <h3 class="restaurant-name">{{restaurant.name}}</h3>
        <p class="restaurant-description">{{restaurant.description}}</p>
        <div class="restaurant-brand">
            <img class="brand-logo" src="{{restaurant.brand.logoURL}}" alt="{{restaurant.brand.name}}">
            <span class="brand-name">{{restaurant.brand.name}}</span>
        </div>
        <div class="restaurant-address">
            <span class="address">{{restaurant.address.building}} {{restaurant.address.street}}, {{restaurant.address.city}}</span>
            <span class="postcode">{{restaurant.address.postcode}}</span>
        </div>
        <div class="restaurant-availability">
            <span class="available-date">Available: {{restaurant.availability.date}}</span>
            <span class="guest-limit">Up to {{restaurant.availability.autoConfirmGuestsLimit}} guests</span>
        </div>
    </div>
</div>
`;

export function renderRestaurantCard(restaurant) {
    return Mustache.render(restaurantCardTemplate, { restaurant });
}

export function renderRestaurantCards(restaurants) {
    if (!restaurants || restaurants.length === 0) {
        return '<p>No restaurants found</p>';
    }
    
    return restaurants.map(restaurant => renderRestaurantCard(restaurant)).join('');
}