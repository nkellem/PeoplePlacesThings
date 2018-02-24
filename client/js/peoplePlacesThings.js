(function() {
  var map;
  var infoWindow;

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

  const getLatLang = () => {
    let pos;
    navigator.geolocation.getCurrentPosition(position => {
      console.dir(position);
      pos = position.coords;
    });
    console.dir(pos);
    return pos;
  };

  //initialize connection to the server
  const init = () => {
    const user = `User${Math.floor(Math.random() * 1000)}`;

    navigator.geolocation.getCurrentPosition(position => {
      const socket = io.connect();

      initMap(position.coords.latitude, position.coords.longitude);

      socket.on('connect', () => {
        socket.emit('join', {user, lat: position.coords.latitude, lng: position.coords.longitude});
      });

      socket.on('updateMap', data => {
        const users = data;

        Object.keys(users).forEach(currUser => {
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
