const CACHE_NAME = "routine-trading-ima-v2";
const SHELL_FILES = [
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(SHELL_FILES))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// index.html et les donnees : toujours reseau d'abord (jamais de version perimee)
// Assets statiques (icones, manifest) : cache d'abord pour la vitesse hors-ligne
self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);
  const estPageOuDonnee =
    event.request.mode === "navigate" ||
    url.pathname.endsWith("index.html") ||
    url.pathname === "/" ||
    url.hostname.includes("google.com") ||
    url.hostname.includes("googleusercontent.com");

  if (estPageOuDonnee) {
    event.respondWith(
      fetch(event.request).catch(() => caches.match(event.request))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cached) => cached || fetch(event.request))
  );
});
