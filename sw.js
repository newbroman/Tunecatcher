// Tunecatcher service worker: everything cached on install, so the app works offline
const CACHE='tc-9a694e8733',FILES=["./", "index.html", "manifest.webmanifest", "icons/icon-192.png", "icons/icon-512.png", "icons/maskable-512.png"];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(FILES)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE&&k!=='tc-lib'&&!k.startsWith('transformers')).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  // pages: network first (so updates arrive), the cache when offline; everything else: cache first
  if(r.mode==='navigate'){e.respondWith(fetch(r).then(res=>{const c=res.clone();caches.open(CACHE).then(k=>k.put('index.html',c));return res}).catch(()=>caches.match('index.html')));return}
  // the speech model's library (and anything else from the CDN) is kept once fetched, so the words work offline too
  const u=new URL(r.url);if(u.host==='cdn.jsdelivr.net'){e.respondWith(caches.open('tc-lib').then(c=>c.match(r).then(m=>m||fetch(r).then(res=>{if(res.ok||res.type==='opaque')c.put(r,res.clone());return res}))));return}
  e.respondWith(caches.match(r).then(m=>m||fetch(r)))});
