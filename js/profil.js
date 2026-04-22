window.addEventListener('pageLoaded', (e) => {
    if (e.detail.path !== '/profil') return;
    initProfilPage();
});

function initProfilPage() {
    const user = JSON.parse(localStorage.getItem('kullanici'));
    if (!user) {
        navigateTo('/login');
        return;
    }

    let tempProfilFoto = user.profilFoto;

    const updateProfileView = (isim, soyisim, foto) => {
        const nameEl = document.getElementById('display-name');
        const emailEl = document.getElementById('display-email');
        const container = document.getElementById('profile-img-container');

        if (nameEl) nameEl.textContent = `${isim} ${soyisim}`;
        if (emailEl) emailEl.textContent = user.email;

        if (container) {
            const initials = (isim[0] || '') + (soyisim[0] || '');
            if (foto) {
                container.innerHTML = `
                    <img id="display-profile-img" src="${foto}" alt="Profil" class="profile-main-img" 
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="profile-main-initials" style="display:none;">${initials.toUpperCase()}</div>
                `;
            } else {
                container.innerHTML = `<div class="profile-main-initials">${initials.toUpperCase()}</div>`;
            }
        }
    };

    updateProfileView(user.isim, user.soyisim, user.profilFoto);

    const editIsim = document.getElementById('edit-isim');
    const editSoyisim = document.getElementById('edit-soyisim');
    const editEmail = document.getElementById('edit-email');
    const fileInput = document.getElementById('edit-profile-img');

    if (editIsim) editIsim.value = user.isim;
    if (editSoyisim) editSoyisim.value = user.soyisim;
    if (editEmail) editEmail.value = user.email;

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    tempProfilFoto = event.target.result;

                    const currentUser = JSON.parse(localStorage.getItem('kullanici'));
                    if (currentUser) {
                        const previewUser = { ...currentUser, profilFoto: tempProfilFoto };
                        localStorage.setItem('kullanici', JSON.stringify(previewUser));
                        if (window.updateAuthUI) window.updateAuthUI();

                    }

                    updateProfileView(editIsim.value, editSoyisim.value, tempProfilFoto);
                };
                reader.readAsDataURL(file);
            }
        });
    }

    window.toggleEditMode = (isEdit) => {
        const view = document.getElementById('profile-view');
        const form = document.getElementById('profile-edit-form');
        if (view) view.style.display = isEdit ? 'none' : 'block';
        if (form) form.style.display = isEdit ? 'block' : 'none';

        if (!isEdit) {
            const originalUser = JSON.parse(localStorage.getItem('kullanici'));
            updateProfileView(originalUser.isim, originalUser.soyisim, originalUser.profilFoto);
            tempProfilFoto = originalUser.profilFoto;
            if (window.updateAuthUI) window.updateAuthUI();
        }
    };

    const form = document.getElementById('profile-edit-form');
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const currentUser = JSON.parse(localStorage.getItem('kullanici'));
            const updatedUser = {
                ...currentUser,
                isim: document.getElementById('edit-isim').value.trim(),
                soyisim: document.getElementById('edit-soyisim').value.trim(),
                email: document.getElementById('edit-email').value.trim(),
                profilFoto: tempProfilFoto
            };

            localStorage.setItem('kullanici', JSON.stringify(updatedUser));

            const msg = document.getElementById('profile-mesaj');
            if (msg) {
                msg.style.color = 'var(--accent-color)';
                msg.textContent = t('profile_updated') || 'Profil başarıyla güncellendi!';
            }

            // UI'ları anında güncelle
            if (window.updateAuthUI) window.updateAuthUI();
            updateProfileView(updatedUser.isim, updatedUser.soyisim, updatedUser.profilFoto);

            setTimeout(() => {
                if (msg) msg.textContent = '';
                toggleEditMode(false);
            }, 500);
        });
    }
}
