'use strict';

(function () {
  var map = void 0;
  var infoWindow = void 0;
  var markers = [];

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

    markers.push(marker);
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

  //Sets the map on all markers in the array.
  var setMapOnAll = function setMapOnAll(map) {
    markers.forEach(function (marker) {
      marker.setMap(map);
    });
  };

  //Removes the markers from the map, but keeps them in the array.
  var clearMarkers = function clearMarkers() {
    setMapOnAll(null);
  };

  //Deletes all markers in the array by removing references to them.
  var deleteMarkers = function deleteMarkers() {
    clearMarkers();
    markers = [];
  };

  //sets up the user room login and user name
  //creates websocket connection
  //inits the google maps view and loads other room users data
  var init = function init() {
    document.querySelector('#submit').onclick = function (e) {
      e.preventDefault();
      //get the data from the form
      var room = document.querySelector('#room').value;
      var user = document.querySelector('#username').value;
      //basic form validation
      if (user.indexOf(' ') > -1 || user === '') {
        alert('Please enter a username without spaces or isn\'t blank');
        return;
      }

      if (room.indexOf(' ') > -1 || room === '') {
        alert('Please enter a room name without spaces or isn\'t blank');
        return;
      }
      //get the html elements we want to hide and show
      var login = document.querySelector('#login');
      var map = document.querySelector('#map');
      login.style.display = 'none';
      map.style.display = 'block';

      //send the initial Websocket connect with GPS coordinates
      navigator.geolocation.getCurrentPosition(function (position) {
        var socket = io.connect();

        //send websocket connection and initialize google map
        socket.on('connect', function () {
          initMap(position.coords.latitude, position.coords.longitude);
          socket.emit('join', { user: user, lat: position.coords.latitude, lng: position.coords.longitude, room: room });
        });

        //set up update map event
        socket.on('updateMap', function (data) {
          var users = data;
          deleteMarkers();

          Object.keys(users).forEach(function (currUser) {
            if (currUser === user) {
              addMarker(users[currUser].lat, users[currUser].lng, 'Me');
            } else {
              addMarker(users[currUser].lat, users[currUser].lng, currUser);
            }
          });
        });

        //send GPS updates to the server every 30 seconds
        setInterval(function () {
          navigator.geolocation.getCurrentPosition(function (position) {
            var pos = position.coords;
            var data = {
              user: user,
              lat: pos.latitude,
              lng: pos.longitude
            };
            socket.emit('sendUpdate', data);
          });
        }, 30000);
      });
    };
  };

  window.onload = init;
})();
