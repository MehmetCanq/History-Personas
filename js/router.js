const urlPagetitle = "History Personas";

window.navigateTo = (path) => {
    window.history.pushState({}, "", path);
    localStorage.setItem('lastRoute', path);
    urlLocationHandler();
};

const urlRoutes = {
    "/404": {
        template: "/pages/404.html",
        title: "404 | " + urlPagetitle,
        description: "Page not found"
    },
    "/": {
        template: "/pages/home.html",
        title: "Home | " + urlPagetitle,
        description: "Anasayfa"
    },
    "/login": {
        template: "/pages/login.html",
        title: "Login | " + urlPagetitle,
        description: "Giriş Yap"
    },
    "/register": {
        template: "/pages/register.html",
        title: "Register | " + urlPagetitle,
        description: "Kayıt Ol"
    },
    "/settings": {
        template: "/pages/settings.html",
        title: "Settings | " + urlPagetitle,
        description: "Ayarlar"
    },
    "/chat": {
        template: "/pages/chat.html",
        title: "Chat | " + urlPagetitle,
        description: "Sohbet Geçmişi"
    },
    "/profil": {
        template: "/pages/profil.html",
        title: "Profil | " + urlPagetitle,
        description: "Profil"
    }
};

const loadNavbar = async () => {
    try {
        const response = await fetch('/navbar/navbar.html');
        const html = await response.text();
        document.getElementById('navbar-container').innerHTML = html;

        if (window.setLanguage && window.currentLang) {
            window.setLanguage(window.currentLang);
        }

        if (typeof window.updateAuthUI === 'function') {
            window.updateAuthUI();
        }
    } catch (error) {
        console.error("Navbar yüklenemedi:", error);
    }
};

const urlLocationHandler = async () => {
    let location = window.location.pathname;

    location = location.split('/').pop();
    if (location === '' || location === 'index.html') {
        location = '/';
    } else {
        location = '/' + location;
    }

    const matchedKey = Object.keys(urlRoutes).find(key =>
        key !== '/' && window.location.pathname.endsWith(key)
    ) || (window.location.pathname.endsWith('/') || window.location.pathname.endsWith('index.html') ? '/' : '/404');

    const route = urlRoutes[matchedKey] || urlRoutes["/404"];

    const navbar = document.querySelector('.navbar');
    if (route.template === '/pages/404.html') {
        if (navbar) navbar.style.display = 'none';
        document.body.classList.add('no-navbar');
    } else {
        if (navbar) navbar.style.display = 'flex';
        document.body.classList.remove('no-navbar');
    }

    if (window.updateAuthUI) window.updateAuthUI();

    try {
        const response = await fetch(route.template + '?v=' + Date.now(), { cache: "no-store" });
        const html = await response.text();

        const app = document.getElementById("app");
        if (app) {
            app.innerHTML = html;
            if (window.setLanguage && window.currentLang) {
                window.setLanguage(window.currentLang);
            }
        }

        document.title = route.title;
        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", route.description);

        window.dispatchEvent(new CustomEvent('pageLoaded', { detail: { path: matchedKey } }));

    } catch (error) {
        console.error("Sayfa yüklenirken hata oluştu:", error);
        document.getElementById("app").innerHTML = "<h1>Sayfa yüklenemedi.</h1>";
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();

    const savedRoute = localStorage.getItem('lastRoute');
    const currentPath = window.location.pathname;

    if (savedRoute && savedRoute !== '/' && (currentPath === '/' || currentPath.endsWith('/') || currentPath.endsWith('index.html'))) {
        window.history.replaceState({}, "", savedRoute);
    }

    urlLocationHandler();

    document.addEventListener("click", (e) => {
        const target = e.target.closest("a");
        if (!target) return;

        const href = target.getAttribute("href");
        if (href && href.startsWith("/") && !target.hasAttribute('target')) {
            const isExternal = href.startsWith('http') || target.getAttribute('target') === '_blank';
            if (!isExternal) {
                e.preventDefault();
                window.navigateTo(href);
            }
        }
    });
});

window.onpopstate = urlLocationHandler;
