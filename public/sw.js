// Parol's offline cache: once the game has loaded, it opens and plays without a connection. Runs played offline
// are kept on the phone and sent to the board when the signal returns (src/App.tsx). Only this site's own files
// are cached; the board (Supabase) always goes to the network.
const CACHE = 'parol-v1'

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(['/', '/loading.css', '/manifest.webmanifest', '/icon.svg'])))
  self.skipWaiting()
})

// A new version clears the old caches.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim()),
  )
})

self.addEventListener('fetch', (event) => {
  const request = event.request
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return
  // The page: the network first, so updates arrive at once; the cached copy when offline.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone()
          caches.open(CACHE).then((cache) => cache.put('/', copy))
          return response
        })
        .catch(() => caches.match('/')),
    )
    return
  }
  // Scripts, styles, fonts and images: their names change with every build, so a cached copy is always right.
  event.respondWith(
    caches.match(request).then(
      (hit) =>
        hit ||
        fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
          }
          return response
        }),
    ),
  )
})
