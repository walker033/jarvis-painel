/* Service worker do painel: permite instalar como app, abre sem internet com a última versão vista, recebe o que for compartilhado de outros apps e mostra os avisos das rotinas. */
var CACHE="jarvis-v2";
var BASE=["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png"];
self.addEventListener("install",function(e){self.skipWaiting();e.waitUntil(caches.open(CACHE).then(function(c){return c.addAll(BASE)}).catch(function(){}))});
self.addEventListener("activate",function(e){e.waitUntil(caches.keys().then(function(ks){return Promise.all(ks.filter(function(k){return k!==CACHE&&k!=="jarvis-compartilhado"}).map(function(k){return caches.delete(k)}))}).then(function(){return self.clients.claim()}))});
/* "Compartilhar com o Jarvis": o Android envia um POST que o GitHub Pages não aceita; o service worker guarda o conteúdo e abre o painel */
function receberCompartilhado(r){return r.formData().then(function(fd){var f=fd.get("arquivo"),temArq=f&&typeof f!=="string"&&f.size>0,
    meta={titulo:fd.get("titulo")||"",texto:fd.get("texto")||"",url:fd.get("url")||"",nome:temArq?f.name:"",tipo:temArq?f.type:"",em:Date.now()};
    return caches.delete("jarvis-compartilhado").then(function(){return caches.open("jarvis-compartilhado")}).then(function(c){var ps=[c.put("./compartilhado-meta",new Response(JSON.stringify(meta),{headers:{"content-type":"application/json"}}))];
      if(temArq)ps.push(c.put("./compartilhado-arquivo",new Response(f,{headers:{"content-type":f.type||"application/octet-stream"}})));return Promise.all(ps)})})
  .then(function(){return Response.redirect("./?compartilhado=1",303)},function(){return Response.redirect("./?compartilhado=erro",303)})}
/* rede primeiro: a versão nova sempre vence; o cache só entra quando a internet falha */
self.addEventListener("fetch",function(e){var r=e.request,u=new URL(r.url);
  if(r.method==="POST"&&u.origin===location.origin&&/\/compartilhar$/.test(u.pathname)){e.respondWith(receberCompartilhado(r));return}
  if(r.method!=="GET"||u.origin!==location.origin)return;
  e.respondWith(fetch(r).then(function(res){if(res.ok){var cp=res.clone();caches.open(CACHE).then(function(c){c.put(r,cp)})}return res},
    function(){return caches.match(r,{ignoreSearch:true}).then(function(m){return m||caches.match("./index.html")})}))});
/* toque na notificação: volta para o painel aberto ou abre um novo */
self.addEventListener("notificationclick",function(e){e.notification.close();
  e.waitUntil(self.clients.matchAll({type:"window",includeUncontrolled:true}).then(function(cs){for(var i=0;i<cs.length;i++){if("focus" in cs[i])return cs[i].focus()}return self.clients.openWindow("./")}))});
