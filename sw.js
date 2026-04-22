self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  const appRoutes = ['/chat', '/login', '/register', '/settings', '/profil'];

  if (event.request.mode === 'navigate' && appRoutes.includes(url.pathname)) {
    const isInternal = event.request.referrer && event.request.referrer.startsWith(self.location.origin);

    if (isInternal) {
      event.respondWith(fetch('/index.html'));
    } else {
      event.respondWith(fetch('/pages/404.html'));
    }
    return;
  }

  event.respondWith(
    fetch(event.request).catch(() => {
      return caches.match('/index.html') || fetch('/index.html');
    }).then(response => {
      if (response.status === 404) {
        return fetch('/pages/404.html');
      }
      return response;
    })
  );
});