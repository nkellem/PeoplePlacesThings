//Code references I used for all code relating to Google Maps API can be found here: https://developers.google.com/maps/documentation/javascript/examples/marker-remove
//Code references I used for all code relating to Geolocation Web API can be found here: https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/Using_geolocation
(function() {
  let map;
  let infoWindow;
  let markers = [];

  //initializes the map view
  //sets up where the center of the map is, zoom level, type, and markers
  const initMap = (lat, lng) => {
    let mapOptions = {
        center: {lat, lng}, //get the long, lat from the Geolocation API
        zoom: 7,
    };

    const mapDiv = document.querySelector('#map');
    mapDiv.style.height = `${window.innerHeight}px`;

    //grab the map from the html page
    map = new google.maps.Map(document.querySelector('#map'), mapOptions);
    map.MapTypeId = "roadmap";

    addMarker(lat, lng, 'Me');
  };

  //adds markers to the map view
  const addMarker = (latitude, longitude, title) => {
      let pos = {lat: latitude, lng: longitude};
      let marker = new google.maps.Marker({position: pos, map: map});
      marker.setTitle(title);

      //add event listener for the click event
      google.maps.event.addListener(marker, 'click', e => {
          makeInfoWindow(pos, title);
      });

      markers.push(marker);
  };

  //creates the overlay that describes what a marker represents
  const makeInfoWindow = (pos, msg) => {
      //close old infowindow if it exists
      if(infoWindow){
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
  const setMapOnAll = map => {
    markers.forEach(marker => {
      marker.setMap(map);
    });
  };

  //Removes the markers from the map, but keeps them in the array.
  const clearMarkers = () => {
    setMapOnAll(null);
  };

  //Deletes all markers in the array by removing references to them.
  const deleteMarkers = () => {
    clearMarkers();
    markers = [];
  };

  //sets up the user room login and user name
  //creates websocket connection
  //inits the google maps view and loads other room users data
  const init = () => {
    document.querySelector('#submit').onclick = e => {
      e.preventDefault();
      //get the data from the form
      const room = document.querySelector('#room').value;
      const user = document.querySelector('#username').value;
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
      const login = document.querySelector('#login');
      const map = document.querySelector('#map');
      login.style.display = 'none';
      map.style.display = 'block';

      //send the initial Websocket connect with GPS coordinates
      navigator.geolocation.getCurrentPosition(position => {
        const socket = io.connect();

        //send websocket connection and initialize google map
        socket.on('connect', () => {
          initMap(position.coords.latitude, position.coords.longitude);
          socket.emit('join', {user, lat: position.coords.latitude, lng: position.coords.longitude, room});
        });

        //set up update map event
        socket.on('updateMap', data => {
          const users = data;
          deleteMarkers();

          Object.keys(users).forEach(currUser => {
            if (currUser === user) {
              addMarker(users[currUser].lat, users[currUser].lng, 'Me');
            } else {
              addMarker(users[currUser].lat, users[currUser].lng, currUser);
            }
          });
        });

        //send GPS updates to the server every 30 seconds
        setInterval(()=> {
          navigator.geolocation.getCurrentPosition(position => {
            let pos = position.coords;
            let data = {
              user,
              lat: pos.latitude,
              lng: pos.longitude,
            };
            socket.emit('sendUpdate', data);
          });
        }, 30000);

      });
    };
  };

  window.onload = init;
})();
