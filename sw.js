// bumped: the old cache-first strategy below meant a deploy's new files were never seen once
// cached, no matter how many times we redeployed — bumping the name forces `activate` to purge
// whatever any visitor's browser was still holding from before this fix.
const CACHE_NAME = "mahfazti-v2";
const APP_SHELL = [
  "./index.html",
  "./styles.css",
  "./app.js",
  "./groceries.js",
  "./firebase-sync.js",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-512-maskable.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// network-first: always try to get the live deploy first, so updates show up on the next load
// instead of being invisibly stuck behind a cache forever. The cache is only a fallback for
// when the network request fails (offline use), not the default source of truth.
self.addEventListener("fetch", (event) => {
  const req = event.request;

  if (req.method !== "GET") return;

  event.respondWith(
    fetch(req)
      .then((res) => {
        if (res && res.status === 200 && (res.type === "basic" || req.url.includes("fonts"))) {
          const resClone = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, resClone)).catch(() => {});
        }
        return res;
      })
      .catch(() => caches.match(req))
  );
});
