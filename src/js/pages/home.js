import ApiRequest from "../utils/ApiRequest.js";
import Mustache from "../utils/mustache.js";
import { Template } from "../config.js";

export default async function () {
    const $loading = $(".restaurants-loading");
    const $results = $(".js-restaurants-results");
    const $count = $(".js-restaurant-count");

    const $search = $(".js-filter-search");
    const $type = $(".js-filter-type");
    const $city = $(".js-filter-city");
    const $date = $(".js-filter-date");
    const $time = $(".js-filter-time");
    const $guests = $(".js-filter-guests");
    const $openNow = $(".js-filter-open-now");

    $loading.show();
    $results.empty();

    try {
        const res = await ApiRequest.getRestaurants();
        const template = Template.component.restaurantCard();

        const restaurants = (res?.restaurants || []).map((restaurant) => {
            const categories = Array.isArray(restaurant.categories) ? restaurant.categories : [];
            const isLate = categories.some((category) =>
                ["LateNight", "Bar", "CocktailBar", "Nightlife", "Drinks"].includes(category)
            );

            const opening = getOpeningState(restaurant.timeFrom, restaurant.timeTo);
            const availableDate = getDateString(restaurant.availability?.date);
            const city = restaurant.address?.city || "Unknown city";
            const guestsLimit = Number(restaurant.availability?.autoConfirmGuestsLimit ?? 0);

            return {
                ...restaurant,
                _id: restaurant.id || restaurant._id,
                city,
                availableDate,
                guestsLimit,
                restaurantType: categories.length
                    ? categories.slice(0, 3).join(" · ")
                    : "Restaurant",
                isLate,
                ctaLabel: isLate ? "View bar" : "View restaurant",
                isOpenNow: opening.isOpenNow,
                statusLabel: opening.statusLabel,
                statusClass: opening.statusClass
            };
        });

        const types = [...new Set(
            restaurants.flatMap((restaurant) =>
                Array.isArray(restaurant.categories) ? restaurant.categories : []
            )
        )].sort((a, b) => a.localeCompare(b));

        const cities = [...new Set(
            restaurants
                .map((restaurant) => restaurant.city)
                .filter(Boolean)
        )].sort((a, b) => a.localeCompare(b));

        $type.empty().append(`<option value="">All types</option>`);
        $city.empty().append(`<option value="">All cities</option>`);

        types.forEach((typeValue) => {
            $type.append(
                `<option value="${escapeHtml(typeValue)}">${escapeHtml(typeValue)}</option>`
            );
        });

        cities.forEach((cityValue) => {
            $city.append(
                `<option value="${escapeHtml(cityValue)}">${escapeHtml(cityValue)}</option>`
            );
        });

        function renderGroupedRestaurants(items) {
            $results.empty();

            if (!items.length) {
                $results.html(`
                    <div class="restaurant-empty">
                        <h3>No restaurants found</h3>
                        <p>Try adjusting your filters.</p>
                    </div>
                `);
                $count.text("0");
                return;
            }

            const selectedCity = ($city.val() || "").toString();

            if (selectedCity) {
                renderSingleSection(`Popular in ${escapeHtml(selectedCity)}`, items);
            } else {
                const groups = groupByCity(items);

                groups.forEach(({ city, restaurants: groupedRestaurants }) => {
                    renderSingleSection(`Popular in ${escapeHtml(city)}`, groupedRestaurants);
                });
            }

            $count.text(items.length);
        }

        function renderSingleSection(title, items) {
            const cardsHtml = items
                .map((restaurant) => Mustache.render(template, restaurant))
                .join("");

            $results.append(`
                <section class="restaurants-group">
                    <div class="restaurants-group-head">
                        <h3>${title}</h3>
                    </div>
                    <div class="restaurants-container">
                        ${cardsHtml}
                    </div>
                </section>
            `);
        }

        function applyFilters() {
            const searchValue = ($search.val() || "").toString().trim().toLowerCase();
            const selectedType = ($type.val() || "").toString();
            const selectedCity = ($city.val() || "").toString();
            const selectedDate = ($date.val() || "").toString();
            const selectedGuests = Number($guests.val());
            const selectedTime = ($time.val() || "").toString();
            const openNowOnly = $openNow.is(":checked");

            const selectedTimeMinutes =
                selectedTime && /^\d{2}:\d{2}$/.test(selectedTime)
                    ? toMinutes(selectedTime)
                    : null;

            const filtered = restaurants.filter((restaurant) => {
                const matchesSearch =
                    !searchValue ||
                    restaurant.name?.toLowerCase().includes(searchValue) ||
                    restaurant.description?.toLowerCase().includes(searchValue) ||
                    restaurant.brand?.name?.toLowerCase().includes(searchValue);

                const matchesType =
                    !selectedType ||
                    (Array.isArray(restaurant.categories) &&
                        restaurant.categories.includes(selectedType));

                const matchesCity =
                    !selectedCity ||
                    restaurant.city === selectedCity;

                const matchesDate =
                    !selectedDate ||
                    restaurant.availableDate === selectedDate;

                const matchesGuests =
                    Number.isNaN(selectedGuests) ||
                    !selectedGuests ||
                    restaurant.guestsLimit >= selectedGuests;

                const matchesOpenNow =
                    !openNowOnly || restaurant.isOpenNow;

                const matchesSelectedTime =
                    selectedTimeMinutes === null ||
                    isTimeWithinOpeningHours(
                        selectedTimeMinutes,
                        restaurant.timeFrom,
                        restaurant.timeTo
                    );

                return (
                    matchesSearch &&
                    matchesType &&
                    matchesCity &&
                    matchesDate &&
                    matchesGuests &&
                    matchesOpenNow &&
                    matchesSelectedTime
                );
            });

            renderGroupedRestaurants(filtered);
        }

        $search.off("input").on("input", applyFilters);
        $type.off("change").on("change", applyFilters);
        $city.off("change").on("change", applyFilters);
        $date.off("change").on("change", applyFilters);
        $time.off("change").on("change", applyFilters);
        $guests.off("change").on("change", applyFilters);
        $openNow.off("change").on("change", applyFilters);

        renderGroupedRestaurants(restaurants);
    } catch (error) {
        console.error("Failed to load restaurants:", error);

        $results.html(`
            <div class="restaurant-empty">
                <h3>Couldn’t load restaurants</h3>
                <p>Please try again in a moment.</p>
            </div>
        `);

        $count.text("0");
    } finally {
        $loading.hide();
    }
}

