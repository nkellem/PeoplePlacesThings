const http = require('http');
const socketio = require('socket.io');
const nodeStatic = require('node-static');
// instantiates the node-static object to allow for file serving
const fileServer = new nodeStatic.Server(`${__dirname}/../client`, {
  cache: false,
  gzip: true,
});

// instantiate the port env property
const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

// serves files upon request from the client
const onRequest = (request, response) => {
  fileServer.serve(request, response);
};

// start the server
const app = http.createServer(onRequest).listen(PORT);

console.log(`Listening on localhost:${PORT}`);

// pass in the http server into socketio and grab the websocket sever as io
const io = socketio(app);

// users object to store our users in their respective rooms
// loads some dummy users for testing purposes
// these users only show up when joining the rooms 'testRoom' and 'testRoom2'
const users = {
  testRoom: {
    test: {
      lat: 43.161030,
      lng: -77.610924,
    },
  },

  testRoom2: {
    test: {
      lat: 35.161030,
      lng: -70.610924,
    },
  },
};

// keeps track of which socket belongs to which room
// this is so sockets and leave rooms on disconnect and delete user data
const userRooms = {};

// keeps track of a user's data once they are connected and sends data for their map
const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    socket.join(data.room);
    socket.name = data.user;
    userRooms[data.user] = data.room;
    users[data.room] = users[data.room] || {};
    users[data.room][data.user] = { lat: data.lat, lng: data.lng };
    socket.emit('updateMap', users[data.room]);
  });
};

// updates the room's maps when a user updates their GPS coordinates
const onUpdateClientMap = (sock) => {
  const socket = sock;

  socket.on('sendUpdate', (data) => {
    users[userRooms[data.user]][data.user] = { lat: data.lat, lng: data.lng };
    socket.broadcast.to(userRooms[socket.name]).emit('updateMap', users[userRooms[socket.name]]);
  });
};

// no longer keeps track of a disconnected user's data
const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    delete users[userRooms[socket.name]][socket.name];
    socket.leave(userRooms[socket.name]);
  });
};

// initializes the websocket connection between client and server
io.sockets.on('connection', (socket) => {
  console.log('started');

  onJoined(socket);
  onUpdateClientMap(socket);
  onDisconnect(socket);

  // this is for testing purposes
  users.testRoom.test.lat = 43.161030;
  users.testRoom2.test.lat = 35.161030;
  setInterval(() => {
    console.log('changing');
    users.testRoom.test.lat += 0.1;
    users.testRoom2.test.lat += 0.1;
    io.sockets.in('testRoom').emit('updateMap', users.testRoom);
  }, 5000);
});

console.log('Websocket server started');
