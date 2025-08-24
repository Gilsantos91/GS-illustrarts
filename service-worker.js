const CACHE = 'design-jobs-v2'; // Incrementar versão para forçar atualização
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './auth-manager.js',
  './sync-manager.js',
  './firebase-config.js',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.1/dist/chart.umd.min.js',
  'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js',
  'https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js'
];

self.addEventListener('install', e => {
  console.log('Service Worker instalando...');
  e.waitUntil(
    caches.open(CACHE).then(cache => {
      console.log('Cache aberto');
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  console.log('Service Worker ativando...');
  e.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.map(key => {
          if (key !== CACHE) {
            console.log('Removendo cache antigo:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', e => {
  // Estratégia: Network First para arquivos críticos, Cache First para assets
  const isCriticalFile = e.request.url.includes('app.js') || 
                        e.request.url.includes('auth-manager.js') || 
                        e.request.url.includes('sync-manager.js') ||
                        e.request.url.includes('firebase-config.js');
  
  if (isCriticalFile) {
    // Network First para arquivos críticos
    e.respondWith(
      fetch(e.request)
        .then(response => {
          // Se a requisição foi bem-sucedida, atualizar o cache
          if (response.status === 200) {
            const responseClone = response.clone();
            caches.open(CACHE).then(cache => {
              cache.put(e.request, responseClone);
            });
          }
          return response;
        })
        .catch(() => {
          // Se falhar, usar cache
          return caches.match(e.request);
        })
    );
  } else {
    // Cache First para outros assets
    e.respondWith(
      caches.match(e.request).then(response => {
        return response || fetch(e.request);
      })
    );
  }
});

// Listener para mensagens do app
self.addEventListener('message', e => {
  if (e.data && e.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
