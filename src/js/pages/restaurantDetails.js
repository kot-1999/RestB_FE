import ApiRequest from '../utils/ApiRequest.js';
import { renderHeaderWithBrand } from "../utils/helpers.js";

export default function () {
  let galleryImages = [];
  let activeImageIndex = 0;

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

  function renderRestaurantMap(restaurant) {
    const address = buildAddress(restaurant.address);
    const lat = restaurant.address?.latitude;
    const lng = restaurant.address?.longitude;

    const $mapFrame = $('#rb-map-frame');
    const $directions = $('#rb-directions-link');

    let mapEmbedUrl = '';
    let directionsUrl = '#';

    if (lat && lng) {
      mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(`${lat},${lng}`)}&z=15&output=embed`;
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${lat},${lng}`)}`;
    } else if (address && address !== 'Location unavailable') {
      mapEmbedUrl = `https://www.google.com/maps?q=${encodeURIComponent(address)}&z=15&output=embed`;
      directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`;
    }

    $mapFrame.attr('src', mapEmbedUrl);
    $directions.attr('href', directionsUrl);
  }

  function openLightbox(index) {
    if (!galleryImages.length) return;

    activeImageIndex = index;
    $('#rb-lightbox-image')
        .attr('src', galleryImages[activeImageIndex].url)
        .attr('alt', galleryImages[activeImageIndex].alt);

    $('#rb-lightbox').removeAttr('hidden');
    $('body').addClass('rb-lightbox-open');
  }

  function closeLightbox() {
    $('#rb-lightbox').attr('hidden', true);
    $('#rb-lightbox-image').attr('src', '').attr('alt', 'Expanded gallery image');
    $('body').removeClass('rb-lightbox-open');
  }

  function showPrevImage() {
    if (!galleryImages.length) return;
    activeImageIndex = (activeImageIndex - 1 + galleryImages.length) % galleryImages.length;
    openLightbox(activeImageIndex);
  }

  function showNextImage() {
    if (!galleryImages.length) return;
    activeImageIndex = (activeImageIndex + 1) % galleryImages.length;
    openLightbox(activeImageIndex);
  }

  function bindLightboxEvents() {
    $(document)
        .off('click', '.js-rb-gallery-shot')
        .on('click', '.js-rb-gallery-shot', function (e) {
          e.preventDefault();
          const index = Number($(this).data('index') || 0);
          openLightbox(index);
        });

    $('#rb-lightbox-close').off('click').on('click', closeLightbox);
    $('#rb-lightbox-prev').off('click').on('click', showPrevImage);
    $('#rb-lightbox-next').off('click').on('click', showNextImage);

    $('#rb-lightbox').off('click').on('click', function (e) {
      if (e.target.id === 'rb-lightbox') {
        closeLightbox();
      }
    });

    $(document).off('keydown.rbLightbox').on('keydown.rbLightbox', function (e) {
      const isOpen = !$('#rb-lightbox').attr('hidden');
      if (!isOpen) return;

      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') showPrevImage();
      if (e.key === 'ArrowRight') showNextImage();
    });
  }

  function renderGallery(restaurant) {
    const $gallery = $('#rb-gallery-grid');
    $gallery.empty();

    const photos = Array.isArray(restaurant.photosURL) ? restaurant.photosURL : [];
    const fallback = restaurant.bannerURL ? [restaurant.bannerURL] : [];
    const images = photos.length ? photos : fallback;

    if (!images.length) {
      galleryImages = [];
      $gallery.html(`
                <div class="rb-gallery-empty">
                    <p>No gallery images available yet.</p>
                </div>
            `);
      return;
    }

    galleryImages = images.map((url, index) => ({
      url,
      alt: `${restaurant.name || 'Restaurant'} image ${index + 1}`
    }));

    images.forEach((url, index) => {
      $gallery.append(`
                <button class="rb-shot js-rb-gallery-shot" type="button" data-index="${index}">
                    <img src="${url}" alt="${restaurant.name || 'Restaurant'} image ${index + 1}">
                </button>
            `);
    });
  }

  function renderRestaurantDetails(restaurant, brand = null) {
    renderHeaderWithBrand(
        restaurant.brand,
        restaurant.name,
        restaurant.description ?? 'No description available.'
    );

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
    renderRestaurantMap(restaurant);
  }

  function renderErrorState(message = "We couldn't load this restaurant right now.") {
    $('#rb-brand').text('Unavailable');
    $('#rb-location').text('Unavailable');
    $('#rb-categories').text('Unavailable');
    $('#rb-hours').text('Unavailable');

    $('#rb-gallery-grid').html(`
            <div class="rb-gallery-empty">
                <p>Gallery unavailable.</p>
            </div>
        `);

    $('#rb-map-frame').attr('src', '');
    $('#rb-directions-link').attr('href', '#');
    console.error(message);
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
          !!$time.val();

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
      });
    });

    validateForm();
  }

  async function initializeRestaurantDetails() {
    setupBookingForm();
    bindLightboxEvents();
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