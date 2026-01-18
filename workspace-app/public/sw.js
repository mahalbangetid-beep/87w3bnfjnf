/**
 * Service Worker for Push Notifications
 * This file should be placed in the public folder
 */

// Cache name for offline support
const CACHE_NAME = 'workspace-v1';

// Assets to cache for offline use
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
    console.log('[SW] Installing service worker...');
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            console.log('[SW] Caching static assets');
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
    console.log('[SW] Activating service worker...');
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames
                    .filter((name) => name !== CACHE_NAME)
                    .map((name) => caches.delete(name))
            );
        })
    );
    self.clients.claim();
});

// Push event - handle incoming push notifications
self.addEventListener('push', (event) => {
    console.log('[SW] Push notification received');

    let data = {
        title: 'Workspace Notification',
        body: 'You have a new notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/badge-72x72.png',
        data: {}
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
        icon: data.icon || '/icons/icon-192x192.png',
        badge: data.badge || '/icons/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
            { action: 'open', title: 'Buka' },
            { action: 'dismiss', title: 'Tutup' }
        ],
        requireInteraction: data.data?.priority === 'urgent',
        tag: data.data?.notificationId || 'workspace-notification',
        renotify: true
    };

    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

// Notification click event - handle user interaction
self.addEventListener('notificationclick', (event) => {
    console.log('[SW] Notification clicked:', event.action);

    event.notification.close();

    if (event.action === 'dismiss') {
        return;
    }

    // Get action URL from notification data
    const actionUrl = event.notification.data?.actionUrl || '/';

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
            // Check if a window is already open
            for (const client of clientList) {
                if (client.url.includes(self.location.origin) && 'focus' in client) {
                    client.focus();
                    if (actionUrl !== '/') {
                        client.navigate(actionUrl);
                    }
                    return;
                }
            }
            // Open new window if none open
            if (clients.openWindow) {
                return clients.openWindow(actionUrl);
            }
        })
    );
});

// Notification close event
self.addEventListener('notificationclose', (event) => {
    console.log('[SW] Notification closed');
});

// Fetch event - network first for API, cache first for assets
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Skip non-GET requests
    if (event.request.method !== 'GET') {
        return;
    }

    // API requests - network only
    if (url.pathname.startsWith('/api/')) {
        return;
    }

    // For other requests, try network first, then cache
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                // Clone the response before caching
                const responseClone = response.clone();
                caches.open(CACHE_NAME).then((cache) => {
                    cache.put(event.request, responseClone);
                });
                return response;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});

// Message event - handle messages from main thread
self.addEventListener('message', (event) => {
    console.log('[SW] Message received:', event.data);

    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
});

console.log('[SW] Service worker loaded');