function groupByCity(restaurants) {
    const groupsMap = new Map();

    restaurants.forEach((restaurant) => {
        const city = restaurant.city || "Other locations";

        if (!groupsMap.has(city)) {
            groupsMap.set(city, []);
        }

        groupsMap.get(city).push(restaurant);
    });

    return [...groupsMap.entries()]
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([city, items]) => ({
            city,
            restaurants: items.sort((a, b) => (a.name || "").localeCompare(b.name || ""))
        }));
}

function getOpeningState(timeFrom, timeTo) {
    if (!isValidTimeString(timeFrom) || !isValidTimeString(timeTo)) {
        return {
            isOpenNow: false,
            statusLabel: "Hours unavailable",
            statusClass: "status--closed"
        };
    }

    const now = new Date();
    const minutesNow = now.getHours() * 60 + now.getMinutes();
    const openMinutes = toMinutes(timeFrom);
    const closeMinutes = toMinutes(timeTo);

    const overnight = closeMinutes <= openMinutes;

    let isOpenNow = false;
    let closesSoon = false;
    let opensSoon = false;

    if (!overnight) {
        isOpenNow = minutesNow >= openMinutes && minutesNow < closeMinutes;
        closesSoon = isOpenNow && closeMinutes - minutesNow <= 60;
        opensSoon = !isOpenNow && openMinutes > minutesNow && openMinutes - minutesNow <= 60;
    } else {
        isOpenNow = minutesNow >= openMinutes || minutesNow < closeMinutes;

        if (isOpenNow) {
            const minutesUntilClose =
                minutesNow >= openMinutes
                    ? (24 * 60 - minutesNow) + closeMinutes
                    : closeMinutes - minutesNow;

            closesSoon = minutesUntilClose <= 60;
        } else {
            const minutesUntilOpen = openMinutes - minutesNow;
            opensSoon = minutesUntilOpen > 0 && minutesUntilOpen <= 60;
        }
    }

    if (isOpenNow && closesSoon) {
        return {
            isOpenNow: true,
            statusLabel: "Closing soon",
            statusClass: "status--closing"
        };
    }

    if (isOpenNow) {
        return {
            isOpenNow: true,
            statusLabel: "Open now",
            statusClass: "status--open"
        };
    }

    if (opensSoon) {
        return {
            isOpenNow: false,
            statusLabel: "Opening soon",
            statusClass: "status--opening"
        };
    }

    return {
        isOpenNow: false,
        statusLabel: "Closed",
        statusClass: "status--closed"
    };
}

function isTimeWithinOpeningHours(selectedMinutes, timeFrom, timeTo) {
    if (!isValidTimeString(timeFrom) || !isValidTimeString(timeTo)) {
        return false;
    }

    const openMinutes = toMinutes(timeFrom);
    const closeMinutes = toMinutes(timeTo);

    if (closeMinutes > openMinutes) {
        return selectedMinutes >= openMinutes && selectedMinutes < closeMinutes;
    }

    return selectedMinutes >= openMinutes || selectedMinutes < closeMinutes;
}

function isValidTimeString(value) {
    return typeof value === "string" && /^\d{2}:\d{2}$/.test(value);
}

function toMinutes(value) {
    const [hours, minutes] = value.split(":").map(Number);
    return hours * 60 + minutes;
}

function getDateString(value) {
    if (!value) {
        return "";
    }

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return "";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

function escapeHtml(value) {
    return String(value)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}