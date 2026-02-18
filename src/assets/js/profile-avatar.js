document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("avatarInput");
  const btn = document.querySelector(".avatar-btn");
  const img = document.getElementById("profileAvatar");
  const form = document.getElementById("avatarForm");

  if (!input || !btn || !img || !form) return;

  btn.addEventListener("click", () => input.click());

  input.addEventListener("change", async () => {
    const file = input.files?.[0];
    if (!file) return;

    // quick client-side preview
    const url = URL.createObjectURL(file);
    img.src = url;

    // upload to backend
    const fd = new FormData();
    fd.append("avatar", file);

    try {
      const res = await fetch(form.action, { method: "POST", body: fd });
      if (!res.ok) throw new Error("Upload failed");

      // if backend returns { avatarUrl: "..." }, replace preview with real URL:
      const data = await res.json().catch(() => null);
      if (data?.avatarUrl) img.src = data.avatarUrl;
    } catch (e) {
      console.error(e);
      // revert if upload fails (optional)
      // location.reload();
      alert("Avatar upload failed. Please try again.");
    }
  });
});
