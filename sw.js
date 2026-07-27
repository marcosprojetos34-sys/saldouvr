// Saldou — Service Worker
// Cache básico do "app shell" pra funcionar offline e ser instalável de verdade como PWA.

const CACHE_NAME = 'saldou-v2';
const ARQUIVOS_PARA_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png',
  './favicon-32.png',
  './favicon-16.png'
];

// Instala o service worker e guarda os arquivos essenciais no cache
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ARQUIVOS_PARA_CACHE).catch((err) => {
        console.warn('Saldou SW: alguns arquivos não puderam ser cacheados', err);
      });
    })
  );
  self.skipWaiting();
});

// Remove caches antigos quando uma nova versão do service worker entra
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((nomes) => {
      return Promise.all(
        nomes
          .filter((nome) => nome !== CACHE_NAME)
          .map((nome) => caches.delete(nome))
      );
    })
  );
  self.clients.claim();
});

// Estratégia: tenta rede primeiro (dado sempre atualizado), cai pro cache se estiver offline
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((resposta) => {
        const respostaClone = resposta.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, respostaClone));
        return resposta;
      })
      .catch(() => caches.match(event.request))
  );
});
