// Офлайн-кэш. Никаких фоновых синхронизаций, пушей и геолокации.
const CACHE = 'ilona-v20';
const SHELL = ['./', 'index.html', 'qr.js', 'data.js', 'art.js', 'sections.js', 'photos.js', 'style.js', 'brain.js', 'lang.js', 'lang-units.js', 'lang-grammar.js', 'lang-freq-en.js', 'lang-freq-de.js', 'tutor.js', 'ideas.js', 'work.js', 'notify.js', 'mealdb.js', 'wlessons.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'icon-maskable-512.png', 'apple-touch-icon.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;                       // запросы к ИИ (POST) идут напрямую
  const url = new URL(req.url), same = url.origin === location.origin;
  const api = /(^|\.)wikimedia\.org$/.test(url.hostname) && url.pathname.endsWith('/api.php');
  const asset = /fonts\.(googleapis|gstatic)\.com$/.test(url.hostname) || url.hostname === 'upload.wikimedia.org' || url.hostname === 'www.themealdb.com' && url.pathname.startsWith('/images/') || url.hostname === 'cdnjs.cloudflare.com';
  const put = res => { if (res.ok || res.type === 'opaque') { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); } return res; };
  if (same) // файлы приложения: всегда свежие из сети (все файлы одной версии), без интернета — из кэша
    return e.respondWith(fetch(req, { cache: 'no-cache' }).then(put).catch(() => caches.match(req, { ignoreSearch: true }).then(hit => hit || caches.match('index.html'))));
  if (api) // список картин: сначала сеть, без сети — сохранённый ответ ИМЕННО на этот запрос
    return e.respondWith(fetch(req).then(put).catch(() => caches.match(req).then(h => h || Response.error())));
  if (asset) // картинки и шрифты: кэш по полному адресу
    return e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(put).catch(() => Response.error())));
});

self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.matchAll({ type: 'window' }).then(l => l.length ? l[0].focus() : clients.openWindow('./'))); });
