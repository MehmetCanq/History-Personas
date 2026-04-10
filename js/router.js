const urlPagetitle = "History Personas";

window.navigateTo = (path) => {
    window.history.pushState({}, "", path);
    urlLocationHandler();
};

const urlRoutes = {
    404: {
        template: "pages/404.html",
        title: "404 | " + urlPagetitle,
        description: "Page not found"
    },
    "/": {
        template: "pages/home.html",
        title: "Home | " + urlPagetitle,
        description: "Anasayfa"
    },
    "/login": {
        template: "pages/login.html",
        title: "Login | " + urlPagetitle,
        description: "Giriş Yap"
    },
    "/register": {
        template: "pages/register.html",
        title: "Register | " + urlPagetitle,
        description: "Kayıt Ol"
    },
    "/settings": {
        template: "pages/settings.html",
        title: "Settings | " + urlPagetitle,
        description: "Ayarlar"
    },
    "/chat": {
        template: "pages/chat.html",
        title: "Chat | " + urlPagetitle,
        description: "Sohbet"
    },
    "/profil": {
        template: "pages/profil.html",
        title: "Profil | " + urlPagetitle,
        description: "Profil"
    }
};

const loadNavbar = async () => {
    try {
        const response = await fetch('navbar/navbar.html');
        const html = await response.text();
        document.getElementById('navbar-container').innerHTML = html;
    } catch (error) {
        console.error("Navbar yüklenemedi:", error);
    }
};

const urlLocationHandler = async () => {
    let location = window.location.pathname;

        const route = urlRoutes[location] || urlRoutes["pages/404.html"] || urlRoutes[404];

    try {
        const response = await fetch(route.template);
        const html = await response.text();
        document.getElementById("app").innerHTML = html;
        document.title = route.title;

        const meta = document.querySelector('meta[name="description"]');
        if (meta) meta.setAttribute("content", route.description);

        window.dispatchEvent(new CustomEvent('pageLoaded', { detail: { path: location } }));
        
    } catch (error) {
        console.error("Sayfa yüklenirken hata oluştu:", error);
        document.getElementById("app").innerHTML = "<h1>Sayfa yüklenemedi.</h1>";
    }
};

document.addEventListener("DOMContentLoaded", async () => {
    await loadNavbar();
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
