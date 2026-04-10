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
            mesajKutusu.textContent = "Lütfen geçerli bir mail adresi giriniz! (Örn: isim@gmail.com)";
            return; 
        }

        const kullanici = {
            isim: isim,
            soyisim: soyisim,
            email: email,
            sifre: sifre,
            profilFoto: null 
        };

        localStorage.setItem('kullanici', JSON.stringify(kullanici));

        mesajKutusu.style.color = '';
        mesajKutusu.textContent = "Kayıt başarılı! Giriş sayfasına yönlendiriliyorsunuz.";

        setTimeout(() => {
            navigateTo('/login'); 
        }, 1000);
    }
    if (e.target.id === 'login-form') {
        e.preventDefault();

        const girilenEmail = document.getElementById('login-email').value.trim();
        const girilenSifre = document.getElementById('login-sifre').value;
        const mesajKutusu = document.getElementById('login-mesaj');

        const kayitliKullanici = JSON.parse(localStorage.getItem('kullanici'));

        if (kayitliKullanici && kayitliKullanici.email === girilenEmail && kayitliKullanici.sifre === girilenSifre) {
            mesajKutusu.style.color = '';
            mesajKutusu.textContent = "Giriş başarılı! Ana sayfaya yönlendiriliyorsunuz";
            
            localStorage.setItem('oturumAcik', 'true');

            setTimeout(() => {
                navigateTo('/'); 
            }, 1500);
        } else {
            mesajKutusu.style.color = 'red';
            mesajKutusu.textContent = "Hatalı e-posta veya şifre!";
        }
    }
});