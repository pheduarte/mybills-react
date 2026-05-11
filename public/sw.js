self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.filter((cacheName) => cacheName.startsWith('mybills-shell')).map((cacheName) => caches.delete(cacheName))),
      )
      .then(() => self.registration.unregister()),
  )
})
