export default function loadResetPassword() {
  console.log("ResetPassword module loaded");

  // 1️⃣ Grab the token from the URL hash
  const hash = window.location.hash.replace("#", ""); // e.g. "reset-password?token=XYZ"
  const [, query] = hash.split("?");
  const token = query ? new URLSearchParams(query).get("token") : null;

  if (!token) {
    alert("Reset token missing. Please use the link sent to your email.");
    return;
  }

  // 2️⃣ Get the form container
  const content = document.getElementById("content");
  const formContainer = document.createElement("div");
  formContainer.innerHTML = `
    <main class="reset-password-page">
      <h1>Reset Password</h1>
      <p>Enter your new password below.</p>
      <form id="resetPasswordForm">
        <label for="newPassword">New Password</label>
        <input type="password" id="newPassword" name="newPassword" required>
        
        <label for="confirmPassword">Confirm Password</label>
        <input type="password" id="confirmPassword" name="confirmPassword" required>
        
        <button type="submit">Reset Password</button>
      </form>
      <div id="resetPasswordMessage" style="color:red; margin-top:10px;"></div>
    </main>
  `;
  content.innerHTML = "";
  content.appendChild(formContainer);

  const form = document.getElementById("resetPasswordForm");
  const messageDiv = document.getElementById("resetPasswordMessage");

  // 3️⃣ Handle form submission
  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const newPassword = document.getElementById("newPassword").value.trim();
    const confirmPassword = document.getElementById("confirmPassword").value.trim();

    if (newPassword.length < 6) {
      messageDiv.textContent = "Password must be at least 6 characters long.";
      return;
    }

    if (newPassword !== confirmPassword) {
      messageDiv.textContent = "Passwords do not match.";
      return;
    }

    messageDiv.textContent = "";

    try {
      // 4️⃣ Send token + new password to backend
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        messageDiv.textContent = data.message || "Failed to reset password.";
        return;
      }

      // 5️⃣ Success feedback
      alert("Password reset successfully! You can now log in.");
      window.location.hash = "#login"; // redirect to login page
    } catch (err) {
      console.error(err);
      messageDiv.textContent = "Network error. Please try again later.";
    }
  });
}