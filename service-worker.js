/* ESTATEZW service worker — minimal, safe */
const CACHE = "estatezw-v2";
const SHELL = [
  "./",
  "index.html",
  "assets/css/styles.css",
  "assets/js/main.js",
  "assets/js/data.js",
  "manifest.webmanifest",
  "assets/icons/favicon.svg"
];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);

  // Network-first for HTML navigations
  if (req.mode === "navigate") {
    e.respondWith(
      fetch(req).then(r => { const c = r.clone(); caches.open(CACHE).then(x => x.put(req, c)); return r; })
        .catch(() => caches.match(req).then(r => r || caches.match("index.html")))
    );
    return;
  }

  // Cache-first for same-origin assets and Unsplash images
  if (url.origin === location.origin || url.hostname.includes("images.unsplash.com")) {
    e.respondWith(
      caches.match(req).then(r => r || fetch(req).then(resp => {
        if (resp.ok) { const c = resp.clone(); caches.open(CACHE).then(x => x.put(req, c)); }
        return resp;
      }).catch(() => r))
    );
  }
});
