const CACHE = "flashcard-drill-v2";
const PRECACHE = ["./", "./manifest.json", "./icon-192.png", "./icon-512.png"];

self.addEventListener("install", (event) => {
    event.waitUntil(
          caches.open(CACHE)
            .then((cache) => cache.addAll(PRECACHE))
            .then(() => self.skipWaiting())
        );
});

self.addEventListener("activate", (event) => {
    event.waitUntil(
          caches.keys()
            .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
            .then(() => self.clients.claim())
        );
});

// The app page itself (index.html) goes network-first: whenever you're
// online, relaunching the app always grabs the latest version instead of
// showing a stale cached copy. If you're offline, it falls back to
// whatever was last cached. Static assets (icons, manifest) still use
// stale-while-revalidate since those rarely change.
self.addEventListener("fetch", (event) => {
    if (event.request.method !== "GET") return;

                        const isDocument = event.request.mode === "navigate" || event.request.destination === "document";

                        if (isDocument) {
                              event.respondWith(
                                      fetch(event.request)
                                        .then((response) => {
                                                    if (response && response.status === 200) {
                                                                  const copy = response.clone();
                                                                  caches.open(CACHE).then((cache) => cache.put(event.request, copy));
                                                    }
                                                    return response;
                                        })
                                        .catch(() => caches.match(event.request))
                                    );
                              return;
                        }

                        event.respondWith(
                              caches.match(event.request).then((cached) => {
                                      const network = fetch(event.request)
                                        .then((response) => {
                                                    if (response && response.status === 200) {
                                                                  const copy = response.clone();
                                                                  caches.open(CACHE).then((cache) => cache.put(event.request, copy));
                                                    }
                                                    return response;
                                        })
                                        .catch(() => cached);
                                      return cached || network;
                              })
                            );
});
