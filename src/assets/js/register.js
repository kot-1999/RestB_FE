// src/assets/js/register.js
document.addEventListener("DOMContentLoaded", () => {
  // Only run on register page (new layout)
  const card = document.querySelector(".auth-card");
  if (!card) return;

  const tabs = document.querySelectorAll(".auth-tab");
  const userTypeInput = document.getElementById("userType");
  const title = document.getElementById("registerTitle");

  if (!tabs.length || !userTypeInput) {
    console.warn("Register tabs/userType input not found");
    return;
  }

  const setType = (type) => {
    userTypeInput.value = type;

    tabs.forEach((t) => {
      t.classList.toggle("is-active", t.dataset.type === type);
      t.classList.toggle("active", t.dataset.type === type); // supports either CSS naming
    });

    if (title) {
      title.textContent =
        type === "partner"
          ? "Partner Registration - RestB"
          : "Customer Registration - RestB";
    }
  };

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => setType(tab.dataset.type));
  });

  // default
  setType(userTypeInput.value || "user");
});

