// Developed by Neocomplexx Group SA - www.neocomplexx.com (2018)
// https://jsonplaceholder.typicode.com - API for testing

var dataCacheName = 'pwaExampleData-v1';
var cacheName = 'pwaExamplePWA-final-1';

/* Attention: /pwa/ is the location on the server used for testing */
var filesToCache = [
  '/pwa/',
  '/pwa/index.html',
  '/pwa/app.js',
  '/pwa/app.css',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css'
];

self.addEventListener('install', event => {
    console.log('[PWA ServiceWorker] Installing...');
    event.waitUntil(
        caches.open(cacheName).then(cache => {
            console.log('[PWA ServiceWorker] Caching resources (APP SHELL)...');
            return cache.addAll(filesToCache);
        })
    );
});

self.addEventListener('activate', event => {
    console.log('[PWA ServiceWorker] Activating...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (!cacheNames.includes(cacheName)) {
                        console.log('[PWA ServiceWorker] Removing expired cache...', key);
                        return caches.delete(key);
                    }
                })
            );
        })
    );

    // The code below lets you activate the service worker faster.
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    console.log('[PWA ServiceWorker] Fetching...', url);
    if (url.origin === 'https://jsonplaceholder.typicode.com') {
        /*
        * The app is asking for new data. 
        * The service worker always goes to the network and then caches the response. 
        * Strategy: "Online First"
        */
        event.respondWith(
            caches.open(dataCacheName).then(cache => {
                return fetch(event.request).then(response => {
                    cache.put(event.request.url, response.clone());
                    return response;
                });
            })
        );
    } else {
        /*
        * The app is asking for resources like html,js,css (APP SHELL).
        * Strategy: "Offline First"
        */
        event.respondWith(
            caches.match(event.request).then(response => {
                return response || fetch(event.request);
            })
        );
    }
});
