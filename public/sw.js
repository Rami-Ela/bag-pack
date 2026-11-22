// Minimal service worker: no data caching, only a static fallback page
// when a navigation fails because the device is offline, plus Web Push display.
const CACHE_NAME = "bag-pack-v1";
const OFFLINE_URL = "/offline.html";

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL)),
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.mode !== "navigate") return;

  event.respondWith(
    fetch(event.request).catch(() => caches.match(OFFLINE_URL)),
  );
});

// Payload shape: PushMessage in lib/notifications/web-push.ts.
self.addEventListener("push", (event) => {
  const message = event.data ? event.data.json() : {};
  event.waitUntil(
    self.registration.showNotification(message.title ?? "Bag Pack", {
      body: message.body,
      tag: message.tag,
      icon: "/icons/icon-192.png",
      data: { url: message.url ?? "/" },
    }),
  );
});

// Reuse an open app window when there is one, otherwise open a new one.
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = new URL(
    event.notification.data?.url ?? "/",
    self.location.origin,
  ).href;

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((windows) => {
      const client = windows.find(
        (w) => new URL(w.url).origin === self.location.origin,
      );
      if (!client) return self.clients.openWindow(url);
      return client.focus().then((focused) => focused.navigate(url));
    }),
  );
});
