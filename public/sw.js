const CACHE_NAME = 'teamdock-v1';
const CORE_ASSETS = [
  '/',
  '/login',
  '/manifest.json',
  '/icon.svg',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(CORE_ASSETS);
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((name) => {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Supabase API requests and other APIs (NETWORK FIRST)
  if (url.origin.includes('supabase.co') || request.url.includes('/api/')) {
    event.respondWith(
      fetch(request).catch(() => {
        return new Response(
          JSON.stringify({ error: 'Network error. You are offline.' }),
          { headers: { 'Content-Type': 'application/json' } }
        );
      })
    );
    return;
  }

  // Next.js dynamic chunks and API routes (NETWORK FIRST)
  if (url.pathname.startsWith('/_next/data') || request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        if (cachedResponse) return cachedResponse;
        
        // Fallback to offline.html for navigation requests
        if (request.mode === 'navigate') {
          return cache.match('/offline.html');
        }
      })
    );
    return;
  }

  // Static Assets (CACHE FIRST)
  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;
      
      return fetch(request).then((networkResponse) => {
        // Don't cache non-successful responses or dynamic routes
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          return networkResponse;
        }

        // Cache static Next.js assets
        if (url.pathname.startsWith('/_next/static/') || CORE_ASSETS.includes(url.pathname)) {
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, responseToCache);
          });
        }
        return networkResponse;
      }).catch(() => {
        // Fail silently for other assets
      });
    })
  );
});
