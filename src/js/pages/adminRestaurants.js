import Mustache from "../utils/mustache.js";
import ApiRequest from "../utils/ApiRequest.js";
import Template from "../utils/Template.js";
import renderPagination from "./components/pagination.js";
import { showError } from "../utils/helpers.js";

const CATEGORY_OPTIONS = [
    "FastFood", "Pizza", "Drinks", "Family", "Party", "Romantic", "Pub",
    "Italian", "American", "Asian", "Chinese", "Japanese", "Indian", "Mexican",
    "Mediterranean", "European", "Polish", "French", "Turkish", "Thai", "Vegan",
    "Vegetarian", "Seafood", "Steakhouse", "BBQ",
    "FineDining", "CasualDining", "Cafe", "Bakery", "Buffet", "StreetFood", "FoodCourt",
    "Bar", "CocktailBar", "WineBar", "SportsBar", "LiveMusic", "Rooftop", "Lounge",
    "Business", "DateNight", "Birthday", "Wedding", "KidsFriendly", "PetFriendly", "OutdoorDining",
    "Takeaway", "Delivery", "AllYouCanEat", "SelfService", "DriveThru",
    "Fusion", "LocalCuisine", "Healthy", "Organic", "Breakfast", "Brunch", "Dessert"
];

function formatCategoryLabel(value) {
    return value
        .replace(/([a-z])([A-Z])/g, "$1 $2")
        .replace(/\bBbq\b/g, "BBQ");
}

function parseCategoryValue(raw) {
    return (raw || "")
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean);
}

function syncCardCategories($card, categories) {
    const unique = [...new Set(categories)].filter((item) => CATEGORY_OPTIONS.includes(item));
    $card.data("categories", unique);
    $card.find(".js-ar-categories").val(unique.join(", "));
}

function renderCategoryPills($card) {
    const categories = $card.data("categories") || [];
    const $pills = $card.find(".js-ar-category-pills");

    if (!$pills.length) return;

    $pills.html(
        categories.map((category) => `
            <button type="button" class="ar-category-pill js-ar-category-pill" data-value="${category}">
                <span>${formatCategoryLabel(category)}</span>
                <span class="ar-category-pill-x">&times;</span>
            </button>
        `).join("")
    );
}

function renderCategoryDropdown($card, query = "") {
    const categories = $card.data("categories") || [];
    const $dropdown = $card.find(".js-ar-category-dropdown");

    if (!$dropdown.length) return;

    const q = query.trim().toLowerCase();

    const matches = CATEGORY_OPTIONS.filter((option) => {
        if (categories.includes(option)) return false;
        return !q || formatCategoryLabel(option).toLowerCase().includes(q) || option.toLowerCase().includes(q);
    });

    if (!matches.length) {
        $dropdown.html(`<div class="ar-category-empty">No matching categories</div>`);
        return;
    }

    $dropdown.html(
        matches.map((option) => `
            <button type="button" class="ar-category-option js-ar-category-option" data-value="${option}">
                ${formatCategoryLabel(option)}
            </button>
        `).join("")
    );
}

function openCategoryDropdown($card) {
    $card.find(".js-ar-category-dropdown").addClass("is-open");
}

function closeCategoryDropdown($card) {
    $card.find(".js-ar-category-dropdown").removeClass("is-open");
}

function initialiseCategorySelector($card) {
    const initial = parseCategoryValue($card.find(".js-ar-categories").val());
    syncCardCategories($card, initial);
    renderCategoryPills($card);
    renderCategoryDropdown($card);
}

function normaliseGallery(restaurant) {
    if (Array.isArray(restaurant.gallery)) {
        return restaurant.gallery
            .map((item, index) => {
                if (typeof item === "string") {
                    return {
                        id: null,
                        url: item,
                        name: `Gallery image ${index + 1}`,
                        isNew: false,
                        file: null
                    };
                }

                return {
                    id: item?.id || null,
                    url: item?.url || item?.imageURL || item?.photoURL || "",
                    name: item?.name || `Gallery image ${index + 1}`,
                    isNew: false,
                    file: null
                };
            })
            .filter((item) => item.url);
    }

    if (Array.isArray(restaurant.photosURL)) {
        return restaurant.photosURL.map((url, index) => ({
            id: null,
            url,
            name: `Gallery image ${index + 1}`,
            isNew: false,
            file: null
        }));
    }

    return [];
}

