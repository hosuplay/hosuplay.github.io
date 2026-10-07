// Only public application assets are cached. Never cache API responses or family data.
const CACHE='our-home-public-v4';
const base=new URL(self.registration.scope).pathname;
const staticAsset=url=>{const relative=url.pathname.slice(base.length);return url.origin===self.location.origin && url.pathname.startsWith(base) && (url.pathname===base||/^assets\/[^/]+\.(js|css)$/.test(relative)||/^(icon-(192|512)\.png|apple-touch-icon\.png|manifest\.webmanifest)$/.test(relative))};
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(c=>c.addAll([base,`${base}icon-192.png`,`${base}icon-512.png`,`${base}apple-touch-icon.png`,`${base}manifest.webmanifest`])));self.skipWaiting()});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('our-home-')&&k!==CACHE).map(k=>caches.delete(k)))));self.clients.claim()});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET'||!staticAsset(new URL(event.request.url)))return;event.respondWith(fetch(event.request).then(r=>{if(r.ok){const copy=r.clone();caches.open(CACHE).then(c=>c.put(event.request,copy))}return r}).catch(()=>caches.match(event.request).then(r=>r||Response.error())))});
