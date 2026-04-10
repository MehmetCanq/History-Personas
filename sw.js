self.addEventListener('fetch', (event) => {
  event.respondWith(
    fetch(event.request).catch(() => {
      //  indexi döndür la gayrı
      return caches.match('/index.html') || fetch('/index.html');
    }).then(response => {
      if (response.status === 404) {
        return fetch('pages/404.html'); 
      }
      return response;
    })
  );
});