function renderGalleryPreview($card) {
    const $preview = $card.find(".js-ar-gallery-preview");
    const gallery = $card.data("gallery") || [];

    if (!$preview.length) return;

    if (!gallery.length) {
        $preview.html(`<div class="ar-gallery-empty">No images uploaded yet.</div>`);
        return;
    }

    $preview.html(
        gallery.map((image, index) => `
            <div class="ar-gallery-thumb" data-index="${index}" data-id="${image.id || ""}">
                <button type="button" class="ar-gallery-preview-btn js-ar-gallery-preview-btn" aria-label="Open gallery image">
                    <img src="${image.url}" alt="${image.name || `Gallery image ${index + 1}`}">
                </button>
                <button type="button" class="ar-gallery-remove js-ar-gallery-remove" aria-label="Delete gallery image">&times;</button>
            </div>
        `).join("")
    );
}

function ensureGalleryLightbox() {
    if ($("#ar-gallery-lightbox").length) return;

    $("body").append(`
        <div id="ar-gallery-lightbox" class="ar-gallery-lightbox" style="display:none;">
            <button type="button" class="ar-gallery-lightbox-close js-ar-gallery-lightbox-close" aria-label="Close preview">&times;</button>
            <img class="ar-gallery-lightbox-image" src="" alt="Gallery preview">
        </div>
    `);
}

function openGalleryLightbox(imageUrl, altText = "Gallery preview") {
    ensureGalleryLightbox();
    const $lightbox = $("#ar-gallery-lightbox");
    $lightbox.find(".ar-gallery-lightbox-image").attr("src", imageUrl).attr("alt", altText);
    $lightbox.fadeIn(150);
    $("body").addClass("ar-gallery-lightbox-open");
}

function closeGalleryLightbox() {
    $("#ar-gallery-lightbox").fadeOut(150);
    $("body").removeClass("ar-gallery-lightbox-open");
}

function mapRestaurantToView(restaurant) {
    return {
        ...restaurant,
        categoriesText: Array.isArray(restaurant.categories)
            ? restaurant.categories.map((c) => c.name || c).join(", ")
            : (restaurant.categoriesText || ""),
        timeFrom: restaurant.timeFrom || "",
        timeTo: restaurant.timeTo || "",
        autoApprovedBookingsNum: restaurant.autoApprovedBookingsNum ?? 0,
        bannerURL: restaurant.bannerURL || "/assets/img/default-avatar.png",
        address: {
            building: restaurant.address?.building || "",
            street: restaurant.address?.street || "",
            city: restaurant.address?.city || "",
            postcode: restaurant.address?.postcode || "",
            country: restaurant.address?.country || ""
        }
    };
}

function normaliseStaffList(restaurant) {
    if (Array.isArray(restaurant.staff)) {
        return restaurant.staff.map((member) => member.admin ? member.admin : member);
    }

    if (Array.isArray(restaurant.employees)) {
        return restaurant.employees.map((member) => member.admin ? member.admin : member);
    }

    return [];
}

function renderStaffRows(staff = []) {
    if (!staff.length) {
        return `<div class="ar-staff-empty">No employees assigned yet.</div>`;
    }

    return staff.map((member) => {
        const firstName = member.firstName || "Unknown";
        const lastName = member.lastName || "Employee";
        const email = member.email || "No email";
        const phone = member.phone || "No phone";
        const avatarURL = member.avatarURL || "/assets/img/default-avatar.png";

        return `
            <div class="ar-staff-row">
                <div class="ar-staff-main">
                    <div class="ar-staff-avatar">
                        <img src="${avatarURL}" alt="${firstName} ${lastName} avatar">
                    </div>
                    <div class="ar-staff-copy">
                        <div class="ar-staff-name">${firstName} ${lastName}</div>
                        <div class="ar-staff-meta">${phone}</div>
                        <div class="ar-staff-meta">${email}</div>
                    </div>
                </div>
            </div>
        `;
    }).join("");
}

