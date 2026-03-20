import ApiRequest from "../utils/ApiRequest.js";
import Mustache from "../utils/mustache.js";
import { Template } from "../config.js";
import { RestaurantCategories } from "../utils/enums.js";

let selectedCategories = [];

export default function () {
    const $form = $(".js-home-filters");
    const $container = $(".restaurants-container");
    const $loading = $(".restaurants-loading");
    const $count = $(".js-restaurant-count");
    const template = Template.component.restaurantCard();

    init();

    function init() {
        setDefaultDate();
        setDefaultGuests();
        renderCategoryDropdown();
        renderSelectedCategories();

        $form.off("submit").on("submit", async (event) => {
            event.preventDefault();
            await loadRestaurants();
        });

        loadRestaurants();
    }

    async function loadRestaurants() {
        $loading.show();
        $container.empty();

        try {
            const { filters, guestNumber } = getFilters();
            const response = await ApiRequest.getRestaurants(filters);
            const restaurants = response?.restaurants || [];

            renderRestaurants({
                restaurants,
                guestNumber,
                template,
                $container,
                $count
            });
        } catch (error) {
            console.error("Failed to load restaurants:", error);
            renderError($container, $count);
        } finally {
            $loading.hide();
        }
    }
}

function getFilters() {
    const search = ($(".js-filter-search").val() || "").toString().trim();
    const radius = Number(($(".js-filter-radius").val() || "20").toString());
    const guestNumber = clampGuests($(".js-filter-guests").val());
    const date = toDateTimeString($(".js-filter-date").val());

    const filters = {
        date,
        categories: [...selectedCategories],
        page: 1,
        limit: 24
    };

    if (search) {
        filters.search = search;
        filters.radius = radius;
    }

    return {
        filters,
        guestNumber
    };
}

function renderCategoryDropdown() {
    const $dropdown = $(".js-category-dropdown");
    const categories = Object.values(RestaurantCategories);

    $dropdown.empty();
    $dropdown.append(`<option value="">Add category</option>`);

    categories.forEach((category) => {
        $dropdown.append(
            `<option value="${escapeHtml(category)}">${escapeHtml(formatCategoryLabel(category))}</option>`
        );
    });

    $dropdown.off("change").on("change", function () {
        const value = ($(this).val() || "").toString();

        if (!value) {
            return;
        }

        if (!selectedCategories.includes(value)) {
            selectedCategories.push(value);
            renderSelectedCategories();
        }

        $(this).val("");
    });
}

function renderSelectedCategories() {
    const $wrap = $(".js-selected-categories");
    $wrap.empty();

    selectedCategories.forEach((category) => {
        const $chip = $(`
            <div class="home-chip">
                <span>${escapeHtml(formatCategoryLabel(category))}</span>
                <button type="button" class="home-chip-remove" aria-label="Remove ${escapeHtml(formatCategoryLabel(category))}" data-category="${escapeHtml(category)}">×</button>
            </div>
        `);

        $chip.find(".home-chip-remove").on("click", function () {
            const categoryToRemove = ($(this).data("category") || "").toString();
            selectedCategories = selectedCategories.filter((categoryItem) => categoryItem !== categoryToRemove);
            renderSelectedCategories();
        });

        $wrap.append($chip);
    });
}

function renderRestaurants({ restaurants, guestNumber, template, $container, $count }) {
    $container.empty();

    if (!restaurants.length) {
        $container.html(`
            <div class="restaurant-empty">
                <h3>No restaurants found</h3>
                <p>Try changing your filters and searching again.</p>
            </div>
        `);
        $count.text("0");
        return;
    }

    restaurants.forEach((restaurant) => {
        const viewModel = buildRestaurantViewModel(restaurant, guestNumber);
        $container.append(Mustache.render(template, viewModel));
    });

    $count.text(restaurants.length);
}

function buildRestaurantViewModel(restaurant, guestNumber) {
    const categories = Array.isArray(restaurant.categories) ? restaurant.categories : [];
    const restaurantType = categories.length
        ? categories.slice(0, 2).map(formatCategoryLabel).join(" · ")
        : "Restaurant";

    const autoConfirmGuestsLimit = Number(restaurant.availability?.autoConfirmGuestsLimit ?? 0);
    const isAutoApproved = guestNumber <= autoConfirmGuestsLimit;

    return {
        ...restaurant,
        restaurantType,
        isAutoApproved,
        openingHours: formatOpeningHours(restaurant.timeFrom, restaurant.timeTo)
    };
}

function renderError($container, $count) {
    $container.html(`
        <div class="restaurant-empty">
            <h3>Couldn’t load restaurants</h3>
            <p>Please try again in a moment.</p>
        </div>
    `);
    $count.text("0");
}

function setDefaultDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    $(".js-filter-date").val(`${year}-${month}-${day}`);
}

function setDefaultGuests() {
    $(".js-filter-guests").val("2");
}

function toDateTimeString(dateValue) {
    if (!dateValue) {
        return "";
    }

    return `${dateValue}T00:00:00.000Z`;
}

function clampGuests(value) {
    const parsed = Number(value);

    if (Number.isNaN(parsed)) {
        return 2;
    }

    return Math.max(1, Math.min(20, parsed));
}

function formatCategoryLabel(value) {
    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .trim();
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function formatOpeningHours(timeFrom, timeTo) {
    if (!timeFrom || !timeTo) {
        return "Hours unavailable";
    }

    return ` ${timeFrom}–${timeTo}`;
}