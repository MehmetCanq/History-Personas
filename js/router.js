
const routes = {
    "/": "/pages/home.html",
    "/login": "/pages/login.html",
    "/register": "/pages/register.html",
    "/settings": "/pages/settings.html",
    
};

const loadNavbar = async () => {
    try {
        const response = await fetch('/navbar/navbar.html');
        const html = await response.text();
        document.getElementById('navbar-container').innerHTML = html;
    } catch (error) {
        console.error("Navbar yüklenemedi:", error);
    }
};

const router = async () => {
    const path = window.location.pathname; 

    if (path === '/index.html') {
        path = '/';
    }
    const route = routes[path] || "/pages/404.html";
    try {
        const response = await fetch(route);
        if (!response.ok) throw new Error('Sayfa bulunamadı'); 
        
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
    } catch (error) {
        const response = await fetch('/pages/404.html');
        const html = await response.text();
        document.getElementById('app').innerHTML = html;
    }
};

const navigateTo = (url) => {
    window.history.pushState(null, null, url);
    router();
};

document.addEventListener("DOMContentLoaded", () => {
    loadNavbar();
    document.body.addEventListener("click", e => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault(); 
            navigateTo(e.target.href); 
        }
    });

    window.addEventListener("popstate", router);
    router();
});