function cacheOriginalValues($card) {
    const original = {
        name: $card.find(".js-ar-name").val() || "",
        description: $card.find(".js-ar-description").val() || "",
        timeFrom: $card.find(".js-ar-open").val() || "",
        timeTo: $card.find(".js-ar-close").val() || "",
        categoriesText: $card.find(".js-ar-categories").val() || "",
        building: $card.find(".js-ar-building").val() || "",
        street: $card.find(".js-ar-street").val() || "",
        city: $card.find(".js-ar-city").val() || "",
        postcode: $card.find(".js-ar-postcode").val() || "",
        country: $card.find(".js-ar-country").val() || "",
        autoApprovedBookingsNum: $card.find(".js-ar-auto").val() || "",
        bannerURL: $card.find(".js-ar-banner-preview").attr("src") || "",
        gallery: JSON.parse(JSON.stringify($card.data("gallery") || []))
    };

    $card.data("original", original);
}

function resetCardValues($card) {
    const original = $card.data("original");
    if (!original) return;

    $card.find(".js-ar-name").val(original.name);
    $card.find(".js-ar-description").val(original.description);
    $card.find(".js-ar-open").val(original.timeFrom);
    $card.find(".js-ar-close").val(original.timeTo);
    $card.find(".js-ar-categories").val(original.categoriesText);
    $card.find(".js-ar-building").val(original.building);
    $card.find(".js-ar-street").val(original.street);
    $card.find(".js-ar-city").val(original.city);
    $card.find(".js-ar-postcode").val(original.postcode);
    $card.find(".js-ar-country").val(original.country);
    $card.find(".js-ar-auto").val(original.autoApprovedBookingsNum);
    $card.find(".js-ar-banner-preview").attr("src", original.bannerURL);
    $card.find(".js-ar-category-search").val("");
    $card.find(".js-gallery-input").val("");
    $card.find(".js-ar-banner-input").val("");

    $card.data("gallery", JSON.parse(JSON.stringify(original.gallery || [])));
    renderGalleryPreview($card);
    initialiseCategorySelector($card);
}

function updateCollapsedSummary($card) {
    const name = $card.find(".js-ar-name").val()?.trim() || "Untitled Restaurant";
    const city = $card.find(".js-ar-city").val()?.trim() || "";
    const country = $card.find(".js-ar-country").val()?.trim() || "";
    const open = $card.find(".js-ar-open").val() || "";
    const close = $card.find(".js-ar-close").val() || "";
    const categories = parseCategoryValue($card.find(".js-ar-categories").val()).map(formatCategoryLabel).join(", ");

    $card.find(".ar-editor-title").text(name);
    $card.find(".ar-editor-sub").text([city, country].filter(Boolean).join(", "));
    $card.find(".js-ar-compact-meta").text(open && close ? `${open} – ${close}` : "");
    $card.find(".ar-chip").text(categories || "No categories set");
}

function collapseCard($card) {
    $card.attr("data-expanded", "false").removeClass("is-expanded");
    $card.find(".ar-editor-body").stop(true, true).slideUp(180);
    $card.find(".js-toggle-restaurant").text("Edit Restaurant");
    closeCategoryDropdown($card);
}

function expandCard($card) {
    $(".ar-editor-card").not($card).each(function () {
        collapseCard($(this));
    });

    $card.attr("data-expanded", "true").addClass("is-expanded");
    $card.find(".ar-editor-body").stop(true, true).slideDown(220);
    $card.find(".js-toggle-restaurant").text("Close Editor");
}

function initialiseCardUi($scope) {
    $scope.find(".ar-editor-card").each(function () {
        const $card = $(this);

        if (!$card.attr("data-expanded")) {
            $card.attr("data-expanded", "false");
        }

        $card.find(".ar-editor-body").hide();

        if (!$card.data("gallery")) {
            $card.data("gallery", []);
        }

        if (!$card.data("bannerFile")) {
            $card.data("bannerFile", null);
        }

        initialiseCategorySelector($card);
        renderGalleryPreview($card);
        cacheOriginalValues($card);
        updateCollapsedSummary($card);
    });
}

function renderBrandEditor(brand) {
    const template = Template.component.brandEditorHeader();
    const html = Mustache.render(template, {
        id: brand.id,
        name: brand.name || "Brand",
        logoURL: brand.logoURL || "/assets/img/default-avatar.png"
    });

    $("#brand-editor-header").html(html);
}

