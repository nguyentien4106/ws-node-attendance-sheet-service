const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');
const websocketController = require('./controllers/websocketController');

const app = express();
const server = http.createServer(app);

// WebSocket server setup
const wss = new WebSocketServer({ server });

wss.on('connection', websocketController.onConnection);

server.listen(3000, () => {
  console.log('Server is listening on port 3000');
});