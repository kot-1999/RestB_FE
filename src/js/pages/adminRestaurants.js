// Keep jQuery and jQuery UI loaded globally in your HTML before this script

export default function loadAdminRestaurants() {
    console.log("AdminRestaurants module loaded");

    const $root = $("#admin-restaurants-root");
    const $container = $("#restaurants-container");
    const $emptyState = $("#restaurants-empty");
    const templateHtml = $("#restaurant-card-template").html();
    const $newBtn = $("#ar-new-btn");
    const $emptyCreateBtn = $("#ar-empty-create-btn");

    const $lightboxOverlay = $(".ar-lightbox-overlay");
    const $lightboxImage = $lightboxOverlay.find("img");
    const $lightboxClose = $lightboxOverlay.find(".ar-lightbox-close");

    if (!$root.length || !$container.length || !templateHtml) return;

    let restaurants = [];

    init();

    async function init() {
        bindGlobalEvents();
        await loadRestaurantsFromBackend();
        render();
    }

    function bindGlobalEvents() {
        $newBtn.off("click.adminRestaurants").on("click.adminRestaurants", handleCreateRestaurant);
        $emptyCreateBtn.off("click.adminRestaurants").on("click.adminRestaurants", handleCreateRestaurant);

        $lightboxClose.off("click.adminRestaurants").on("click.adminRestaurants", closeLightbox);

        $lightboxOverlay.off("click.adminRestaurants").on("click.adminRestaurants", function (e) {
            if ($(e.target).is($lightboxOverlay)) {
                closeLightbox();
            }
        });

        $(document)
            .off("keydown.adminRestaurants")
            .on("keydown.adminRestaurants", function (e) {
                if (e.key === "Escape") closeLightbox();
            });
    }

    async function loadRestaurantsFromBackend() {
        try {
            const result = await apiGetRestaurants();
            const list = Array.isArray(result?.restaurants) ? result.restaurants : [];
            restaurants = list.map(normalizeRestaurant);
        } catch (err) {
            console.error("Failed to load restaurants:", err);
            restaurants = [];
            showToast("Failed to load restaurants", "error");
        }
    }

    function normalizeRestaurant(r = {}) {
        const photos = Array.isArray(r.photos) ? r.photos : [];
        const photosURL = Array.isArray(r.photosURL) ? r.photosURL : [];

        let coverImage = "";
        let gallery = [];

        if (photos.length) {
            const cover = photos.find((p) => p.kind === "cover") || photos[0];
            coverImage = cover?.url || "";
            gallery = photos
                .filter((p) => p.url && p.url !== coverImage)
                .map((p, index) => ({
                    id: p.id || `gallery_${index}_${Date.now()}`,
                    url: p.url,
                }));
        } else {
            coverImage = r.coverImage || r.coverPhotoURL || r.bannerURL || photosURL[0] || "";
            gallery = photosURL.slice(1).map((url, index) => ({
                id: `gallery_${index}_${Date.now()}`,
                url,
            }));
        }

        return {
            id: r.id,
            name: r.name || "Untitled Restaurant",
            status: normalizeStatus(r.status || "Live"),
            description: r.description || "",
            autoApprove: Number.isFinite(Number(r.autoApprovedBookingsNum))
                ? Number(r.autoApprovedBookingsNum)
                : 0,
            types: Array.isArray(r.categories) ? r.categories.join(", ") : "",
            address: formatAddress(r.address),
            rawAddress: r.address || null,
            opening: r.timeFrom || "09:00",
            closing: r.timeTo || "17:00",
            coverImage,
            gallery,
        };
    }

    function normalizeStatus(status) {
        const value = String(status || "Draft").toLowerCase();
        if (value === "live") return "Live";
        if (value === "hidden") return "Hidden";
        return "Draft";
    }

    function getStatusAttr(status) {
        const value = String(status || "Draft").toLowerCase();
        if (value === "live") return "live";
        if (value === "hidden") return "hidden";
        return "draft";
    }

    function formatAddress(address) {
        if (!address || typeof address !== "object") return "";

        return [
            address.building,
            address.street,
            address.city,
            address.postcode,
            address.country,
        ].filter(Boolean).join(", ");
    }

    function parseAddressString(addressString, fallback = {}) {
        const parts = String(addressString || "")
            .split(",")
            .map((part) => part.trim())
            .filter(Boolean);

        return {
            building: parts[0] || fallback.building || "",
            street: parts[1] || fallback.street || "",
            city: parts[2] || fallback.city || "",
            postcode: parts[3] || fallback.postcode || "",
            country: parts[4] || fallback.country || "",
            latitude: typeof fallback.latitude === "number" ? fallback.latitude : 0,
            longitude: typeof fallback.longitude === "number" ? fallback.longitude : 0,
        };
    }

    function escapeHtml(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    function escapeAttribute(value) {
        return String(value ?? "")
            .replace(/&/g, "&amp;")
            .replace(/"/g, "&quot;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;");
    }

    function showToast(message, type = "") {
        let $stack = $(".ar-toast-stack");

        if (!$stack.length) {
            $stack = $('<div class="ar-toast-stack"></div>');
            $("body").append($stack);
        }

        const toastClass = type ? ` ar-toast--${type}` : "";
        const $toast = $(`<div class="ar-toast${toastClass}"></div>`).text(message);

        $stack.append($toast);

        setTimeout(() => {
            $toast.css({
                opacity: "0",
                transform: "translateY(-4px)",
                transition: "opacity 0.2s ease, transform 0.2s ease",
            });

            setTimeout(() => $toast.remove(), 220);
        }, 2200);
    }

    function openLightbox(src, alt = "Full-size restaurant image") {
        $lightboxImage.attr({ src, alt });
        $lightboxOverlay.addClass("active");
    }

    function closeLightbox() {
        $lightboxOverlay.removeClass("active");
        $lightboxImage.attr("src", "");
    }

    function updateEmptyState() {
        if (restaurants.length) {
            $emptyState.attr("hidden", true).hide();
        } else {
            $emptyState.removeAttr("hidden").show();
        }
    }

    function render() {
        $container.empty();

        if (!restaurants.length) {
            updateEmptyState();
            return;
        }

        updateEmptyState();

        restaurants.forEach((restaurant) => {
            const cardHtml = templateHtml
                .replace(/{{id}}/g, escapeHtml(restaurant.id))
                .replace(/{{name}}/g, escapeHtml(restaurant.name))
                .replace(/{{status}}/g, escapeHtml(restaurant.status))
                .replace(/{{autoApprove}}/g, escapeHtml(restaurant.autoApprove))
                .replace(/{{types}}/g, escapeHtml(restaurant.types))
                .replace(/{{address}}/g, escapeHtml(restaurant.address))
                .replace(/{{opening}}/g, escapeHtml(restaurant.opening))
                .replace(/{{closing}}/g, escapeHtml(restaurant.closing))
                .replace(/{{description}}/g, escapeHtml(restaurant.description));

            const $card = $(cardHtml);
            const $statusChip = $card.find(".ar-card-chip");
            const $coverPreview = $card.find(".ar-cover-preview");
            const $galleryPreview = $card.find(".ar-gallery-preview");
            const $galleryCount = $card.find(".ar-gallery-count");

            $statusChip.attr("data-status", getStatusAttr(restaurant.status));

            renderCover($card, restaurant, $coverPreview);
            renderGallery($card, restaurant, $galleryPreview, $galleryCount);
            bindCardEvents($card, restaurant);

            $container.append($card);
        });
    }

    function renderCover($card, restaurant, $coverPreview) {
        $coverPreview.empty();

        if (!restaurant.coverImage) return;

        const $item = $(`
            <div class="ar-cover-item">
                <img src="${escapeAttribute(restaurant.coverImage)}" alt="${escapeAttribute(restaurant.name || "Restaurant cover image")}">
                <button class="ar-cover-remove-btn" type="button" aria-label="Remove cover image">×</button>
            </div>
        `);

        $item.find("img").on("click", function () {
            openLightbox(restaurant.coverImage, `${restaurant.name} cover image`);
        });

        $item.find(".ar-cover-remove-btn").on("click", async function () {
            await handleRemoveCoverImage(restaurant);
        });

        $coverPreview.append($item);
    }

    function renderGallery($card, restaurant, $galleryPreview, $galleryCount) {
        $galleryPreview.empty();

        (restaurant.gallery || []).forEach((image) => {
            const $item = $(`
                <div class="ar-gallery-item" data-image-id="${escapeAttribute(image.id)}">
                    <img src="${escapeAttribute(image.url)}" class="ar-gallery-thumb" alt="${escapeAttribute(restaurant.name || "Restaurant image")}">
                    <button class="ar-gallery-remove-btn" type="button" aria-label="Remove image">×</button>
                </div>
            `);

            $item.find("img").on("click", function () {
                openLightbox(image.url, `${restaurant.name} image`);
            });

            $item.find(".ar-gallery-remove-btn").on("click", async function () {
                await handleRemoveGalleryImage(restaurant, image.id);
            });

            $galleryPreview.append($item);
        });

        $galleryCount.text(`${restaurant.gallery.length} image${restaurant.gallery.length === 1 ? "" : "s"}`);

        if ($.ui && typeof $galleryPreview.sortable === "function") {
            try {
                $galleryPreview.sortable("destroy");
            } catch (_) {}

            $galleryPreview.sortable({
                items: ".ar-gallery-item",
                tolerance: "pointer",
                update: async function () {
                    const orderedIds = $(this)
                        .children(".ar-gallery-item")
                        .map((_, el) => $(el).attr("data-image-id"))
                        .get();

                    restaurant.gallery = orderedIds
                        .map((id) => restaurant.gallery.find((img) => String(img.id) === String(id)))
                        .filter(Boolean);

                    try {
                        await apiReorderGallery(restaurant.id, orderedIds);
                        showToast("Gallery reordered", "success");
                    } catch (err) {
                        console.error("Failed to reorder gallery:", err);
                        showToast("Failed to reorder gallery", "error");
                        await loadRestaurantsFromBackend();
                        render();
                    }
                },
            });
        }
    }

    function bindCardEvents($card, restaurant) {
        const $name = $card.find(".ar-name");
        const $description = $card.find(".ar-description");
        const $autoApprove = $card.find(".ar-autoapprove");
        const $types = $card.find(".ar-types");
        const $address = $card.find(".ar-address");
        const $opening = $card.find(".ar-opening");
        const $closing = $card.find(".ar-closing");

        const $saveBtn = $card.find(".ar-submit-btn");
        const $removeBtn = $card.find(".ar-remove-btn");

        const $coverDropzone = $card.find(".ar-cover-dropzone");
        const $coverInput = $card.find(".ar-cover-input");

        const $galleryDropzone = $card.find(".ar-gallery-dropzone");
        const $galleryInput = $card.find(".ar-gallery-input");

        $coverDropzone.off(".adminRestaurantsCover");
        $coverInput.off(".adminRestaurantsCover");
        $galleryDropzone.off(".adminRestaurantsGallery");
        $galleryInput.off(".adminRestaurantsGallery");
        $saveBtn.off(".adminRestaurantsSave");
        $removeBtn.off(".adminRestaurantsRemove");

        $coverDropzone.on("click.adminRestaurantsCover", function (e) {
            if ($(e.target).is("input")) return;
            $coverInput.trigger("click");
        });

        $coverInput.on("change.adminRestaurantsCover", async function (e) {
            const file = Array.from(e.target.files || []).find((f) => f.type.startsWith("image/"));
            if (!file) return;
            await uploadCoverImage($card, restaurant, file);
            this.value = "";
        });

        bindDropzoneState($coverDropzone, async (files) => {
            const file = files.find((f) => f.type.startsWith("image/"));
            if (file) await uploadCoverImage($card, restaurant, file);
        }, "adminRestaurantsCover");

        $galleryDropzone.on("click.adminRestaurantsGallery", function (e) {
            if ($(e.target).is("input")) return;
            $galleryInput.trigger("click");
        });

        $galleryInput.on("change.adminRestaurantsGallery", async function (e) {
            const files = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
            if (!files.length) return;
            await uploadGalleryImages($card, restaurant, files);
            this.value = "";
        });

        bindDropzoneState($galleryDropzone, async (files) => {
            const imageFiles = files.filter((f) => f.type.startsWith("image/"));
            if (imageFiles.length) await uploadGalleryImages($card, restaurant, imageFiles);
        }, "adminRestaurantsGallery");

        $removeBtn.on("click.adminRestaurantsRemove", async function () {
            const confirmed = window.confirm(`Remove "${restaurant.name}"? This action cannot be undone.`);
            if (!confirmed) return;

            try {
                setCardBusy($card, true);
                await apiDeleteRestaurant(restaurant.id);
                restaurants = restaurants.filter((item) => item.id !== restaurant.id);
                render();
                showToast("Restaurant removed", "success");
            } catch (err) {
                console.error("Failed to remove restaurant:", err);
                setCardBusy($card, false);
                showToast("Failed to remove restaurant", "error");
            }
        });

        $saveBtn.on("click.adminRestaurantsSave", async function () {
            const originalText = $saveBtn.text();

            try {
                setCardBusy($card, true);
                $saveBtn.text("Saving...");

                const payload = {
                    id: restaurant.id,
                    name: $name.text().trim() || "Untitled Restaurant",
                    description: $description.val().trim(),
                    timeFrom: $opening.val(),
                    timeTo: $closing.val(),
                    categories: $types.val().split(",").map((s) => s.trim()).filter(Boolean),
                    autoApprovedBookingsNum: parseInt($autoApprove.val(), 10) || 0,
                    address: parseAddressString($address.val().trim(), restaurant.rawAddress || {}),
                    media: {
                        coverImage: restaurant.coverImage || "",
                        gallery: restaurant.gallery.map((img) => img.url),
                    },
                };

                const updated = await apiUpdateRestaurant(payload);
                const normalized = normalizeRestaurant(updated);

                restaurants = restaurants.map((item) =>
                    item.id === restaurant.id ? normalized : item
                );

                $saveBtn.text("Saved");
                showToast("Restaurant saved", "success");

                setTimeout(() => {
                    render();
                }, 700);
            } catch (err) {
                console.error("Failed to save restaurant:", err);
                $saveBtn.text("Retry Save");
                setCardBusy($card, false);
                showToast("Failed to save restaurant", "error");
                setTimeout(() => {
                    $saveBtn.text(originalText);
                    setCardBusy($card, false);
                }, 900);
            }
        });
    }

    function bindDropzoneState($dropzone, onFiles, namespace) {
        $dropzone
            .on(`dragenter.${namespace} dragover.${namespace}`, function (e) {
                e.preventDefault();
                e.stopPropagation();
                $dropzone.addClass("is-dragging");
            })
            .on(`dragleave.${namespace} dragend.${namespace}`, function (e) {
                e.preventDefault();
                e.stopPropagation();
                $dropzone.removeClass("is-dragging");
            })
            .on(`drop.${namespace}`, async function (e) {
                e.preventDefault();
                e.stopPropagation();
                $dropzone.removeClass("is-dragging");
                const files = Array.from(e.originalEvent.dataTransfer?.files || []);
                await onFiles(files);
            });
    }

    async function uploadCoverImage($card, restaurant, file) {
        const $dropzone = $card.find(".ar-cover-dropzone");
        const $saveBtn = $card.find(".ar-submit-btn");

        try {
            $dropzone.addClass("is-dragging");
            $saveBtn.prop("disabled", true).text("Uploading...");

            const result = await apiUploadCoverImage(restaurant.id, file);
            restaurant.coverImage = normalizeCoverUploadResult(result);

            render();
            showToast("Cover image uploaded", "success");
        } catch (err) {
            console.error("Failed to upload cover image:", err);
            showToast("Failed to upload cover image", "error");
        } finally {
            $dropzone.removeClass("is-dragging");
            $saveBtn.prop("disabled", false).text("Save Changes");
        }
    }

    async function uploadGalleryImages($card, restaurant, files) {
        const $dropzone = $card.find(".ar-gallery-dropzone");
        const $saveBtn = $card.find(".ar-submit-btn");

        try {
            $dropzone.addClass("is-dragging");
            $saveBtn.prop("disabled", true).text("Uploading...");

            const uploaded = await apiUploadGalleryImages(restaurant.id, files);
            const normalized = normalizeUploadedGallery(uploaded);

            restaurant.gallery = [...restaurant.gallery, ...normalized];

            render();
            showToast(`${normalized.length} image${normalized.length === 1 ? "" : "s"} uploaded`, "success");
        } catch (err) {
            console.error("Failed to upload gallery images:", err);
            showToast("Failed to upload gallery images", "error");
        } finally {
            $dropzone.removeClass("is-dragging");
            $saveBtn.prop("disabled", false).text("Save Changes");
        }
    }

    function normalizeCoverUploadResult(result) {
        if (typeof result === "string") return result;
        if (result?.url) return result.url;
        if (result?.coverImage) return result.coverImage;
        if (result?.coverPhotoURL) return result.coverPhotoURL;
        return "";
    }

    function normalizeUploadedGallery(result) {
        const arr = Array.isArray(result)
            ? result
            : Array.isArray(result?.images)
            ? result.images
            : Array.isArray(result?.photos)
            ? result.photos
            : [];

        return arr
            .map((item, index) => {
                if (typeof item === "string") {
                    return { id: `gallery_${Date.now()}_${index}`, url: item };
                }

                return {
                    id: item?.id || `gallery_${Date.now()}_${index}`,
                    url: item?.url || "",
                };
            })
            .filter((item) => item.url);
    }

    async function handleRemoveCoverImage(restaurant) {
        try {
            await apiDeleteCoverImage(restaurant.id);
            restaurant.coverImage = "";
            render();
            showToast("Cover image removed", "success");
        } catch (err) {
            console.error("Failed to remove cover image:", err);
            showToast("Failed to remove cover image", "error");
        }
    }

    async function handleRemoveGalleryImage(restaurant, imageId) {
        try {
            await apiDeleteGalleryImage(restaurant.id, imageId);
            restaurant.gallery = restaurant.gallery.filter((img) => String(img.id) !== String(imageId));
            render();
            showToast("Image removed", "success");
        } catch (err) {
            console.error("Failed to remove gallery image:", err);
            showToast("Failed to remove image", "error");
        }
    }

    async function handleCreateRestaurant() {
        try {
            const created = await apiCreateRestaurant({
                name: "New Restaurant",
                description: "",
                timeFrom: "09:00",
                timeTo: "17:00",
                categories: [],
                autoApprovedBookingsNum: 0,
                address: {
                    building: "",
                    street: "",
                    city: "",
                    postcode: "",
                    country: "",
                    latitude: 0,
                    longitude: 0,
                },
            });

            const normalized = normalizeRestaurant(created);
            restaurants.unshift(normalized);
            render();
            showToast("Restaurant created", "success");

            const $newCard = $container.find(`.ar-card[data-id="${normalized.id}"]`);
            const $name = $newCard.find(".ar-name");

            if ($name.length) {
                $name.trigger("focus");
                const el = $name.get(0);
                const selection = window.getSelection();
                const range = document.createRange();

                if (el && selection) {
                    range.selectNodeContents(el);
                    selection.removeAllRanges();
                    selection.addRange(range);
                }
            }
        } catch (err) {
            console.error("Failed to create restaurant:", err);
            showToast("Failed to create restaurant", "error");
        }
    }

    function setCardBusy($card, isBusy) {
        $card.find("button").prop("disabled", isBusy);
    }

    async function apiGetRestaurants() {
        const brandID = window.currentBrandID || localStorage.getItem("restb:brandID") || "";
        const params = new URLSearchParams({
            brandID,
            page: "1",
            limit: "50",
        });

        const res = await fetch(`/api/restaurants/admin?${params.toString()}`, {
            method: "GET",
            credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to fetch restaurants (${res.status})`);
        return await res.json();
    }

    async function apiCreateRestaurant(payload) {
        const res = await fetch(`/api/restaurants`, {
            method: "POST",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Failed to create restaurant (${res.status})`);
        return await res.json();
    }

    async function apiUpdateRestaurant(payload) {
        const res = await fetch(`/api/restaurants/${payload.id}`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
        });

        if (!res.ok) throw new Error(`Failed to update restaurant (${res.status})`);
        return await res.json();
    }

    async function apiDeleteRestaurant(restaurantId) {
        const res = await fetch(`/api/restaurants/${restaurantId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to delete restaurant (${res.status})`);
        return await res.json();
    }

    async function apiUploadCoverImage(restaurantId, file) {
        const formData = new FormData();
        formData.append("cover", file);

        const res = await fetch(`/api/restaurants/${restaurantId}/cover`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (!res.ok) throw new Error(`Failed to upload cover image (${res.status})`);
        return await res.json();
    }

    async function apiDeleteCoverImage(restaurantId) {
        const res = await fetch(`/api/restaurants/${restaurantId}/cover`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to delete cover image (${res.status})`);
        return await res.json();
    }

    async function apiUploadGalleryImages(restaurantId, files) {
        const formData = new FormData();
        files.forEach((file) => formData.append("images", file));

        const res = await fetch(`/api/restaurants/${restaurantId}/images`, {
            method: "POST",
            credentials: "include",
            body: formData,
        });

        if (!res.ok) throw new Error(`Failed to upload gallery images (${res.status})`);
        return await res.json();
    }

    async function apiDeleteGalleryImage(restaurantId, imageId) {
        const res = await fetch(`/api/restaurants/${restaurantId}/images/${imageId}`, {
            method: "DELETE",
            credentials: "include",
        });

        if (!res.ok) throw new Error(`Failed to delete gallery image (${res.status})`);
        return await res.json();
    }

    async function apiReorderGallery(restaurantId, orderedImageIds) {
        const res = await fetch(`/api/restaurants/${restaurantId}/images/reorder`, {
            method: "PUT",
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageIds: orderedImageIds }),
        });

        if (!res.ok) throw new Error(`Failed to reorder gallery (${res.status})`);
        return await res.json();
    }
}