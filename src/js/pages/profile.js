// profile.js
export default function profilePage(container) {
  const editBtn = container.querySelector('.edit-profile');
  const modal = container.querySelector('#editProfileModal');
  const closeModal = container.querySelector('#closeModal');

  const avatarHero = container.querySelector('#userAvatar');
  const avatarPreview = container.querySelector('#userAvatarPreview');
  const avatarInput = container.querySelector('#avatarInput');
  const avatarBtn = container.querySelector('#avatarBtn');

  const form = container.querySelector('#updateProfileForm');

  // ----- MODAL OPEN/CLOSE -----
  editBtn.addEventListener('click', () => {
    modal.style.display = 'flex';
    // Sync avatar preview with hero
    avatarPreview.src = avatarHero.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2');
  });

  closeModal.addEventListener('click', () => modal.style.display = 'none');

  window.addEventListener('click', (e) => {
    if (e.target === modal) modal.style.display = 'none';
  });

  // ----- AVATAR UPLOAD -----
  avatarBtn.addEventListener('click', () => avatarInput.click());

  avatarInput.addEventListener('change', () => {
    const file = avatarInput.files && avatarInput.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    avatarPreview.src = url;
    avatarHero.style.backgroundImage = `url(${url})`; // sync with hero avatar
  });

  // ----- FORM SUBMIT (mock) -----
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = {
      firstName: form.firstName.value,
      lastName: form.lastName.value,
      email: form.email.value,
      phone: form.phone.value,
      avatarURL: avatarHero.style.backgroundImage.replace(/url\((['"])?(.*?)\1\)/gi, '$2')
    };

    // Mock save
    console.log('Profile updated:', data);
    alert('Profile updated (mock)!');

    modal.style.display = 'none';
  });
}