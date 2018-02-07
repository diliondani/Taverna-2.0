var staticCacheName = 'taverna-static-v1'

self.addEventListener('install', function (event) {
    event.waitUntil(
        caches.open(staticCacheName).then(function (cache) {
            return cache.addAll([
                '/',
                'public/images/sapalomera-small.svg',
                'https://cdn.ampproject.org/v0/amp-analytics-0.1.js',
                'https://cdn.ampproject.org/v0.js',
                'https://cdn.ampproject.org/v0/amp-install-serviceworker-0.1.js',
                'https://cdn.ampproject.org/v0/amp-user-notification-0.1.js',
                'https://cdn.ampproject.org/v0/amp-font-0.1.js',
                'https://fonts.googleapis.com/css?family=Roboto|Trochut:700&amp;text=Taverna',
                'https://fonts.googleapis.com/css?family=Quattrocento+Sans:400,400i,700,700i&amp;subset=latin-ext'
            ]);
        })
    );
});

self.addEventListener('activate', function(event) {
    event.waitUntil(
      caches.keys().then(function(cacheNames) {
        return Promise.all(
          cacheNames.filter(function(cacheName) {
            return cacheName.startsWith('taverna-') &&
                   cacheName != staticCacheName;
          }).map(function(cacheName) {
            return caches.delete(cacheName);
          })
        );
      })
    );
  });

self.addEventListener('fetch', function (event) {
    event.respondWith(
        caches.match(event.request).then(function (response) {
            return response || fetch(event.request);
        })
    );
});