async function uploadBannerIfNeeded($card) {
    const bannerFile = $card.data("bannerFile");
    if (!bannerFile) {
        return $card.find(".js-ar-banner-preview").attr("src") || "/assets/img/default-avatar.png";
    }

    const uploaded = await ApiRequest.uploadFile(bannerFile);
    const uploadedUrl = uploaded?.fileURL || uploaded?.url || uploaded?.publicUrl;

    if (!uploadedUrl) {
        throw new Error("Failed to upload banner image");
    }

    $card.find(".js-ar-banner-preview").attr("src", uploadedUrl);
    $card.data("bannerFile", null);
    return uploadedUrl;
}

async function uploadGalleryIfNeeded($card) {
    const gallery = [...($card.data("gallery") || [])];

    for (let i = 0; i < gallery.length; i++) {
        const image = gallery[i];
        if (!image?.isNew || !image?.file) continue;

        const uploaded = await ApiRequest.uploadFile(image.file);
        const uploadedUrl = uploaded?.fileURL || uploaded?.url || uploaded?.publicUrl;

        if (!uploadedUrl) {
            throw new Error(`Failed to upload gallery image: ${image.name || "image"}`);
        }

        gallery[i] = {
            id: image.id || null,
            url: uploadedUrl,
            name: image.name,
            isNew: false,
            file: null
        };
    }

    $card.data("gallery", gallery);
    renderGalleryPreview($card);
    return gallery.map((image) => image.url);
}

function buildRestaurantPayload($card, bannerURL, galleryUrls) {
    return {
        name: $card.find(".js-ar-name").val()?.trim() || "",
        description: $card.find(".js-ar-description").val()?.trim() || "",
        bannerURL: bannerURL || "/assets/img/default-avatar.png",
        timeFrom: $card.find(".js-ar-open").val() || null,
        timeTo: $card.find(".js-ar-close").val() || null,
        autoApprovedBookingsNum: Number($card.find(".js-ar-auto").val() || 0),
        categories: parseCategoryValue($card.find(".js-ar-categories").val()),
        photosURL: galleryUrls || [],
        address: {
            building: $card.find(".js-ar-building").val()?.trim() || "",
            street: $card.find(".js-ar-street").val()?.trim() || "",
            city: $card.find(".js-ar-city").val()?.trim() || "",
            postcode: $card.find(".js-ar-postcode").val()?.trim() || "",
            country: $card.find(".js-ar-country").val()?.trim() || ""
        }
    };
}

