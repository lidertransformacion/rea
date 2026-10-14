const CACHE = "libertario-casa-v1";

self.addEventListener("install", (evento) => {
  evento.waitUntil(caches.open(CACHE));
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches
      .keys()
      .then((claves) =>
        Promise.all(
          claves
            .filter((clave) => clave !== CACHE)
            .map((clave) => caches.delete(clave)),
        ),
      ),
  );
  self.clients.claim();
});

self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;
  const url = new URL(pedido.url);
  if (url.origin !== self.location.origin) return;
  evento.respondWith(
    fetch(pedido)
      .then((respuesta) => {
        const copia = respuesta.clone();
        void caches.open(CACHE).then((cache) => cache.put(pedido, copia));
        return respuesta;
      })
      .catch(() => caches.match(pedido)),
  );
});
