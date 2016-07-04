var map, panorama, g_pos;

function gmapLoadScript() {
	var script = document.createElement("script");
	script.type = "text/javascript";
	script.src = "http://maps.googleapis.com/maps/api/js?key=AIzaSyCBYP8UQzxdpP2AGuPS7UW7zl0wRuVQdeQ&sensor=TRUE&callback=gmapInitialize";
	document.body.appendChild(script);
}

function gmapInitialize() {
	/*var sv = new plugin.google.maps.StreetViewService();
	panorama = new plugin.google.maps.StreetViewPanorama(document.getElementById('pano'));*/
	
/*	var mapOptions = {
		zoom: 17,
		mapTypeId: plugin.google.maps.MapTypeId.ROADMAP
	}*/


/*	var map = new plugin.google.maps.Map(document.getElementById("map_canvas"), mapOptions);
	alert('4');*/

  // You have to wait the MAP_READY event.
 // map.on(plugin.google.maps.event.MAP_READY, onMapInit);
	// Try HTML5 geolocation
	/*if(navigator.geolocation) {
	navigator.geolocation.getCurrentPosition(function(position) {
		var pos = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);*/

		var Id = "";
		var u = $.mobile.path.parseUrl( document.URL );
		if(u.href.search("id=") !== -1){			
			if(u.hash != undefined){										 
				 var Id = u.hash.replace( /.*id=/, "" );	
			}else{
				alert("404");
			}
		}else{
			alert("404");
		}

		var mapDiv = document.getElementById("map_canvas");

		$.ajax({ 
			url: "http://m.citrus.ua/ajax/on/gmap.php",
			dataType: 'json',
			data:'method=getShop&id='+Id,
				success: function( json ){
				/*var pos = new plugin.google.maps.LatLng(json.items[0]['lat'], json.items[0]['lng']);
				map.setCenter(pos);*/

			  
				var latLngs = new plugin.google.maps.LatLng(json.items[0]['lat'], json.items[0]['lng']);
				var map = plugin.google.maps.Map.getMap(mapDiv, {
			    'camera': {
			      'latLng': latLngs,
			      'zoom': 17
			    }
			  });
				map.addEventListener(plugin.google.maps.event.MAP_READY, function() {
					map.setCenter(latLngs);
				});
				
				initAllShops(map);
				
				/*map.addMarker({
				  position: new plugin.google.maps.LatLng(json.items[0]['lat'], json.items[0]['lng']),
				  icon: 'blue',
				  'title': "Hello World!\nThis plugin is very awesome!",
				  'snippet': "Tap here!"
				}, function( marker ) {
				  marker.showInfoWindow();
				});*/

			  /*const latLngs = new plugin.google.maps.LatLng(json.items[0]['lat'], json.items[0]['lng']);
			  var map = plugin.google.maps.Map.getMap(mapDiv, {
			    'camera': {
			      'latLng': latLngs,
			      'zoom': 17
			    }
			  });

			map.on(plugin.google.maps.event.MAP_READY, onMapInit);*/

		}
		});	  

		/*}, function() {
	  	//handleNoGeolocation(true);
	  	var pos = new google.maps.LatLng(50.432655,30.515996);
		map.setCenter(pos);
		});
	}else{
		// Browser doesn't support Geolocation
		//handleNoGeolocation(false);
		var pos = new google.maps.LatLng(50.432655,30.515996);
		map.setCenter(pos);
	}*/

  
}

function initAllShops(map) {
 	$.ajax({ 
	  url: "http://m.citrus.ua/ajax/on/gmap.php", 
	  dataType: 'json',
	  data:'method=getShop',
	  success: function( json ) {
	  
	 /* var iconimage = {
			url: 'http://www.citrus.ua/img/citrus-mappin-v2.png',
			size: new plugin.google.maps.Size(48, 48),
			origin: new plugin.google.maps.Point(0,0),
			anchor: new plugin.google.maps.Point(24,48)
		};*/
	  
		 if(json.items != undefined && json.items.length > 0){
			$.each(json.items, function(key, val){
				if(val.latlng){


					map.addMarker({
					  'position': new plugin.google.maps.LatLng(val.lat,val.lng),
					  'icon': 'http://www.citrus.ua/img/citrus-mappin-v2.png',
					  'title': 'Citrus shop'
					}, function( marker ) {
					  marker.showInfoWindow();
					});
				
					/*var myLatlng = new plugin.google.maps.LatLng(val.lat,val.lng);
						var marker = new plugin.google.maps.Marker({
							position: myLatlng,
							map: map,
							title: val.adress,
							icon: iconimage,
						});
						
						var contentString = '<div style="overflow:hidden">Адрес:'+val.adress+'<br>Телефон:'+val.phone+'</div>';
						var infowindow = new plugin.google.maps.InfoWindow({
							content: contentString
						});
			
						plugin.google.maps.event.addListener(marker, 'click', function(event) {
						map.setZoom(18);
						map.setCenter(marker.getPosition());
						infowindow.open(map,marker);
						//sv.getPanoramaByLocation(event.latLng, 50, processSVData);
					});*/
				}
			});
			$.mobile.loading("hide");
		}
	  }
	 });
}

function onMapInit(map) {
}

function processSVData(data, status) {
  if (status == plugin.google.maps.StreetViewStatus.OK) {
    var marker = new plugin.google.maps.Marker({
      position: data.location.latLng,
      map: map,
      title: data.location.description
    });	
  }
}

function handleNoGeolocation(errorFlag) {
	if (errorFlag) {
		var content = 'Error: The Geolocation service failed.';
	} else {
		var content = 'Error: Your browser doesn\'t support geolocation.';
	}

	var options = {
		map: map,
		position: new plugin.google.maps.LatLng(60, 105),
		content: content
	};

	var infowindow = new plugin.google.maps.InfoWindow(options);
	map.setCenter(options.position);
}

