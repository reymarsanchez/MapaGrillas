/*	PostGIS and Leaflet demo for Cart Lab Education Series, April 17, 2015	**
**	By Carl Sack, CC-BY-3.0													*/

//global variables
var map,
	fields = ["gid", "banco", "ubigeo"], 
	autocomplete = [];

$(document).ready(initialize);

function initialize(){
	$("#map").height($(window).height());

	map = L.map("map", {
		center: L.latLng(-8.1119709 , -79.0289877 ),
		zoom: 7
	});

	/*var tileLayer = L.tileLayer("http://{s}.acetate.geoiq.com/tiles/acetate/{z}/{x}/{y}.png").addTo(map);*/
	
	var tileLayer = L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
    attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://mapbox.com">Mapbox</a>',
    maxZoom: 18,
    id: 'mapbox.streets',
    accessToken: 'pk.eyJ1IjoicmV5bWFycyIsImEiOiJjaXJycm5lc3owaWIzZmxtOHFpMWppaXlzIn0.8Dwcyn7rej0F6VRskMvHOw'
}).addTo(map);
	

	//next: add features to map
	getData();
};

function getData(){
	$.ajax("php/getData.php", {
		data: {
			table: "agencias",
			fields: fields
		},
		success: function(data){
			mapData(data);
		}
	})
};

function mapData(data){
	//remove existing map layers
	map.eachLayer(function(layer){
		//if not the tile layer
		if (typeof layer._url === "undefined"){
			map.removeLayer(layer);
		}
	});

	//create geojson container object
	var geojson = {
		"type": "FeatureCollection",
		"features": []
	};

	//split data into features
	var dataArray = data.split(", ;");
	dataArray.pop();
    
    //console.log(dataArray);
	
	//build geojson features
	dataArray.forEach(function(d){
		d = d.split(", "); //split the data up into individual attribute values and the geometry

		//feature object container
		var feature = {
			"type": "Feature",
			"properties": {}, //properties object container
			"geometry": JSON.parse(d[fields.length]) //parse geometry
		};

		for (var i=0; i<fields.length; i++){
			feature.properties[fields[i]] = d[i];
		};

		//add feature names to autocomplete list
		if ($.inArray(feature.properties.banco, autocomplete) == -1){
			autocomplete.push(feature.properties.banco);
		};

		geojson.features.push(feature);
	});
	
    //console.log(geojson);
    
    //activate autocomplete on banco input
    $("input[name=banco]").autocomplete({
        source: autocomplete
    });

	var mapDataLayer = L.geoJson(geojson, {
		pointToLayer: function (feature, latlng) {
			var markerStyle = { 
				fillColor: "#CC9900",
				color: "#FFF",
				fillOpacity: 0.5,
				opacity: 0.8,
				weight: 1,
				radius: 8
			};

			return L.circleMarker(latlng, markerStyle);
		},
		onEachFeature: function (feature, layer) {
			var html = "";
			for (prop in feature.properties){
				html += prop+": "+feature.properties[prop]+"<br>";
			};
	        layer.bindPopup(html);
	    }
	}).addTo(map);
};

function submitQuery(){
	//get the form data
	var formdata = $("form").serializeArray();

	//add to data request object
	var data = {
		table: "agencias",
		fields: fields
	};
	formdata.forEach(function(dataobj){
		data[dataobj.name] = dataobj.value;
	});

	//call the php script
	$.ajax("php/getData.php", {
		data: data,
		success: function(data){
			mapData(data);
		}
	})
};