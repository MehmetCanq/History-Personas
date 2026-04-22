let selectedPersonaId = null;

window.showToast = (message, type = 'info') => {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <div class="toast-content">
            <span class="toast-message">${message}</span>
        </div>
    `;

    container.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('fading');
        setTimeout(() => toast.remove(), 1000);
    }, 1000);
};


window.showCharacterCard = (id) => {
    const character = characters.find(c => c.id === id);
    if (!character) return;

    selectedPersonaId = id;

    document.getElementById('modal-name').textContent = character.name;
    document.getElementById('modal-era').textContent = t(character.era);
    document.getElementById('modal-expertise').textContent = character.expertise.main.map(exp => t(exp)).join(', ');
    document.getElementById('modal-bio').textContent = t('bio_' + character.id);
    document.getElementById('modal-img').src = character.image;

    document.getElementById('character-modal').style.display = 'flex';
};

window.closePersonaModal = () => {
    document.getElementById('character-modal').style.display = 'none';
};

window.updateAuthUI = () => {
    const authContainer = document.getElementById('navbar-auth');
    if (!authContainer) return;

    const isLogged = localStorage.getItem('oturumAcik') === 'true';
    const user = JSON.parse(localStorage.getItem('kullanici'));

    if (isLogged && user) {
        const initials = (user.isim[0] || '') + (user.soyisim[0] || '');
        const profileContent = user.profilFoto
            ? `<img src="${user.profilFoto}" class="user-nav-img" alt="Profil" 
                    onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
               <div class="user-nav-initials" style="display:none;">${initials.toUpperCase()}</div>`
            : `<div class="user-nav-initials">${initials.toUpperCase()}</div>`;

        authContainer.innerHTML = `
            <div class="user-nav-wrapper">
                <div class="user-nav-profile" onclick="navigateTo('/profil')">
                    ${profileContent}
                </div>
                <div class="user-nav-dropdown">
                    <div class="dropdown-header">
                        <p class="dropdown-name">${user.isim} ${user.soyisim}</p>
                        <p class="dropdown-email">${user.email}</p>
                    </div>
                    <div class="dropdown-divider"></div>
                    <a href="/profil" class="dropdown-item" data-i18n="profile_edit_btn">${t('profile_edit_btn')}</a>
                    <a href="/settings" class="dropdown-item" data-i18n="nav_settings">${t('nav_settings')}</a>
                    <div class="dropdown-divider"></div>
                    <button onclick="window.logout()" class="dropdown-item logout-link" data-i18n="profile_logout_btn">${t('profile_logout_btn')}</button>
                </div>
            </div>
        `;
    } else {
        authContainer.innerHTML = `
            <a href="/login" class="nav-login-btn" data-i18n="login_title">${t('login_title')}</a>
            <a href="/register" class="nav-register-btn" data-i18n="register_title">${t('register_title')}</a>
        `;
    }
};

window.logout = () => {
    localStorage.removeItem('oturumAcik');
    if (window.updateAuthUI) window.updateAuthUI();
    navigateTo('/');
};

window.startChat = () => {
    if (!selectedPersonaId) return;

    const isLogged = localStorage.getItem('oturumAcik') === 'true';
    if (!isLogged) {

        window.showToast(t('toast_login_required'), "warning");
        setTimeout(() => {
            navigateTo('/login');
        }, 2000);
        return;
    }

    console.log("[App] Sohbet başlatılıyor, Karakter ID:", selectedPersonaId);
    localStorage.setItem('selectedPersonaId', selectedPersonaId);

    closePersonaModal();
    console.log("[App] Navigating to /chat...");
    navigateTo('/chat');
};

window.onclick = function (event) {
    const modal = document.getElementById('character-modal');
    if (event.target == modal) {
        closePersonaModal();
    }
}

window.initializeSearch = () => {
    console.log("[Search] initializeSearch fonksiyonu çağrıldı.");
    const searchInput = document.getElementById('search-persona');
    const gallery = document.querySelector('.persona-gallery');

    if (!searchInput) {
        console.warn("[Search] HATA: 'search-persona' ID'li input bulunamadı!");
        return;
    }
    if (!gallery) {
        console.warn("[Search] HATA: '.persona-gallery' sınıfına sahip galeri bulunamadı!");
        return;
    }

    if (searchInput.dataset.searchInitialized) {
        console.log("[Search] Zaten başlatılmış, atlanıyor.");
        return;
    }

    searchInput.dataset.searchInitialized = "true";
    console.log("[Search] Arama sistemi BAŞARIYLA başlatıldı.");

    searchInput.addEventListener('focus', () => {
        console.log("[Search] Arama çubuğuna tıklandı.");
    });

    searchInput.addEventListener('input', (e) => {
        const normalize = (str) => {
            return str.toLowerCase()
                .replace(/ğ/g, 'g')
                .replace(/ü/g, 'u')
                .replace(/ş/g, 's')
                .replace(/ı/g, 'i')
                .replace(/ö/g, 'o')
                .replace(/ç/g, 'c')
                .trim();
        };

        const rawValue = e.target.value;
        const term = normalize(rawValue);
        console.log(`[Search] Yazı yazılıyor: "${rawValue}" -> Normalize: "${term}"`);

        const cards = gallery.querySelectorAll('.persona-card');
        console.log(`[Search] ${cards.length} adet kart filtreleniyor...`);

        let foundCount = 0;
        cards.forEach(card => {
            const nameEl = card.querySelector('.persona-name');
            if (!nameEl) return;

            const name = normalize(nameEl.textContent);
            if (name.includes(term)) {
                card.style.display = 'flex';
                foundCount++;
                if (card.classList.contains('hidden')) {
                    card.classList.remove('hidden');
                    card.style.animation = 'pageFadeIn 0.3s ease';
                }
            } else {
                card.style.display = 'none';
                card.classList.add('hidden');
            }
        });
        console.log(`[Search] Filtreleme bitti. ${foundCount} sonuç gösteriliyor.`);
    });
};

window.addEventListener('pageLoaded', (e) => {
    console.log("[App] 'pageLoaded' olayı yakalandı! Hedef Yol:", e.detail.path);


    window.initializeSearch();

    setTimeout(() => {
        console.log("[App] DOM yerleşimi için gecikmeli arama kontrolü başlatılıyor...");
        window.initializeSearch();
    }, 200);
});
