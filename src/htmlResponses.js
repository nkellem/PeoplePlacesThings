const fs = require('fs');
const index = fs.readFileSync(`${__dirname}/../client/index.html`);
const login = fs.readFileSync(`${__dirname}/../client/login.html`);
const fourOFour = fs.readFileSync(`${__dirname}/../client/404.html`);
const bundle = fs.readFileSync(`${__dirname}/../client/babel/bundle.js`);

const getIndex = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(index);
  response.end();
};

const getLogin = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(login);
  response.end();
};

const getJS = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/javascript' });
  response.write(bundle);
  response.end();
};

const notFound = (request, response) => {
  response.writeHead(200, { 'Content-Type': 'text/html' });
  response.write(fourOFour);
  response.end();
};

module.exports = {
  getIndex,
  getLogin,
  getJS,
  notFound,
};
