document.addEventListener('submit', (e) => {

    if (e.target.id === 'register-form') {
        e.preventDefault();

        const isim = document.getElementById('reg-isim').value.trim();
        const soyisim = document.getElementById('reg-soyisim').value.trim();
        const email = document.getElementById('reg-email').value.trim();
        const sifre = document.getElementById('reg-sifre').value;
        const mesajKutusu = document.getElementById('reg-mesaj');
        const mailSablonu = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!mailSablonu.test(email)) {
            mesajKutusu.style.color = '';
            mesajKutusu.textContent = t('register_invalid_email');
            return;
        }

        const profileInput = document.getElementById('reg-profil-foto');
        const file = profileInput ? profileInput.files[0] : null;

        const finalizeRegistration = (fotoUrl) => {
            const kullanici = {
                isim: isim,
                soyisim: soyisim,
                email: email,
                sifre: sifre,
                profilFoto: fotoUrl
            };

            localStorage.setItem('kullanici', JSON.stringify(kullanici));

            mesajKutusu.style.color = '';
            mesajKutusu.textContent = t('register_success');

            setTimeout(() => {
                navigateTo('/login');
            }, 1000);
        };

        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                finalizeRegistration(event.target.result);
            };
            reader.readAsDataURL(file);
        } else {
            finalizeRegistration(null);
        }

    }
    if (e.target.id === 'login-form') {
        e.preventDefault();

        const girilenEmail = document.getElementById('login-email').value.trim();
        const girilenSifre = document.getElementById('login-sifre').value;
        const mesajKutusu = document.getElementById('login-mesaj');

        const kayitliKullanici = JSON.parse(localStorage.getItem('kullanici'));

        if (kayitliKullanici && kayitliKullanici.email === girilenEmail && kayitliKullanici.sifre === girilenSifre) {
            mesajKutusu.style.color = '';
            mesajKutusu.textContent = t('login_success');

            localStorage.setItem('oturumAcik', 'true');
            if (window.updateAuthUI) window.updateAuthUI();

            setTimeout(() => {
                navigateTo('/');
            }, 1500);
        } else {
            mesajKutusu.style.color = 'red';
            mesajKutusu.textContent = t('login_error');
        }
    }
});