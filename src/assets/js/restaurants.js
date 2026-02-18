// src/assets/js/restaurants.js
document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector(".rest-search");
  const qInput = document.getElementById("q");
  const sortSelect = document.getElementById("sort");
  const distanceSelect = document.getElementById("distance");
  const dateInput = document.getElementById("date"); // UI-only for now
  const categorySelect = document.getElementById("category");

  const grid = document.getElementById("restaurants-grid");
  const countEl = document.getElementById("results-count");
  if (!grid) return;

  const cards = Array.from(grid.querySelectorAll(".restaurant-card"));

  // Stop page reload (filter client-side)
  form?.addEventListener("submit", (e) => e.preventDefault());

  const normalize = (str) => (str || "").toString().toLowerCase().trim();

  const getCardData = (card) => ({
    name: card.dataset.name || "",
    brand: card.dataset.brand || "",
    category: card.dataset.category || "",
    distance: Number(card.dataset.distance || "9999"),
    rating: Number(card.dataset.rating || "0"),
    availability: Number(card.dataset.availability || "0"),
    text: normalize(card.textContent),
  });

  function applyFilters() {
    const q = normalize(qInput?.value);
    const maxDistance = distanceSelect?.value ? Number(distanceSelect.value) : null;
    const category = categorySelect?.value ? normalize(categorySelect.value) : "";

    let visibleCards = cards.filter((card) => {
      const d = getCardData(card);

      // Search
      if (q) {
        const hay = normalize(`${d.name} ${d.brand} ${d.category} ${d.text}`);
        if (!hay.includes(q)) return false;
      }

      // Distance
      if (maxDistance !== null && d.distance > maxDistance) return false;

      // Category
      if (category && normalize(d.category) !== category) return false;

      // Date is UI only until backend provides availability-by-date
      return true;
    });

    // Sort
    const sortBy = sortSelect?.value || "";
    if (sortBy === "rating") {
      visibleCards.sort((a, b) => getCardData(b).rating - getCardData(a).rating);
    } else if (sortBy === "distance") {
      visibleCards.sort((a, b) => getCardData(a).distance - getCardData(b).distance);
    } else if (sortBy === "availability") {
      visibleCards.sort((a, b) => getCardData(b).availability - getCardData(a).availability);
    }

    // Render
    cards.forEach((c) => (c.style.display = "none"));
    visibleCards.forEach((c) => {
      c.style.display = "";
      grid.appendChild(c);
    });

    if (countEl) {
      countEl.textContent = `Showing ${visibleCards.length} restaurant${
        visibleCards.length === 1 ? "" : "s"
      }`;
    }
    const noResults = document.getElementById("no-results");
if (noResults) {
  noResults.style.display = visibleCards.length === 0 ? "block" : "none";
}
  }


  applyFilters();

  qInput?.addEventListener("input", applyFilters);
  sortSelect?.addEventListener("change", applyFilters);
  distanceSelect?.addEventListener("change", applyFilters);
  categorySelect?.addEventListener("change", applyFilters);
  dateInput?.addEventListener("change", applyFilters);
});
