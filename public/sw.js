const CACHE_NAME = 'secretstory-v1.5';
const STATIC_CACHE = 'secretstory-static-v1.1';

// Événement d'installation
self.addEventListener('install', (event) => {
  console.log('🟢 Service Worker installing... Version:', CACHE_NAME);
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        return cache.addAll([
          '/',
          '/index.html',
          '/static/js/bundle.js',
          '/static/css/main.css',
          '/manifest.json',
          '/icon-192.png',
          '/icon-512.png',
          '/favicon.ico'
        ])
        .then(() => {
          console.log('✅ Ressources critiques en cache');
        })
        .catch((error) => {
          console.error('❌ Erreur cache ressources critiques:', error);
        });
      })
  );
  
  self.skipWaiting();
});

// Événement d'activation
self.addEventListener('activate', (event) => {
  console.log('🟢 Service Worker activated:', CACHE_NAME);
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
            console.log('🗑️ Suppression ancien cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  
  self.clients.claim();
});

// Événement de fetch (interception des requêtes)
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // EXCLURE les requêtes API Supabase et autres APIs externes
  if (request.url.includes('supabase.co') || 
      request.url.includes('/api/') ||
      request.method !== 'GET' ||
      request.url.includes('chrome-extension')) {
    return; // Laisser passer sans interception
  }

  // Pour la navigation SPA
  if (request.mode === 'navigate' && !url.pathname.includes('.')) {
    event.respondWith(
      caches.match('/index.html')
        .then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request)
            .then((response) => {
              const responseClone = response.clone();
              caches.open(STATIC_CACHE)
                .then((cache) => cache.put('/index.html', responseClone));
              return response;
            })
            .catch(() => {
              return new Response(`
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>SecretStory</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <style>
                      body {
                        margin: 0;
                        padding: 0;
                        background: linear-gradient(135deg, #8B5CF6, #EC4899);
                        font-family: Arial, sans-serif;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        height: 100vh;
                        color: white;
                      }
                      .container {
                        text-align: center;
                        padding: 2rem;
                      }
                    </style>
                  </head>
                  <body>
                    <div class="container">
                      <h1>SecretStory</h1>
                      <p>Application hors ligne</p>
                      <p>Revenez quand vous aurez une connexion internet</p>
                    </div>
                  </body>
                </html>
              `, {
                headers: { 'Content-Type': 'text/html' }
              });
            });
        })
    );
    return;
  }

  // Pour les ressources statiques
  event.respondWith(
    caches.match(request)
      .then((response) => {
        if (response) {
          return response;
        }

        return fetch(request)
          .then((response) => {
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  cache.put(request, responseToCache);
                });
            }
            return response;
          })
          .catch((error) => {
            console.error('❌ Erreur fetch:', error);
            if (request.destination === 'image') {
              return caches.match('/icon-192.png');
            }
            return new Response('Ressource non disponible hors ligne', {
              status: 408,
              headers: { 'Content-Type': 'text/plain' }
            });
          });
      })
  );
});

// Événement pour les messages
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

// Gestion des push notifications
self.addEventListener('push', (event) => {
  if (!event.data) return;

  const data = event.data.json();
  const options = {
    body: data.body || 'Nouveau message SecretStory!',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    }
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SecretStory', options)
  );
});

// Clic sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then((clientList) => {
      for (const client of clientList) {
        if (client.url === event.notification.data.url && 'focus' in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(event.notification.data.url);
      }
    })
  );
});

console.log('🚀 Service Worker chargé avec succès! Version:', CACHE_NAME);