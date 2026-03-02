// Keep jQuery and jQuery UI loaded globally in your HTML before this script

export default function loadAdminRestaurants() {
    console.log("AdminRestaurants module loaded");

    const $container = $("#restaurants-container");
    const $emptyState = $("#restaurants-empty");
    const $template = $("#restaurant-card-template").html();
    const $newBtn = $("#ar-new-btn");
    const $lightboxOverlay = $(".ar-lightbox-overlay");
    const $lightboxImage = $lightboxOverlay.find("img");

    if (!$container.length) return;

    // Load restaurants from localStorage or seed default
    let restaurants = [];
    try {
        restaurants = JSON.parse(localStorage.getItem("restb:adminrestaurants")) || [];
    } catch { restaurants = []; }

    if (!restaurants.length) {
        restaurants = [{
            id: Date.now(),
            name: "Sakura Sushi",
            autoApprove: 4,
            types: "Japanese, Sushi",
            address: "12 Tokyo Street",
            opening: "12:00",
            closing: "22:00",
            gallery: [],
        }];
        localStorage.setItem("restb:adminrestaurants", JSON.stringify(restaurants));
    }

    // Render function
    function render() {
        $container.empty();
        if (!restaurants.length) {
            $emptyState.show();
            return;
        }
        $emptyState.hide();

        restaurants.forEach(r => {
            let cardHtml = $template
                .replace(/{{id}}/g, r.id)
                .replace(/{{name}}/g, r.name)
                .replace(/{{autoApprove}}/g, r.autoApprove)
                .replace(/{{types}}/g, r.types)
                .replace(/{{address}}/g, r.address)
                .replace(/{{opening}}/g, r.opening)
                .replace(/{{closing}}/g, r.closing);

            const $card = $(cardHtml);
            const $galleryPreview = $card.find(".ar-gallery-preview");
            r.gallery = r.gallery || [];

            // Helper to add gallery image
            function addGalleryImage(url) {
                r.gallery.push(url);
                const $item = $(`
          <div class="ar-gallery-item">
            <img src="${url}" class="ar-gallery-thumb">
            <button class="ar-gallery-remove-btn">Remove</button>
          </div>
        `);

                $item.find(".ar-gallery-remove-btn").click(() => {
                    r.gallery = r.gallery.filter(u => u !== url);
                    localStorage.setItem("restb:adminrestaurants", JSON.stringify(restaurants));
                    render();
                });

                $item.find("img").click(() => {
                    $lightboxImage.attr("src", url);
                    $lightboxOverlay.addClass("active");
                });

                $galleryPreview.append($item);
            }

            // Load existing gallery
            r.gallery.forEach(url => addGalleryImage(url));

            // Upload input & dropzone
            const $input = $card.find(".ar-gallery-input");
            const $dropzone = $card.find(".ar-gallery-dropzone");

            $dropzone.click(() => $input.click());

            $input.on("change", e => {
                Array.from(e.target.files).forEach(file => {
                    const reader = new FileReader();
                    reader.onload = evt => addGalleryImage(evt.target.result);
                    reader.readAsDataURL(file);
                });
            });

            $dropzone.on("dragover", e => { e.preventDefault(); $dropzone.addClass('ar-gallery-dragover'); })
                .on("dragleave", e => { e.preventDefault(); $dropzone.removeClass('ar-gallery-dragover'); })
                .on("drop", e => {
                    e.preventDefault(); $dropzone.removeClass('ar-gallery-dragover');
                    Array.from(e.originalEvent.dataTransfer.files)
                        .filter(f => f.type.startsWith("image/"))
                        .forEach(file => {
                            const reader = new FileReader();
                            reader.onload = evt => addGalleryImage(evt.target.result);
                            reader.readAsDataURL(file);
                        });
                });

            // Sortable gallery with jQuery UI
            if ($.ui && $galleryPreview.sortable) {
                $galleryPreview.sortable({
                    update: function() {
                        r.gallery = $(this).children().map((i, el) => $(el).find("img").attr("src")).get();
                        localStorage.setItem("restb:adminrestaurants", JSON.stringify(restaurants));
                    }
                });
            }

            // Remove restaurant
            $card.find(".ar-remove-btn").click(() => {
                restaurants = restaurants.filter(x => x.id !== r.id);
                localStorage.setItem("restb:adminrestaurants", JSON.stringify(restaurants));
                render();
            });

            // Submit changes
            $card.find(".ar-submit-btn").click(() => {
                r.name = $card.find(".ar-name").text().trim();
                r.autoApprove = parseInt($card.find(".ar-autoapprove").val(), 10) || 0;
                r.types = $card.find(".ar-types").val().trim();
                r.address = $card.find(".ar-address").val().trim();
                r.opening = $card.find(".ar-opening").val();
                r.closing = $card.find(".ar-closing").val();
                localStorage.setItem("restb:adminrestaurants", JSON.stringify(restaurants));
                alert("Saved!");
            });

            $container.append($card);
        });

        // Lightbox close
        $lightboxOverlay.click(e => {
            if ($(e.target).is($lightboxOverlay) || $(e.target).is("img")) {
                $lightboxOverlay.removeClass("active");
            }
        });
    }

    // Create new restaurant button
    $newBtn.click(() => {
        const newRestaurant = {
            id: Date.now(),
            name: "New Restaurant",
            autoApprove: 0,
            types: "",
            address: "",
            opening: "09:00",
            closing: "17:00",
            gallery: [],
        };
        restaurants.unshift(newRestaurant);
        localStorage.setItem("restb:adminrestaurants", JSON.stringify(restaurants));
        render();
    });

    render();
}