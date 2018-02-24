"use strict";
'use strict';

(function () {
  var map;
  var infoWindow;

  //initializes the map view
  //sets up where the center of the map is, zoom level, type, and markers
  var initMap = function initMap(lat, lng) {
    var mapOptions = {
      center: { lat: lat, lng: lng }, //get the long, lat from the Geolocation API
      zoom: 7
    };

    var mapDiv = document.querySelector('#map');
    mapDiv.style.height = window.innerHeight + 'px';

    //grab the map from the html page
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);
    map.MapTypeId = "roadmap";

    addMarker(lat, lng, 'Me');
  };

  //adds markers to the map view
  var addMarker = function addMarker(latitude, longitude, title) {
    var pos = { lat: latitude, lng: longitude };
    var marker = new google.maps.Marker({ position: pos, map: map });
    marker.setTitle(title);

    //add event listener for the click event
    google.maps.event.addListener(marker, 'click', function (e) {
      makeInfoWindow(pos, title);
    });
  };

  //creates the overlay that describes what a marker represents
  var makeInfoWindow = function makeInfoWindow(pos, msg) {
    //close old infowindow if it exists
    if (infoWindow) {
      infoWindow.close();
    }

    //make new InfoWindow
    infoWindow = new google.maps.InfoWindow({
      map: map,
      position: pos,
      content: "<b>" + msg + "</b>"
    });
  };

  var getLatLang = function getLatLang() {
    var pos = void 0;
    navigator.geolocation.getCurrentPosition(function (position) {
      console.dir(position);
      pos = position.coords;
    });
    console.dir(pos);
    return pos;
  };

  //initialize connection to the server
  var init = function init() {
    var user = 'User' + Math.floor(Math.random() * 1000);

    navigator.geolocation.getCurrentPosition(function (position) {
      var socket = io.connect();

      initMap(position.coords.latitude, position.coords.longitude);

      socket.on('connect', function () {
        socket.emit('join', { user: user, lat: position.coords.latitude, lng: position.coords.longitude });
      });

      socket.on('updateMap', function (data) {
        var users = data;

        Object.keys(users).forEach(function (currUser) {
          if (currUser === user) {
            addMarker(users[currUser].lat, users[currUser].lng, 'Me');
          } else {
            addMarker(users[currUser].lat, users[currUser].lng, currUser);
          }
        });
      });
    });
  };

  window.onload = init;
})();
