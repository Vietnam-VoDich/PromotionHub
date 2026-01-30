// PromotionHub Service Worker

const CACHE_NAME = 'promotionhub-v1';
const STATIC_CACHE = 'promotionhub-static-v1';
const DYNAMIC_CACHE = 'promotionhub-dynamic-v1';

// assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log('Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// activate event - clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

// fetch event - network first, fallback to cache for pages
self.addEventListener('fetch', (event) => {
  const { request } = event;

  // skip non-GET requests
  if (request.method !== 'GET') return;

  // skip API requests (don't cache)
  if (request.url.includes('/api/')) return;

  // skip external requests
  if (!request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        // cache successful responses
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(DYNAMIC_CACHE).then((cache) => {
            cache.put(request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // fallback to cache
        return caches.match(request);
      })
  );
});

// push notification event
self.addEventListener('push', (event) => {
  console.log('Push notification received');

  let data = {
    title: 'PromotionHub',
    body: 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
  };

  if (event.data) {
    try {
      data = { ...data, ...event.data.json() };
    } catch (e) {
      data.body = event.data.text();
    }
  }

  const options = {
    body: data.body,
    icon: data.icon,
    badge: data.badge,
    tag: data.tag || 'default',
    data: {
      url: data.url || '/',
      ...data.data,
    },
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'Voir',
      },
      {
        action: 'close',
        title: 'Fermer',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title, options)
  );
});

// notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // check if there's already a window open
      for (const client of windowClients) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(url);
          return client.focus();
        }
      }
      // open new window
      return clients.openWindow(url);
    })
  );
});

// notification close event (for analytics)
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification.tag);
});
