/**
 * @description       : Service Worker for Deuditas PWA offline support and caching.
 * @group             : ServiceWorker
 * @author            : Emerson VI
 * @last modified on  : 2026-08-19
 **/

const CACHE_NAME = 'deuditas-v1'
const PRECACHE_URLS = [
  '/Deuditas/',
  '/Deuditas/index.html',
  '/Deuditas/manifest.webmanifest',
  '/Deuditas/favicon.svg',
  '/Deuditas/icons.svg'
]

// Install: precache core static files
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_URLS).catch((err) => {
        console.warn('Precache failed for some URLs:', err)
      })
    }).then(() => self.skipWaiting())
  )
})

// Activate: cleanup old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    }).then(() => self.clients.claim())
  )
})

// Fetch: Network-first for HTML, Cache-first with network fallback for assets
self.addEventListener('fetch', (event) => {
  // Skip non-GET and chrome-extension/external cross-origin non-CDN requests
  if (event.request.method !== 'GET') return

  // Navigation requests (HTML)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          if (response.status === 200) {
            const copy = response.clone()
            caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy))
          }
          return response
        })
        .catch(() => caches.match('/Deuditas/index.html') || caches.match('/Deuditas/'))
    )
    return
  }

  // Static assets (CSS, JS, Fonts, Images)
  event.respondWith(
    caches.match(event.request).then((cached) => {
      if (cached) return cached

      return fetch(event.request).then((response) => {
        if (response && response.status === 200 && response.type === 'basic') {
          const responseToCache = response.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache)
          })
        }
        return response
      }).catch(() => {
        // Fallback or empty if offline
        return cached || new Response('', { status: 408, statusText: 'Offline' })
      })
    })
  )
})