function bindRestaurantPageEvents() {
    $(document)
        .off("click", ".js-toggle-restaurant")
        .on("click", ".js-toggle-restaurant", function () {
            const $card = $(this).closest(".ar-editor-card");
            const isExpanded = $card.attr("data-expanded") === "true";

            if (isExpanded) {
                collapseCard($card);
            } else {
                expandCard($card);
            }
        });

    $(document)
        .off("click", ".js-reset-restaurant")
        .on("click", ".js-reset-restaurant", function () {
            const $card = $(this).closest(".ar-editor-card");
            resetCardValues($card);
            updateCollapsedSummary($card);
        });

    $(document)
        .off("input change", ".ar-editor-card input:not(.js-ar-category-search), .ar-editor-card textarea")
        .on("input change", ".ar-editor-card input:not(.js-ar-category-search), .ar-editor-card textarea", function () {
            const $card = $(this).closest(".ar-editor-card");
            updateCollapsedSummary($card);
        });

    $(document)
        .off("focus input", ".js-ar-category-search")
        .on("focus input", ".js-ar-category-search", function () {
            const $card = $(this).closest(".ar-editor-card");
            renderCategoryDropdown($card, $(this).val());
            openCategoryDropdown($card);
        });

    $(document)
        .off("click", ".js-ar-category-option")
        .on("click", ".js-ar-category-option", function () {
            const $option = $(this);
            const $card = $option.closest(".ar-editor-card");
            const category = $option.data("value");
            const categories = $card.data("categories") || [];

            if (!categories.includes(category)) {
                syncCardCategories($card, [...categories, category]);
                renderCategoryPills($card);
                renderCategoryDropdown($card, "");
                $card.find(".js-ar-category-search").val("").trigger("focus");
                updateCollapsedSummary($card);
            }
        });

    $(document)
        .off("click", ".js-ar-category-pill")
        .on("click", ".js-ar-category-pill", function () {
            const $pill = $(this);
            const $card = $pill.closest(".ar-editor-card");
            const value = $pill.data("value");
            const categories = ($card.data("categories") || []).filter((item) => item !== value);

            syncCardCategories($card, categories);
            renderCategoryPills($card);
            renderCategoryDropdown($card, $card.find(".js-ar-category-search").val());
            updateCollapsedSummary($card);
        });

    $(document)
        .off("click.arCategoryOutside")
        .on("click.arCategoryOutside", function (e) {
            const $target = $(e.target);
            if ($target.closest(".ar-category-selector").length) return;
            $(".js-ar-category-dropdown").removeClass("is-open");
        });

    $(document)
        .off("input", ".js-brand-name-input")
        .on("input", ".js-brand-name-input", function () {
            const value = $(this).val()?.trim() || "Brand";
            $(".js-brand-name-preview").text(value);
        });

    $(document)
        .off("change", ".js-brand-logo-input")
        .on("change", ".js-brand-logo-input", function () {
            const file = this.files?.[0];
            if (!file || !file.type.startsWith("image/")) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                $(".js-brand-logo-preview").attr("src", e.target.result);
            };
            reader.readAsDataURL(file);
        });

    $(document)
        .off("click", ".js-update-brand")
        .on("click", ".js-update-brand", async function () {
            const $btn = $(this);
            const $wrap = $btn.closest(".ar-brand-editor-card");
            const brandID = $wrap.data("brand-id");
            const name = $wrap.find(".js-brand-name-input").val()?.trim() || "";
            const logoFile = $wrap.find(".js-brand-logo-input")[0]?.files?.[0] || null;

            const originalText = $btn.text();
            $btn.prop("disabled", true).text("Updating...");

            try {
                let logoURL;

                if (logoFile) {
                    const uploaded = await ApiRequest.uploadFile(logoFile);
                    logoURL = uploaded?.fileURL || uploaded?.url || uploaded?.publicUrl;
                }

                const payload = { name };
                if (logoURL) payload.logoURL = logoURL;

                const response = await ApiRequest.updateBrand(brandID, payload);

                if (!response) {
                    throw new Error("Failed to update brand");
                }
            } catch (err) {
                showError(err);
            } finally {
                $btn.prop("disabled", false).text(originalText);
            }
        });

    $(document)
        .off("change", ".js-ar-banner-input")
        .on("change", ".js-ar-banner-input", function () {
            const file = this.files?.[0];
            if (!file || !file.type.startsWith("image/")) return;

            const $card = $(this).closest(".ar-editor-card");
            const reader = new FileReader();

            reader.onload = (e) => {
                $card.find(".js-ar-banner-preview").attr("src", e.target.result);
            };

            $card.data("bannerFile", file);
            reader.readAsDataURL(file);
        });

    $(document)
        .off("change", ".js-gallery-input")
        .on("change", ".js-gallery-input", function () {
            const files = Array.from(this.files || []);
            const $card = $(this).closest(".ar-editor-card");
            const existingGallery = $card.data("gallery") || [];

            const readFilePromises = files
                .filter((file) => file.type.startsWith("image/"))
                .map((file) => {
                    return new Promise((resolve) => {
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            resolve({
                                id: null,
                                url: e.target.result,
                                name: file.name,
                                isNew: true,
                                file
                            });
                        };
                        reader.readAsDataURL(file);
                    });
                });

            Promise.all(readFilePromises).then((newImages) => {
                $card.data("gallery", [...existingGallery, ...newImages]);
                renderGalleryPreview($card);
            });
        });

    $(document)
        .off("click", ".js-ar-gallery-remove")
        .on("click", ".js-ar-gallery-remove", async function (e) {
            e.preventDefault();
            e.stopPropagation();

            const $thumb = $(this).closest(".ar-gallery-thumb");
            const $card = $thumb.closest(".ar-editor-card");
            const index = Number($thumb.data("index"));
            const gallery = [...($card.data("gallery") || [])];
            const targetImage = gallery[index];

            if (!targetImage) return;

            if (!targetImage.id) {
                gallery.splice(index, 1);
                $card.data("gallery", gallery);
                renderGalleryPreview($card);
                return;
            }

            const confirmed = window.confirm("Delete this gallery image?");
            if (!confirmed) return;

            try {
                if (typeof ApiRequest.deleteRestaurantImage === "function") {
                    const response = await ApiRequest.deleteRestaurantImage(targetImage.id);
                    if (!response) {
                        throw new Error("Failed to delete image");
                    }
                }

                gallery.splice(index, 1);
                $card.data("gallery", gallery);
                renderGalleryPreview($card);
            } catch (err) {
                showError(err);
            }
        });

    $(document)
        .off("click", ".js-ar-gallery-preview-btn")
        .on("click", ".js-ar-gallery-preview-btn", function () {
            const $thumb = $(this).closest(".ar-gallery-thumb");
            const $card = $thumb.closest(".ar-editor-card");
            const index = Number($thumb.data("index"));
            const gallery = $card.data("gallery") || [];
            const targetImage = gallery[index];

            if (!targetImage?.url) return;
            openGalleryLightbox(targetImage.url, targetImage.name || "Gallery image");
        });

    $(document)
        .off("click", ".js-ar-gallery-lightbox-close")
        .on("click", ".js-ar-gallery-lightbox-close", function () {
            closeGalleryLightbox();
        });

    $(document)
        .off("click", "#ar-gallery-lightbox")
        .on("click", "#ar-gallery-lightbox", function (e) {
            if (e.target.id === "ar-gallery-lightbox") {
                closeGalleryLightbox();
            }
        });

    $(document)
        .off("keydown.arGalleryLightbox")
        .on("keydown.arGalleryLightbox", function (e) {
            if (e.key === "Escape") {
                closeGalleryLightbox();
            }
        });

    $(document)
        .off("dragover", ".js-gallery-dropzone")
        .on("dragover", ".js-gallery-dropzone", function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass("is-dragging");
        });

    $(document)
        .off("dragleave", ".js-gallery-dropzone")
        .on("dragleave", ".js-gallery-dropzone", function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass("is-dragging");
        });

    $(document)
        .off("drop", ".js-gallery-dropzone")
        .on("drop", ".js-gallery-dropzone", function (e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass("is-dragging");

            const dt = e.originalEvent.dataTransfer;
            const files = Array.from(dt?.files || []);
            const $card = $(this).closest(".ar-editor-card");
            const $input = $card.find(".js-gallery-input");

            const dataTransfer = new DataTransfer();
            files.forEach((file) => dataTransfer.items.add(file));
            $input[0].files = dataTransfer.files;
            $input.trigger("change");
        });

    $(document)
        .off("click", ".js-gallery-dropzone")
        .on("click", ".js-gallery-dropzone", function (e) {
            if ($(e.target).is("input")) return;
            if ($(e.target).closest(".ar-gallery-preview").length) return;
            $(this).find(".js-gallery-input").trigger("click");
        });

    $(document)
        .off("click", ".js-save-restaurant")
        .on("click", ".js-save-restaurant", async function () {
            const $btn = $(this);
            const $card = $btn.closest(".ar-editor-card");

            const originalText = $btn.text();
            $btn.prop("disabled", true).text("Saving...");

            try {
                const bannerURL = await uploadBannerIfNeeded($card);
                const galleryUrls = await uploadGalleryIfNeeded($card);
                const payload = buildRestaurantPayload($card, bannerURL, galleryUrls);

                const response = await ApiRequest.saveRestaurant(payload);

                if (!response) {
                    return
                }

                cacheOriginalValues($card);
                updateCollapsedSummary($card);
                collapseCard($card);

                $card.css("outline", "2px solid var(--accent-yellow)");
                setTimeout(() => $card.css("outline", ""), 1400);
            } catch (err) {
                showError(err);
            } finally {
                $btn.prop("disabled", false).text(originalText);
            }
        });

    $(document)
        .off("click", ".js-remove-restaurant")
        .on("click", ".js-remove-restaurant", async function () {
            const $btn = $(this);
            const $card = $btn.closest(".ar-editor-card");
            const restaurantID = $card.data("id");

            const confirmed = window.confirm("Remove this restaurant?");
            if (!confirmed) return;

            const originalText = $btn.text();
            $btn.prop("disabled", true).text("Removing...");

            try {
                await ApiRequest.deleteRestaurant(restaurantID);

                $card.slideUp(180, function () {
                    $(this).remove();

                    if (!$("#restaurants-list").children().length) {
                        $("#restaurants-empty").show();
                    }
                });
            } catch (err) {
                showError(err);
                $btn.prop("disabled", false).text(originalText);
            }
        });

    $(document)
        .off("click", ".js-ar-add-employee")
        .on("click", ".js-ar-add-employee", async function () {
            const $btn = $(this);
            const $card = $btn.closest(".ar-editor-card");
            const restaurantID = $card.data("id");
            const $input = $card.find(".js-ar-employee-email");
            const email = $input.val()?.trim();

            if (!email) {
                showError(new Error("Please enter an employee email"));
                return;
            }

            const originalText = $btn.text();
            $btn.prop("disabled", true).text("Adding...");

            try {
                const response = await ApiRequest.inviteEmployee({
                    email,
                    restaurantID
                });

                if (!response) {
                    throw new Error("Failed to invite employee");
                }

                const $staffList = $card.find(".js-ar-staff-list");
                $staffList.find(".ar-staff-empty").remove();

                $staffList.append(`
                    <div class="ar-staff-row">
                        <div class="ar-staff-main">
                            <div class="ar-staff-avatar">
                                <img src="/assets/img/default-avatar.png" alt="Pending employee avatar">
                            </div>
                            <div class="ar-staff-copy">
                                <div class="ar-staff-name">Invitation sent</div>
                                <div class="ar-staff-meta">Pending acceptance</div>
                                <div class="ar-staff-meta">${email}</div>
                            </div>
                        </div>
                    </div>
                `);

                $input.val("");
            } catch (err) {
                showError(err);
            } finally {
                $btn.prop("disabled", false).text(originalText);
            }
        });

    $(document)
        .off("click", "#ar-new-btn")
        .on("click", "#ar-new-btn", async function () {
            const template = Template.component.restaurantAdminCard();
            const draftRestaurant = {
                id: `draft-${Date.now()}`,
                name: "New Restaurant",
                description: "",
                bannerURL: "/assets/img/default-avatar.png",
                categoriesText: "",
                timeFrom: "",
                timeTo: "",
                autoApprovedBookingsNum: 0,
                address: {
                    building: "",
                    street: "",
                    city: "",
                    postcode: "",
                    country: ""
                }
            };

            const draftHtml = Mustache.render(template, mapRestaurantToView(draftRestaurant));

            $("#restaurants-empty").hide();
            $("#restaurants-list").prepend(draftHtml);

            const $newCard = $("#restaurants-list").children().first();
            $newCard.data("gallery", []);
            $newCard.data("bannerFile", null);
            $newCard.find(".js-ar-staff-list").html(renderStaffRows([]));
            initialiseCardUi($newCard);
            expandCard($newCard);
        });
}

