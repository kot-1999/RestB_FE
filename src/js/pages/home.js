import ApiRequest from '../utils/ApiRequest.js';

export default async function () {
    console.log('Loading home page...');
    
    // Fetch restaurants when home page loads
    const result = await ApiRequest.getRestaurants();
    
    if (result && result.success) {
        console.log('Restaurants call success:', result.data);
        // You can now use result.data to display restaurants
        renderRestaurants(result.data);
    } else {
        console.error('Restaurants call failed');
    }
}

function renderRestaurants(restaurants) {
    // TODO: Add code to render restaurants on the page
    console.log(`Found ${restaurants.length} restaurants to display`);
    
    // Example: Log each restaurant name
    restaurants.forEach(restaurant => {
        console.log(`- ${restaurant.name}: ${restaurant.description}`);
    });
}