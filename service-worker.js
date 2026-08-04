const CACHE_NAME = "kts-v4";

const urlsToCache = [
  "/",
  "/index.html",
  "/about.html",
  "/members.html",
  "/events.html",
  "/gallery.html",
  "/notices.html",
  "/contact.html",

  "/style.css",
  "/script.js",
  "/gallery.js",
  "/firebase.js",

  "/123.png.png"
];

self.addEventListener("install", event => {

  event.waitUntil(

    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))

  );

  self.skipWaiting();

});

self.addEventListener("activate", event => {

  event.waitUntil(

    caches.keys().then(keys =>
      Promise.all(
        keys.map(key => {

          if (key !== CACHE_NAME) {

            return caches.delete(key);

          }

        })
      )
    )

  );

  self.clients.claim();

});

self.addEventListener("fetch", event => {

  event.respondWith(

    caches.match(event.request).then(response => {

      return response || fetch(event.request);

    })

  );

});
