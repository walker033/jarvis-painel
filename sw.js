/* Service worker do painel: permite instalar como app, abre sem internet com a última versão vista e mostra os avisos das rotinas. */
var CACHE="jarvis-v1";
var BASE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",function(e){self.skipWaiting();e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(BASE)}).catch(function(){}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
/* rede primeiro: a versão nova sempre vence; o cache só entra quando a internet falha */
self.addEventListener("fetch",function(e){var r=e.request;
  if(r.method!=="GET"||new URL(r.url).origin!==location.origin)return;
  e.respondWith(fetch(r).then(function(res){if(res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res},
    function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match("./index.html")})}))});
/* toque na notificação: volta para o painel aberto ou abre um novo */
self.addEventListener("notificationclick",function(e){e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(cs){for(var i=0;i<cs.length;i++){if("focus" in cs[i])return cs[i].focus()}return self.clients.openWindow("./")}))});