export default async function loadAdminRestaurants(options = { page: 1 }) {
    const $list = $("#restaurants-list");
    const $empty = $("#restaurants-empty");

    $list.html(`<div class="bc-state-msg">Loading restaurants…</div>`);
    $empty.hide();

    try {
        const response = await ApiRequest.getAdminRestaurants({
            page: options.page,
            limit: 8
        });

        if (!response) {
            throw new Error("No response from restaurant endpoint");
        }

        $list.empty();

        if (response.pagination) {
            renderPagination(response.pagination, loadAdminRestaurants);
        }

        if (response.brand) {
            renderBrandEditor(response.brand);
        }

        if (response.restaurants && response.restaurants.length > 0) {
            const template = Template.component.restaurantAdminCard();

            response.restaurants.forEach((restaurant) => {
                const html = Mustache.render(template, mapRestaurantToView(restaurant));
                $list.append(html);

                const $card = $list.children().last();
                const staff = normaliseStaffList(restaurant);
                const gallery = normaliseGallery(restaurant);

                $card.data("gallery", gallery);
                $card.data("bannerFile", null);
                $card.find(".js-ar-staff-list").html(renderStaffRows(staff));
            });

            initialiseCardUi($list);
            bindRestaurantPageEvents();
        } else {
            $empty.show();
            bindRestaurantPageEvents();
        }
    } catch (err) {
        showError(err);
        $list.html(`
            <div class="col-12 text-center py-5">
                <div class="empty-state p-5">
                    <p class="text-white mb-0">Failed to load restaurants.</p>
                </div>
            </div>
        `);
    }
}