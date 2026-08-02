const CACHE_NAME = "kts-v1";

const urlsToCache = [
  "/kanakpur-tarun-sangha-new/",
  "/kanakpur-tarun-sangha-new/index.html",
  "/kanakpur-tarun-sangha-new/style.css",
  "/kanakpur-tarun-sangha-new/dashboard.html"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => response || fetch(event.request))
  );
});
