import ApiRequest from '../utils/ApiRequest.js';
import {renderHeaderWithBrand} from "../utils/helpers.js";

export default function () {
  initializeRestaurantDetails();

  function getRestaurantIdFromUrl() {
    const hash = window.location.hash || '';
    const queryString = hash.includes('?') ? hash.split('?')[1] : '';
    const params = new URLSearchParams(queryString);
    return params.get('id');
  }

  function buildAddress(address = {}) {
    const parts = [
      address.building,
      address.street,
      address.city,
      address.postcode,
      address.country
    ].filter(Boolean);

    return parts.length ? parts.join(', ') : 'Location unavailable';
  }

  function buildHours(restaurant = {}) {
    const from = restaurant.timeFrom || '--:--';
    const to = restaurant.timeTo || '--:--';
    return `${from} to ${to}`;
  }

  function renderGallery(restaurant) {
    const $gallery = $('#rb-gallery-grid');
    $gallery.empty();

    const photos = Array.isArray(restaurant.photosURL) ? restaurant.photosURL : [];
    const fallback = restaurant.bannerURL ? [restaurant.bannerURL] : [];
    const images = photos.length ? photos : fallback;

    if (!images.length) {
      $gallery.html(`
        <div class="rb-gallery-empty">
          <p>No gallery images available yet.</p>
        </div>
      `);
      return;
    }

    images.forEach((url, index) => {
      $gallery.append(`
        <a class="rb-shot" href="${url}" target="_blank" rel="noopener noreferrer">
          <img src="${url}" alt="${restaurant.name || 'Restaurant'} image ${index + 1}">
        </a>
      `);
    });
  }

  function renderRestaurantDetails(restaurant, brand = null) {

    renderHeaderWithBrand(restaurant.brand, restaurant.name, restaurant.description ?? 'No description available.')

    $('#rb-brand').text(
        brand?.name || restaurant.brand?.name || 'Unknown brand'
    );

    $('#rb-location').text(buildAddress(restaurant.address));

    $('#rb-categories').text(
        Array.isArray(restaurant.categories) && restaurant.categories.length
            ? restaurant.categories.join(', ')
            : 'No categories listed'
    );

    $('#rb-hours').text(buildHours(restaurant));

    $('#rb-banner')
        .attr('src', restaurant.bannerURL || '/assets/img/restaurant2.jpg')
        .attr('alt', restaurant.name || 'Restaurant banner');

    renderGallery(restaurant);
  }

  function renderErrorState(message = "We couldn't load this restaurant right now.") {
    $('#rb-name').text('Restaurant not found');
    $('#rb-desc').text(message);
    $('#rb-brand').text('Unavailable');
    $('#rb-location').text('Unavailable');
    $('#rb-categories').text('Unavailable');
    $('#rb-hours').text('Unavailable');

    $('#rb-gallery-grid').html(`
      <div class="rb-gallery-empty">
        <p>Gallery unavailable.</p>
      </div>
    `);
  }

  function setupBookingForm() {
    const $date = $('#rb-date');
    const $guests = $('#rb-guests');
    const $time = $('#rb-time');
    const $btn = $('#rb-confirm');
    const $msg = $('#rb-message');

    function validateForm() {
      const isValid =
          !!$date.val() &&
          Number($guests.val()) > 0 &&
          !!$time.val()

      $btn.prop('disabled', !isValid);
    }

    $date.on('change input', validateForm);
    $guests.on('change input', validateForm);
    $time.on('change input', validateForm);

    $btn.on('click', function () {

      ApiRequest.createBooking({
        bookingTime: new Date(`${$date.val()}T${$time.val()}:00`).toISOString(),
        guestsNumber: $guests.val(),
        restaurantID: getRestaurantIdFromUrl(),
        message: $msg.val() ?? undefined
      })
    });

    validateForm();
  }

  async function initializeRestaurantDetails() {
    setupBookingForm();
    await loadRestaurantDetails();
  }

  async function loadRestaurantDetails() {
    try {
      const restaurantId = getRestaurantIdFromUrl();

      if (!restaurantId) {
        throw new Error('Missing restaurant ID');
      }

      let data = await ApiRequest.getRestaurant(restaurantId);
      let restaurant = null;
      let brand = null;

      if (data && data.id) {
        restaurant = data;
      } else if (data && data.restaurant) {
        restaurant = data.restaurant;
        brand = data.brand || data.restaurant.brand || null;
      } else {
        const listData = await ApiRequest.getRestaurants({
          page: 1,
          limit: 100
        });

        if (!listData || !Array.isArray(listData.restaurants)) {
          throw new Error('Restaurant data not available');
        }

        brand = listData.brand || null;

        restaurant = listData.restaurants.find(
            (item) => String(item.id) === String(restaurantId)
        );
      }

      if (!restaurant) {
        throw new Error('Restaurant not found');
      }

      renderRestaurantDetails(restaurant, brand);
    } catch (error) {
      console.error('Failed to load restaurant details:', error);
      renderErrorState();
    }
  }
}