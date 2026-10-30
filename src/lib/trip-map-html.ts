import { escapeMapHtml } from './offline-map';

export type RouteMarker = { lat: number; lng: number; name: string; order: number };

/** Capture the visible OpenFreeMap road map; no regions or zoom stacks are downloaded. */
export function buildRouteMapHtml(markers: RouteMarker[], labels: { loadingRoute: string; minUnit: string }): string {
  const data = JSON.stringify(markers).replace(/</g, '\\u003c');
  const minuteLabel = JSON.stringify(labels.minUnit).replace(/</g, '\\u003c');
  return `<!doctype html><html><head>
<meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.css"/>
<script src="https://unpkg.com/maplibre-gl@5.9.0/dist/maplibre-gl.js"><\/script>
<style>*{box-sizing:border-box}html,body,#map{width:100%;height:100%;margin:0}body{font:12px sans-serif}
#status{position:absolute;top:10px;left:10px;background:white;padding:6px 10px;border-radius:8px;max-width:75%}
.stop{width:32px;height:32px;border-radius:50%;border:3px solid white;color:white;font-weight:700;display:flex;align-items:center;justify-content:center;box-shadow:0 1px 6px #555}</style>
</head><body><div id="map"></div><div id="status">${escapeMapHtml(labels.loadingRoute)}</div>
<script>
var pts=${data}, route=[], mapFailed=false, capturing=false;
window._offlineRouteReady=false;
function send(data){if(window.ReactNativeWebView)window.ReactNativeWebView.postMessage(JSON.stringify(data));}
function failure(){mapFailed=true;window._offlineRouteReady=false;document.getElementById('status').style.display='none';send({type:'route-error'});}
var map;
try {
  map=new maplibregl.Map({container:'map',style:'https://tiles.openfreemap.org/styles/liberty',
    center:pts.length?[pts[0].lng,pts[0].lat]:[108.206,16.047],zoom:12,
    canvasContextAttributes:{preserveDrawingBuffer:true},pixelRatio:2,
    attributionControl:{compact:false},dragRotate:false,pitchWithRotate:false,fadeDuration:0});
  map.addControl(new maplibregl.NavigationControl({showCompass:false}), 'top-right');
  map.touchZoomRotate.disableRotation();
  map.on('error',failure);
} catch(e) { failure(); }
function fitRoute(){
  var points=route.concat(pts.map(function(p){return[p.lng,p.lat];}));
  if(!points.length)return;
  var bounds=new maplibregl.LngLatBounds(points[0],points[0]);
  points.forEach(function(p){bounds.extend(p);});
  map.fitBounds(bounds,{padding:55,maxZoom:16,duration:0});
}
async function waitForMap(){
  var deadline=Date.now()+20000;
  while(!map.loaded()||!map.areTilesLoaded()){
    if(mapFailed||Date.now()>deadline)throw new Error('Map incomplete');
    await new Promise(function(resolve){setTimeout(resolve,100);});
  }
  if(mapFailed)throw new Error('Map failed');
  await new Promise(function(resolve){requestAnimationFrame(function(){requestAnimationFrame(resolve);});});
}
if(map)map.on('load',async function(){
  try{
    if(!pts.length)throw new Error('No stops');
    pts.forEach(function(p,i){
      var el=document.createElement('div');el.className='stop';el.textContent=String(p.order);
      el.style.background=i===0?'#188038':i===pts.length-1?'#d93025':'#1a73e8';
      new maplibregl.Marker({element:el}).setLngLat([p.lng,p.lat])
        .setPopup(new maplibregl.Popup().setText(p.name)).addTo(map);
    });
    if(pts.length>1){
      var controller=new AbortController(),timer=setTimeout(function(){controller.abort();},20000);
      try{
        var waypoints=pts.map(function(p){return p.lng+','+p.lat;}).join(';');
        var response=await fetch('https://router.project-osrm.org/route/v1/driving/'+waypoints+'?overview=full&geometries=geojson',{signal:controller.signal});
        if(!response.ok)throw new Error('Route unavailable');
        var result=await response.json();
        if(result.code!=='Ok'||!result.routes||!result.routes[0]||!result.routes[0].geometry||!result.routes[0].geometry.coordinates.length)throw new Error('No road route');
        route=result.routes[0].geometry.coordinates;
        if(route.some(function(p){return !Number.isFinite(p[0])||!Number.isFinite(p[1]);}))throw new Error('Invalid road route');
        map.addSource('trip-route',{type:'geojson',data:{type:'Feature',properties:{},geometry:{type:'LineString',coordinates:route}}});
        map.addLayer({id:'trip-route-outline',type:'line',source:'trip-route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#fff','line-width':9}});
        map.addLayer({id:'trip-route-line',type:'line',source:'trip-route',layout:{'line-join':'round','line-cap':'round'},paint:{'line-color':'#1a73e8','line-width':5}});
        document.getElementById('status').textContent=(result.routes[0].distance/1000).toFixed(1)+' km · ~'+Math.round(result.routes[0].duration/60)+' '+${minuteLabel};
      }finally{clearTimeout(timer);}
    }else{
      route=[[pts[0].lng,pts[0].lat]];document.getElementById('status').style.display='none';
    }
    fitRoute();await waitForMap();window._offlineRouteReady=true;send({type:'route-ready'});
  }catch(e){failure();}
});
window.captureOfflineMap=async function(requestId){
  if(capturing||!window._offlineRouteReady||mapFailed){send({type:'snapshot-error',requestId:requestId});return;}
  capturing=true;
  try{
    map.stop();map.setBearing(0);map.setPitch(0);fitRoute();await waitForMap();
    var source=map.getCanvas(),width=source.clientWidth,height=source.clientHeight;
    var canvas=document.createElement('canvas');canvas.width=source.width;canvas.height=source.height;
    var ctx=canvas.getContext('2d');ctx.drawImage(source,0,0);
    ctx.scale(source.width/width,source.height/height);
    pts.forEach(function(p,i){
      var xy=map.project([p.lng,p.lat]);ctx.beginPath();ctx.arc(xy.x,xy.y,16,0,Math.PI*2);
      ctx.fillStyle=i===0?'#188038':i===pts.length-1?'#d93025':'#1a73e8';ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=3;ctx.stroke();
      ctx.fillStyle='#fff';ctx.font='bold 14px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(String(p.order),xy.x,xy.y);
    });
    ctx.fillStyle='rgba(255,255,255,.96)';ctx.fillRect(0,height-36,width,36);
    ctx.fillStyle='#333';ctx.font='10px sans-serif';ctx.textAlign='left';ctx.textBaseline='middle';
    ctx.fillText('© OpenMapTiles · Data © OpenStreetMap contributors',6,height-24);
    ctx.fillText('OpenFreeMap · Route: OSRM',6,height-10);
    send({type:'snapshot',requestId:requestId,image:canvas.toDataURL('image/png')});
  }catch(e){send({type:'snapshot-error',requestId:requestId});}
  finally{capturing=false;}
};
<\/script></body></html>`;
}
