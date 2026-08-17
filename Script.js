
// ===========================
// Initialize Map
// ===========================

const map = L.map("map").setView([37.2,-0.67],4);

L.tileLayer(
"https://tile.openstreetmap.org/{z}/{x}/{y}.png",
{
maxZoom:20,
attribution:"© OpenStreetMap"
}).addTo(map);


// ===========================
// GeoServer WMS Layer
// ===========================

const geoserverURL="http://localhost:8080/geoserver/wms";

const wmsLayer=L.tileLayer.wms("http://localhost:8080/geoserver/LIS101/wms",{
layers:"LIS101:plots",
format:"image/png",
transparent:true,
version:"1.1.0"
}).addTo(map);

// ===========================
// Legend
// ===========================

document.getElementById("legend-img").src=
geoserverURL+
"?REQUEST=GetLegendGraphic"+
"&VERSION=1.0.0"+
"&FORMAT=image/png"+
"&LAYER=topp:states";

// ===========================
// Mouse Coordinates
// ===========================

map.on("mousemove",function(e){

document.getElementById("coordinates").innerHTML=
"Lat : "+
e.latlng.lat.toFixed(5)+
" Lon : "+
e.latlng.lng.toFixed(5);

});

// ===========================
// Feature Click
// ===========================

map.on("click",function(e){

const url=getFeatureInfoUrl(map,wmsLayer,e.latlng);

fetch(url)
.then(res=>res.json())
.then(data=>{

if(data.features.length>0){

const p=data.features[0].properties;

document.getElementById("parcelNo").innerHTML=p.STATE_NAME;
document.getElementById("owner").innerHTML=p.PERSONS;
document.getElementById("area").innerHTML=p.LAND_KM+" km²";
document.getElementById("landuse").innerHTML="State Land";
document.getElementById("status").innerHTML="Available";
document.getElementById("title").innerHTML="Yes";

L.popup()
.setLatLng(e.latlng)
.setContent(
"<b>"+p.STATE_NAME+"</b><br>"+
"Population : "+p.PERSONS+"<br>"+
"Area : "+p.LAND_KM+" km²"
)
.openOn(map);

}

});

});

// ===========================
// GetFeatureInfo URL
// ===========================

function getFeatureInfoUrl(map,layer,latlng){

const point=map.latLngToContainerPoint(latlng,map.getZoom());

const size=map.getSize();

const params={

service:"WMS",
request:"GetFeatureInfo",
version:"1.1.1",
layers:layer.wmsParams.layers,
query_layers:layer.wmsParams.layers,
styles:"",
bbox:map.getBounds().toBBoxString(),
width:size.x,
height:size.y,
format:"image/png",
info_format:"application/json",
srs:"EPSG:21037",
x:Math.floor(point.x),
y:Math.floor(point.y)

};

return layer._url+
L.Util.getParamString(params,layer._url,true);

}