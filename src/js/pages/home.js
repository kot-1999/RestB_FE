import ApiRequest from "../utils/ApiRequest.js";
import Mustache from "../utils/mustache.js";
import { Template } from "../config.js";

export default async function () {
    console.log('Loading home page restaurants...');

    const container = document.querySelector('.restaurants-container');
    const loading = document.querySelector('.restaurants-loading');
    const filtersForm = document.querySelector('.home-search') || document.querySelector('.home-filters');

    if (!container || !loading || !filtersForm) return;

    // Helper function to fetch & render restaurants
    async function loadRestaurants(query = {}) {
        loading.style.display = 'block';
        container.innerHTML = ''; // clear previous cards

        try {
            const res = await ApiRequest.getRestaurants(query);

            if (!res?.restaurants || !res.restaurants.length) {
                container.innerHTML = '<p>No restaurants found.</p>';
                return;
            }

            const template = Template.component.restaurantCard();

            res.restaurants.forEach((restaurant) => {
                container.insertAdjacentHTML('beforeend', Mustache.render(template, restaurant));
            });

        } catch (err) {
            console.error('Failed to load restaurants:', err);
            container.innerHTML = '<p>Error loading restaurants.</p>';
        } finally {
            loading.style.display = 'none';
        }
    }

    // Initial load
    loadRestaurants();

    // Collect filter values
    function getFilters() {
        return {
            q: document.querySelector('#q')?.value || '',
            sort: document.querySelector('#sort')?.value || '',
            distance: document.querySelector('#distance')?.value || '',
            date: document.querySelector('#date')?.value || '',
            category: document.querySelector('#category')?.value || ''
        };
    }

    // Update restaurants whenever a filter changes
    ['#q', '#sort', '#distance', '#date', '#category'].forEach((selector) => {
        const el = document.querySelector(selector);
        if (!el) return;

        el.addEventListener('change', () => loadRestaurants(getFilters()));
        el.addEventListener('keyup', (e) => {
            if (selector === '#q') loadRestaurants(getFilters());
        });
    });

    // Optional: handle search form submit
    const searchForm = document.querySelector('.home-search');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault();
            loadRestaurants(getFilters());
        });
    }
};

// Haversine formula
function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2-lat1) * Math.PI/180;
  const dLon = (lon2-lon1) * Math.PI/180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Get user location
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(position => {
    const userLat = position.coords.latitude;
    const userLng = position.coords.longitude;

    document.querySelectorAll('.restaurant-card').forEach(card => {
      const lat = parseFloat(card.dataset.lat);
      const lng = parseFloat(card.dataset.lng);
      const distance = getDistanceFromLatLonInKm(userLat, userLng, lat, lng);
      card.querySelector('.distance').textContent = `${distance.toFixed(1)} km away`;
    });
  });
}