// public/service-worker.js
const CACHE_NAME = 'video-generator-v1';
const OFFLINE_URL = '/offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll([
        '/',
        '/index.html',
        '/manifest.json',
        OFFLINE_URL,
        // Add other essential assets
      ]);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match(OFFLINE_URL);
      })
    );
  } else {
    event.respondWith(
      caches.match(event.request).then((response) => {
        return response || fetch(event.request);
      })
    );
  }
});

// Background sync for video generation
self.addEventListener('sync', (event) => {
  if (event.tag === 'video-generation-sync') {
    event.waitUntil(syncVideoGeneration());
  }
});

async function syncVideoGeneration() {
  // Get all incomplete jobs from IndexedDB
  const incompleteJobs = await getIncompleteJobsFromDB();
  
  if (incompleteJobs.length > 0) {
    await showNotification({
      title: 'Video Generation',
      body: `You have ${incompleteJobs.length} incomplete video generation(s)`,
      tag: 'video-progress'
    });
  }
}

async function getIncompleteJobsFromDB() {
  // This would need to communicate with the page
  // For now, return empty array
  return [];
}

async function showNotification(options) {
  await self.registration.showNotification(options.title, {
    body: options.body,
    icon: '/icon-192.png',
    badge: '/badge.png',
    tag: options.tag,
    actions: [
      { action: 'resume', title: 'Resume' },
      { action: 'dismiss', title: 'Dismiss' }
    ]
  });
}

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'resume') {
    event.waitUntil(
      self.clients.matchAll().then((clients) => {
        if (clients.length > 0) {
          clients[0].focus();
          clients[0].postMessage({
            type: 'RESUME_VIDEO_GENERATION'
          });
        } else {
          self.clients.openWindow('/');
        }
      })
    );
  }
});

// Periodic sync for checking incomplete jobs
self.addEventListener('periodicsync', (event) => {
  if (event.tag === 'check-video-jobs') {
    event.waitUntil(checkVideoJobs());
  }
});

async function checkVideoJobs() {
  // Check for incomplete jobs every hour
  const incompleteJobs = await getIncompleteJobsFromDB();
  
  if (incompleteJobs.length > 0) {
    await showNotification({
      title: 'Incomplete Videos',
      body: `You have ${incompleteJobs.length} video(s) waiting to be completed`,
      tag: 'periodic-check'
    });
  }
}