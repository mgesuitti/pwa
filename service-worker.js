// Developed by Neocomplexx Group SA - www.neocomplexx.com (2018)
// https://jsonplaceholder.typicode.com - API for testing

var DATA_CACHE_NAME = 'pwaExampleData-v1';
var CACHE_NAME = 'pwaExamplePWA-final-1';
var API_URL = 'https://jsonplaceholder.typicode.com';

/* Attention: /pwa/ is the location on the server used for testing */
var filesToCache = [
  '/pwa/',
  '/pwa/index.html',
  '/pwa/app.js',
  '/pwa/app.css',
  'https://stackpath.bootstrapcdn.com/bootstrap/4.1.1/css/bootstrap.min.css'
];

self.addEventListener('install', event => {
    console.log('[ServiceWorker] Installing...');

    // To Extend the installing stage until the promise is resolved
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            console.log('[ServiceWorker] Caching app shell (resources)...');
            return cache.addAll(filesToCache);
        })
    );
});

// Clean-up & Migration
self.addEventListener('activate', event => {
    console.log('[ServiceWorker] Activating...');

    // To Extend the activating stage until the promise is resolved
    event.waitUntil(
        caches.keys().then(CACHE_NAMEs => Promise.all(
                CACHE_NAMEs.map(CACHE_NAME => {
                    if (!CACHE_NAMEs.includes(CACHE_NAME)) {
                        console.log('[ServiceWorker] Removing expired cache...', key);
                        return caches.delete(key);
                    }
                })
            ))
            .then(() => console.log('[ServiceWorker] Now is ready to handle fetches!'))   
    );
      
    // To start controlling all open clients without reloading them
    // Client is our page!
    return self.clients.claim();
});

self.addEventListener('fetch', event => {
    const url = new URL(event.request.url);
    console.log('[ServiceWorker] Fetching... ', url.href);
    
    if (url.origin === API_URL) {
        // Pattern: "Offline First"
        // "Cache then network" strategy
        // We always go to the network & update a cache as we go.
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache =>  {
                return fetch(event.request).then(response => {
                  cache.put(event.request, response.clone());
                  return response;
                });
            })
        );
    } else {
        // Pattern: "Offline First"
        // "Cache, falling back to the network" strategy
        event.respondWith(
            caches.match(event.request)
                .then(response => response || fetch(event))
        );
    }
});
