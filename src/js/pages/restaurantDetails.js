import ApiRequest from "../utils/ApiRequest.js";

export default async function loadRestaurantDetails() {
  // 1. Parse the ID from the URL hash
  const hash = window.location.hash;
  const queryString = hash.includes('?') ? hash.substring(hash.indexOf('?')) : '';
  const params = new URLSearchParams(queryString);
  const restaurantID = params.get('id');

  if (!restaurantID) return;

  // 2. Fetch the specific restaurant data
  const restaurant = await ApiRequest.getRestaurantDetails(restaurantID);

  if (restaurant) {
    // 3. Update the text elements (matches your original Pug IDs)
    const nameEl = document.getElementById('rb-name');
    const descEl = document.getElementById('rb-desc');
    const longDescEl = document.getElementById('rb-long-desc'); // If you have a long description area

    if (nameEl) nameEl.textContent = restaurant.name;
    if (descEl) descEl.textContent = restaurant.description || "No description available.";
    if (longDescEl) longDescEl.textContent = restaurant.description;

    // 4. Update the Banner Image safely
    const bannerImg = document.getElementById('rb-banner-img');
    if (bannerImg) {
      bannerImg.src = restaurant.bannerURL || 'https://picsum.photos/seed/res/800/500';
      bannerImg.style.width = '100%';
      bannerImg.style.maxHeight = '500px'; // Keeps it from exploding in size
      bannerImg.style.objectFit = 'cover';
      bannerImg.style.borderRadius = '12px';
    }

    // 5. Render the Gallery List
    const galleryContainer = document.getElementById('rb-gallery-list' );
    if (galleryContainer && restaurant.galleryImages && restaurant.galleryImages.length > 0) {
      // We map the images into small, consistent thumbnails
      galleryContainer.innerHTML = restaurant.galleryImages.map(img => `
                <div class="rb-gallery-item" style="width: 100px; height: 100px; display: inline-block; margin: 5px; border-radius: 8px; overflow: hidden; border: 1px solid rgba(255,255,255,0.1);">
                    <img src="${img}" onerror="this.src='https://picsum.photos/seed/res/200/200'" style="width: 100%; height: 100%; object-fit: cover;">
                </div>
            ` ).join('');

      // Ensure the container itself doesn't break the layout
      galleryContainer.style.display = 'block';
      galleryContainer.style.marginTop = '15px';
      galleryContainer.style.overflowX = 'auto';
      galleryContainer.style.whiteSpace = 'nowrap';
    }
  }

  // TODO Add on submit function with console.log
}
