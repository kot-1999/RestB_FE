document.addEventListener("DOMContentLoaded", () => {
  console.log("PROFILE PAGE LOADED");

  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");
  const role = document.getElementById("role");
  const saveBtn = document.getElementById("save-profile");
  const avatar = document.getElementById("avatar");
  const avatarUpload = document.getElementById("avatarUpload");

  // ---------- LOAD PROFILE ----------
  const savedProfile = localStorage.getItem("restb:profile");

  if (savedProfile) {
    const profile = JSON.parse(savedProfile);

    firstName.value = profile.firstName || "";
    lastName.value = profile.lastName || "";
    email.value = profile.email || "";
    phone.value = profile.phone || "";
    role.value = profile.role || "USER";

    if (profile.avatar) {
      avatar.src = profile.avatar;
    }
  } else {
    // First time user (fake account)
    role.value = "USER";
  }

  // ---------- SAVE PROFILE ----------
  saveBtn.addEventListener("click", () => {
    const profile = {
      firstName: firstName.value,
      lastName: lastName.value,
      email: email.value,
      phone: phone.value,
      role: role.value,
      avatar: avatar.src
    };

    localStorage.setItem("restb:profile", JSON.stringify(profile));

    alert("Profile updated successfully ✅");
  });

  // ---------- AVATAR UPLOAD ----------
  avatarUpload.addEventListener("change", () => {
    const file = avatarUpload.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
      avatar.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
});
