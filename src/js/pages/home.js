import ApiRequest from "../utils/ApiRequest.js";
import Mustache from "../utils/mustache.js";
import Template from "../utils/Template.js";
import { RestaurantCategories } from "../utils/enums.js";
import renderPagination from "./components/pagination.js";

let selectedCategories = [];

export default function loadHome(options = { page: 1 }) {
    const $form = $(".js-home-filters");
    const $container = $(".restaurants-container");
    const $loading = $(".restaurants-loading");
    const $count = $(".js-restaurant-count");
    const $categoryInput = $(".js-category-input");

    const template = Template.component.restaurantCard();

    init();

    function init() {
        setDefaultDate();
        setDefaultGuests();
        setDefaultRadius();
        renderCategorySuggestions();
        renderSelectedCategories();
        initRadiusSlider();

        $form.off("submit").on("submit", async function (event) {
            event.preventDefault();
            commitCategoryInput();
            await loadRestaurants(1);
        });

        $categoryInput.off("change").on("change", function () {
            commitCategoryInput();
        });

        $categoryInput.off("blur").on("blur", function () {
            commitCategoryInput();
        });

        $categoryInput.off("keydown").on("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                commitCategoryInput();
            }
        });

        $(document)
            .off("click", ".home-chip-remove")
            .on("click", ".home-chip-remove", function () {
                const categoryToRemove = ($(this).data("category") || "").toString();
                selectedCategories = selectedCategories.filter((item) => item !== categoryToRemove);
                renderSelectedCategories();
            });

        loadRestaurants(options.page);
    }

    async function loadRestaurants(page) {
        $loading.show();
        $container.empty();

        try {
            const { filters, guestNumber } = getFilters(page);
            console.log("Restaurant filters being sent:", filters);

            const response = await ApiRequest.getRestaurants(filters);

            if (!response) {
                renderError($container, $count);
                return;
            }

            const restaurants = response?.restaurants || [];
            const total = response?.pagination?.total ?? restaurants.length;
            const brand = response?.brand || null;

            renderRestaurants({
                restaurants,
                brand,
                total,
                guestNumber,
                template,
                $container,
                $count
            });

            if (response?.pagination) {
                renderPagination(response.pagination, loadHome);
            } else {
                $("#pagination").empty();
            }
        } catch (error) {
            console.error("Failed to load restaurants:", error);
            renderError($container, $count);
        } finally {
            $loading.hide();
        }
    }

    function commitCategoryInput() {
        const inputValue = ($categoryInput.val() || "").toString().trim();

        if (!inputValue) {
            return;
        }

        const matchedCategory = findCategoryValue(inputValue);

        if (matchedCategory && !selectedCategories.includes(matchedCategory)) {
            selectedCategories.push(matchedCategory);
            renderSelectedCategories();
        }

        $categoryInput.val("");
    }
}

function getFilters(page = 1) {
    const search = ($(".js-filter-search").val() || "").toString().trim();
    const radius = Number(($(".js-filter-radius").val() || "20").toString());
    const guestNumber = clampGuests($(".js-filter-guests").val());
    const date = toDateTimeString($(".js-filter-date").val());

    const inputCategoryValue = ($(".js-category-input").val() || "").toString().trim();
    const matchedInputCategory = findCategoryValue(inputCategoryValue);

    const categories = [...selectedCategories];

    if (matchedInputCategory && !categories.includes(matchedInputCategory)) {
        categories.push(matchedInputCategory);
    }

    const filters = {
        date,
        page,
        limit: 24
    };

    if (categories.length) {
        filters.categories = categories;
    }

    if (search) {
        filters.search = search;
        filters.radius = radius;
    }

    return {
        filters,
        guestNumber
    };
}

function renderCategorySuggestions() {
    const $datalist = $(".js-category-datalist");
    const categories = Object.values(RestaurantCategories);

    $datalist.empty();

    categories.forEach((category) => {
        $datalist.append(
            `<option value="${escapeHtml(formatCategoryLabel(category))}"></option>`
        );
    });
}

function findCategoryValue(inputValue) {
    const normalizedInput = normalizeCategory(inputValue);

    return (
        Object.values(RestaurantCategories).find((category) => {
            return (
                normalizeCategory(category) === normalizedInput ||
                normalizeCategory(formatCategoryLabel(category)) === normalizedInput
            );
        }) || null
    );
}

function renderSelectedCategories() {
    const $wrap = $(".js-selected-categories");
    $wrap.empty();

    selectedCategories.forEach((category) => {
        const label = formatCategoryLabel(category);

        $wrap.append(`
            <div class="home-chip">
                <span>${escapeHtml(label)}</span>
                <button
                    type="button"
                    class="home-chip-remove"
                    aria-label="Remove ${escapeHtml(label)}"
                    data-category="${escapeHtml(category)}"
                >&times;</button>
            </div>
        `);
    });
}

function renderRestaurants({ restaurants, brand, total, guestNumber, template, $container, $count }) {
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
        const viewModel = buildRestaurantViewModel(restaurant, brand, guestNumber);
        $container.append(Mustache.render(template, viewModel));
    });

    $count.text(total);
}

function buildRestaurantViewModel(restaurant, brand, guestNumber) {
    const categories = Array.isArray(restaurant.categories) ? restaurant.categories : [];
    const restaurantType = categories.length
        ? categories.map(formatCategoryLabel).join(" · ")
        : "Restaurant";

    const autoConfirmGuestsLimit = Number(restaurant.availability?.autoConfirmGuestsLimit ?? 0);
    const isAutoApproved = guestNumber <= autoConfirmGuestsLimit;

    return {
        ...restaurant,
        brand: restaurant.brand || brand || null,
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
    $("#pagination").empty();
}

function setDefaultDate() {
    const $dateInput = $(".js-filter-date");

    if ($dateInput.val()) {
        return;
    }

    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    $dateInput.val(`${year}-${month}-${day}`);
}

function setDefaultGuests() {
    const $guestsInput = $(".js-filter-guests");

    if ($guestsInput.val()) {
        return;
    }

    $guestsInput.val("2");
}

function setDefaultRadius() {
    const $radiusInput = $(".js-filter-radius");

    if ($radiusInput.val()) {
        return;
    }

    $radiusInput.val("20");
}

function initRadiusSlider() {
    const $radiusInput = $(".js-filter-radius");

    updateRadiusUI($radiusInput);

    $radiusInput.off("input").on("input", function () {
        updateRadiusUI($(this));
    });

    $radiusInput.off("change").on("change", function () {
        updateRadiusUI($(this));
    });
}

function updateRadiusUI($input) {
    const value = Number($input.val());
    const min = Number($input.attr("min")) || 0;
    const max = Number($input.attr("max")) || 100;

    const percent = ((value - min) / (max - min)) * 100;

    // update text
    $(".js-radius-value").text(`${value} km`);

    // update visual fill
    $input.css("--range-progress", `${percent}%`);
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

function normalizeCategory(value) {
    return String(value)
        .trim()
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .toLowerCase();
}

function formatCategoryLabel(value) {
    return String(value)
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/[_-]+/g, " ")
        .replace(/\s+/g, " ")
        .trim();
}

function formatOpeningHours(timeFrom, timeTo) {
    if (!timeFrom || !timeTo) {
        return "Hours unavailable";
    }

    return `${timeFrom}-${timeTo}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}