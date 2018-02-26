const http = require('http');
const url = require('url');
const htmlHandler = require('./htmlResponses.js');
const socketio = require('socket.io');

const PORT = process.env.PORT || process.env.NODE_PORT || 3000;

const urlStruct = {
  '/': htmlHandler.getIndex,
  '/connect': htmlHandler.getLogin,
  '/babel/bundle.js': htmlHandler.getJS,
  notFound: htmlHandler.getNotFound,
};

const onRequest = (request, response) => {
  const parsedUrl = url.parse(request.url);

  console.dir(parsedUrl.pathname);

  if (urlStruct[parsedUrl.pathname]) {
    urlStruct[parsedUrl.pathname](request, response);
  } else {
    urlStruct.notFound(request, response);
  }
};

const app = http.createServer(onRequest).listen(PORT);

console.log(`Listening on localhost:${PORT}`);

// pass in the http server into socketio and grab the websocket sever as io
const io = socketio(app);

const users = {
  test: {
    lat: 43.161030,
    lng: -77.610924,
  },
};

const onJoined = (sock) => {
  const socket = sock;

  socket.on('join', (data) => {
    socket.join('room1');
    users[data.user] = { lat: data.lat, lng: data.lng };
    console.dir(users);
    socket.emit('updateMap', users);
  });
};

const onUpdateClientMap = (sock) => {
  const socket = sock;

  socket.on('sendUpdate', () => {
    socket.emit('updateMap', users);
  });
};

const onDisconnect = (sock) => {
  const socket = sock;

  socket.on('disconnect', () => {
    socket.leave('room1');
  });
};

io.sockets.on('connection', (socket) => {
  console.log('started');

  onJoined(socket);
  onUpdateClientMap(socket);
  onDisconnect(socket);
});

console.log('Websocket server started');
