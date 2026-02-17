import { renderRestaurantCards } from './components/restaurantCardRenderer.js';
import { mockResponses } from '../utils/mockData.js';

export default async function () {
    console.log('Loading home page...');
    
    // Use mock data directly
    const restaurants = mockResponses.getRestaurants();
    
    // Render restaurants
    $('.restaurants-container').html(renderRestaurantCards(restaurants));
}