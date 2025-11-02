// Service Worker désactivé - version minimaliste
const CACHE_NAME = 'secretstory-offline';

self.addEventListener('install', (event) => {
  console.log('🔴 Service Worker désactivé - mode bypass');
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('🔴 Service Worker activé mais désactivé');
  event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
  // Laisser passer TOUTES les requêtes sans interception
  return;
});