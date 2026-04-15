import ApiRequest from '../utils/ApiRequest.js';
import { RestaurantCategories } from '../utils/enums.js';
import renderPagination from "./components/pagination.js";

export default function loadAdminRestaurants(options = { page: 1 }) {
    const $list = $('#restaurants-list');
    const $empty = $('#restaurants-empty');
    const $newBtn = $('#ar-new-btn');

    let brand = null;
    let restaurants = [];

    initializePage();

    function initializePage() {
        $newBtn.off('click').on('click', function () {
            createNewRestaurantCard();
        });

        attachDelegatedEvents();
        loadRestaurants(options.page);
    }

    async function loadRestaurants(page) {
        $list.empty();
        $empty.hide();

        try {
            const response = await ApiRequest.getAdminRestaurants({
                page,
                limit: 5
            });
            console.log(response);
            brand = response?.brand || null;
            restaurants = Array.isArray(response?.restaurants) ? response.restaurants : [];

            renderBrand();
            renderRestaurants();
            renderPagination(response.pagination, loadAdminRestaurants)
        } catch (error) {
            console.error('Failed to load admin restaurants:', error);
            $empty.show();
        }
    }

    function renderBrand() {
        $('#ar-brand-name').text(brand?.name || 'Unknown Brand');
        $('#ar-brand-logo')
            .attr('src', brand?.logoURL || '/assets/img/default-avatar.png')
            .attr('alt', brand?.name || 'Brand logo');
    }

    function renderRestaurants() {
        $list.empty();

        if (!restaurants.length) {
            $empty.show();
            return;
        }

        $empty.hide();

        restaurants.forEach((restaurant) => {
            $list.append(buildRestaurantCardHtml(restaurant));
        });
    }

    function createNewRestaurantCard() {
        $empty.hide();

        const emptyRestaurant = {
            id: '',
            name: '',
            description: '',
            bannerURL: '',
            photosURL: [],
            categories: [],
            autoApprovedBookingsNum: 0,
            timeFrom: '09:00',
            timeTo: '17:00',
            address: {
                building: '',
                street: '',
                city: '',
                postcode: '',
                country: ''
            }
        };

        $list.prepend(buildRestaurantCardHtml(emptyRestaurant, true));
    }

    function buildRestaurantCardHtml(restaurant, isNew = false) {
        const categoriesText = Array.isArray(restaurant.categories)
            ? restaurant.categories.join(', ')
            : '';

        const galleryHtml = Array.isArray(restaurant.photosURL) && restaurant.photosURL.length
            ? restaurant.photosURL.map((url, index) => `
                <div class="ar-gallery-item" data-index="${index}">
                    <img src="${escapeHtml(url)}" alt="Gallery image ${index + 1}">
                    <button type="button" class="ar-gallery-remove-btn js-remove-gallery-image">×</button>
                </div>
            `).join('')
            : '';

        return `
            <article class="ar-editor-card ${isNew ? 'is-new' : ''}" data-id="${escapeHtml(restaurant.id || '')}">
                <div class="ar-editor-head">
                    <div class="ar-editor-title-wrap">
                        <h2 class="ar-editor-title">${escapeHtml(restaurant.name || 'New Restaurant')}</h2>
                        <p class="ar-editor-sub">
                            ${escapeHtml(restaurant.address?.city || 'New draft')}
                        </p>
                    </div>

                    <div class="ar-editor-head-actions">
                        <button type="button" class="ar-danger-btn js-remove-restaurant">
                            Remove Restaurant
                        </button>
                    </div>
                </div>

                <div class="ar-editor-grid">
                    <div class="ar-editor-main">
                        <div class="ar-field">
                            <label>Name</label>
                            <input class="js-ar-name" type="text" value="${escapeHtml(restaurant.name || '')}" placeholder="Restaurant name">
                        </div>

                        <div class="ar-field">
                            <label>Description</label>
                            <textarea class="js-ar-description" rows="5" placeholder="Restaurant description">${escapeHtml(restaurant.description || '')}</textarea>
                        </div>

                        <div class="ar-field-grid">
                            <div class="ar-field">
                                <label>Opening time</label>
                                <input class="js-ar-open" type="time" value="${escapeHtml(restaurant.timeFrom || '09:00')}">
                            </div>

                            <div class="ar-field">
                                <label>Closing time</label>
                                <input class="js-ar-close" type="time" value="${escapeHtml(restaurant.timeTo || '17:00')}">
                            </div>
                        </div>

                        <div class="ar-field-grid">
                            <div class="ar-field">
                                <label>Auto-approve max guests</label>
                                <input class="js-ar-auto" type="number" min="0" value="${Number(restaurant.autoApprovedBookingsNum || 0)}">
                            </div>

                            <div class="ar-field">
                                <label>Categories</label>
                                <input class="js-ar-categories" type="text" value="${escapeHtml(categoriesText)}" placeholder="e.g. Sushi, Drinks, FineDining">
                            </div>
                        </div>

                        <div class="ar-field-grid ar-address-grid">
                            <div class="ar-field">
                                <label>Building</label>
                                <input class="js-ar-building" type="text" value="${escapeHtml(restaurant.address?.building || '')}" placeholder="Building">
                            </div>

                            <div class="ar-field">
                                <label>Street</label>
                                <input class="js-ar-street" type="text" value="${escapeHtml(restaurant.address?.street || '')}" placeholder="Street">
                            </div>

                            <div class="ar-field">
                                <label>City</label>
                                <input class="js-ar-city" type="text" value="${escapeHtml(restaurant.address?.city || '')}" placeholder="City">
                            </div>

                            <div class="ar-field">
                                <label>Postcode</label>
                                <input class="js-ar-postcode" type="text" value="${escapeHtml(restaurant.address?.postcode || '')}" placeholder="Postcode">
                            </div>

                            <div class="ar-field">
                                <label>Country</label>
                                <input class="js-ar-country" type="text" value="${escapeHtml(restaurant.address?.country || '')}" placeholder="Country">
                            </div>

                            <div class="ar-field">
                                <label>Banner image URL</label>
                                <input class="js-ar-banner-url" type="text" value="${escapeHtml(restaurant.bannerURL || '')}" placeholder="https://...">
                            </div>
                        </div>
                    </div>

                    <div class="ar-editor-side">
                        <div class="ar-media-card">
                            <label class="ar-media-label">Banner preview</label>
                            <div class="ar-banner-preview">
                                <img class="js-ar-banner-preview" src="${escapeHtml(restaurant.bannerURL || '/assets/img/restaurant2.jpg')}" alt="${escapeHtml(restaurant.name || 'Restaurant banner')}">
                            </div>
                        </div>

                        <div class="ar-media-card">
                            <label class="ar-media-label">Gallery Images</label>
                            <div class="ar-gallery-dropzone">
                                <span>Add image URLs below, one at a time</span>
                                <div class="ar-gallery-url-row">
                                    <input class="js-gallery-url-input" type="text" placeholder="https://...">
                                    <button type="button" class="ar-secondary-btn js-add-gallery-url">Add</button>
                                </div>
                            </div>

                            <div class="ar-gallery-preview js-ar-gallery-preview">
                                ${galleryHtml}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ar-editor-footer">
                    <button type="button" class="ar-secondary-btn js-reset-restaurant">Reset Changes</button>
                    <button type="button" class="ar-primary-btn js-save-restaurant">Save Changes</button>
                </div>
            </article>
        `;
    }

    function attachDelegatedEvents() {
        $(document)
            .off('input', '.js-ar-banner-url')
            .on('input', '.js-ar-banner-url', function () {
                const $card = $(this).closest('.ar-editor-card');
                const value = ($(this).val() || '').toString().trim();
                $card.find('.js-ar-banner-preview').attr('src', value || '/assets/img/restaurant2.jpg');
            });

        $(document)
            .off('click', '.js-add-gallery-url')
            .on('click', '.js-add-gallery-url', function () {
                const $card = $(this).closest('.ar-editor-card');
                const $input = $card.find('.js-gallery-url-input');
                const url = ($input.val() || '').toString().trim();

                if (!url) return;

                const $preview = $card.find('.js-ar-gallery-preview');
                const currentCount = $preview.find('.ar-gallery-item').length;

                $preview.append(`
                    <div class="ar-gallery-item" data-index="${currentCount}">
                        <img src="${escapeHtml(url)}" alt="Gallery image ${currentCount + 1}">
                        <button type="button" class="ar-gallery-remove-btn js-remove-gallery-image">×</button>
                    </div>
                `);

                $input.val('');
            });

        $(document)
            .off('click', '.js-remove-gallery-image')
            .on('click', '.js-remove-gallery-image', function () {
                $(this).closest('.ar-gallery-item').remove();
            });

        $(document)
            .off('click', '.js-reset-restaurant')
            .on('click', '.js-reset-restaurant', async function () {
                await loadRestaurants(options.page);
            });

        $(document)
            .off('click', '.js-remove-restaurant')
            .on('click', '.js-remove-restaurant', function () {
                const $card = $(this).closest('.ar-editor-card');
                $card.remove();

                if (!$list.children().length) {
                    $empty.show();
                }
            });

        $(document)
            .off('click', '.js-save-restaurant')
            .on('click', '.js-save-restaurant', async function () {
                const $card = $(this).closest('.ar-editor-card');
                const payload = collectRestaurantPayload($card);

                if (!payload) return;

                const response = await ApiRequest.saveRestaurant(payload);
                console.log('!!!!!!!!!!!!', response)
                if (response?.restaurant?.id) {
                    await loadRestaurants();
                }
            });
    }

    function collectRestaurantPayload($card) {
        const restaurantID = ($card.data('id') || '').toString().trim();
        const name = ($card.find('.js-ar-name').val() || '').toString().trim();
        const description = ($card.find('.js-ar-description').val() || '').toString().trim();
        const bannerURL = ($card.find('.js-ar-banner-url').val() || '').toString().trim();
        const timeFrom = ($card.find('.js-ar-open').val() || '').toString().trim();
        const timeTo = ($card.find('.js-ar-close').val() || '').toString().trim();
        const autoApprovedBookingsNum = Number($card.find('.js-ar-auto').val() || 0);

        const building = ($card.find('.js-ar-building').val() || '').toString().trim();
        const street = ($card.find('.js-ar-street').val() || '').toString().trim();
        const city = ($card.find('.js-ar-city').val() || '').toString().trim();
        const postcode = ($card.find('.js-ar-postcode').val() || '').toString().trim();
        const country = ($card.find('.js-ar-country').val() || '').toString().trim();

        const categoriesRaw = ($card.find('.js-ar-categories').val() || '').toString().trim();
        const categories = categoriesRaw
            .split(',')
            .map(item => item.trim())
            .filter(Boolean)
            .slice(0, 5);

        const photosURL = $card.find('.ar-gallery-item img').map((_, el) => $(el).attr('src')).get();

        if (!name || name.length < 5) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid name',
                text: 'Restaurant name must be at least 5 characters long.'
            });
            return null;
        }

        if (!description || description.length < 20) {
            Swal.fire({
                icon: 'warning',
                title: 'Invalid description',
                text: 'Description must be at least 20 characters long.'
            });
            return null;
        }

        if (!bannerURL) {
            Swal.fire({
                icon: 'warning',
                title: 'Banner image required',
                text: 'Please provide a banner image URL.'
            });
            return null;
        }

        if (!categories.length) {
            Swal.fire({
                icon: 'warning',
                title: 'Categories required',
                text: 'Please provide at least one category.'
            });
            return null;
        }

        if (!timeFrom || !timeTo) {
            Swal.fire({
                icon: 'warning',
                title: 'Opening hours required',
                text: 'Please provide both opening and closing times.'
            });
            return null;
        }

        if (!building || !street || !city || !postcode || !country) {
            Swal.fire({
                icon: 'warning',
                title: 'Address incomplete',
                text: 'Please complete the restaurant address.'
            });
            return null;
        }

        const payload = {
            name,
            description,
            bannerURL,
            photosURL,
            categories,
            autoApprovedBookingsNum,
            timeFrom,
            timeTo,
            address: {
                building,
                street,
                city,
                postcode,
                country
            }
        };

        if (restaurantID) {
            payload.restaurantID = restaurantID;
        }

        return payload;
    }

    function escapeHtml(value) {
        return String(value)
            .replaceAll('&', '&amp;')
            .replaceAll('<', '&lt;')
            .replaceAll('>', '&gt;')
            .replaceAll('"', '&quot;')
            .replaceAll("'", '&#039;');
    }
}