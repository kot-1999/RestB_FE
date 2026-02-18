// src/assets/js/login.js
// RestB Login (UI + Backend Ready)

document.addEventListener('DOMContentLoaded', function () {
  console.log('Login page loaded');

  // Only run on login page
  if (!document.querySelector('.login-form')) return;

  // UI tabs (your feature)
  initializeUserTypeTabs();

  // Form submission
  const loginForm = document.querySelector('.login-form form');
  if (loginForm) {
    loginForm.addEventListener('submit', handleLogin);
  }
});


// -----------------------------
// USER TYPE TABS (YOUR CODE)
// -----------------------------
function initializeUserTypeTabs() {
  const tabs = document.querySelectorAll('.user-type-tab');
  const userTypeInput = document.getElementById('userType');

  if (!tabs.length || !userTypeInput) return;

  tabs.forEach(tab => {
    tab.addEventListener('click', function () {

      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      const userType = this.getAttribute('data-type');
      userTypeInput.value = userType;

      const formTitle = document.querySelector('.login-form h2');
      if (formTitle) {
        formTitle.textContent =
          userType === 'partner'
            ? 'Partner Login - RestB'
            : 'Customer Login - RestB';
      }

      console.log('User type selected:', userType);
    });
  });
}


// -----------------------------
// LOGIN (BACKEND READY)
// -----------------------------
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const userType = document.getElementById('userType')?.value || 'customer';

  if (!email || !password) {
    showError('Please fill in all fields');
    return;
  }

  if (!isValidEmail(email)) {
    showError('Please enter a valid email');
    return;
  }

  showLoading();

  try {
    const config = window.RestBConfig.getConfig();

    let apiUrl =
      userType === 'partner'
        ? `${config.baseUrl}/api/b2b/v1/authorization/login`
        : `${config.baseUrl}/api/b2c/v1/authorization/login`;

    console.log('LOGIN URL:', apiUrl);

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    let result;
    try {
      result = await response.json();
    } catch {
      result = { message: await response.text() };
    }

    console.log('Login response:', response.status, result);

    if (response.ok) {
      // store token
      if (result.token)
        localStorage.setItem('restb_token', result.token);

      // store user
      if (result.user)
        localStorage.setItem('restb_user', JSON.stringify(result.user));

      showSuccess('Login successful!');

      // TEMP: simulate login if backend incomplete
      if (!result.user) {
        localStorage.setItem(
          'restb_user',
          JSON.stringify({ email, role: userType })
        );
      }

    } else {
      showError(result.message || 'Invalid credentials');
    }

  } catch (err) {
    console.error(err);
    showError('Cannot reach backend yet — this is normal right now.');
  }

  hideLoading();
}


// -----------------------------
// HELPERS
// -----------------------------
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function showError(message) {
  removeMessages();

  const div = document.createElement('div');
  div.className = 'error-message';
  div.textContent = message;
  div.style.cssText =
    'color:#e74c3c;margin-top:1rem;padding:0.5rem;background:#fdf2f2;border-radius:4px;';

  document.querySelector('.login-form form')?.appendChild(div);
}

function showSuccess(message) {
  removeMessages();

  const div = document.createElement('div');
  div.className = 'success-message';
  div.textContent = message;
  div.style.cssText =
    'color:#27ae60;margin-top:1rem;padding:0.5rem;background:#f0f9f4;border-radius:4px;';

  document.querySelector('.login-form form')?.appendChild(div);
}

localStorage.setItem("restb_user", JSON.stringify({
  email,
  role: userType === "partner" ? "admin" : "user"
}));


function removeMessages() {
  document.querySelector('.error-message')?.remove();
  document.querySelector('.success-message')?.remove();
}

function showLoading() {
  const btn = document.querySelector('.login-submit');
  if (!btn) return;
  btn.textContent = 'Logging in...';
  btn.disabled = true;
}

function hideLoading() {
  const btn = document.querySelector('.login-submit');
  if (!btn) return;
  btn.textContent = 'Login';
  btn.disabled = false;
}
