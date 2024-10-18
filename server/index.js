// const express = require('express');
// const http = require('http');
// const { WebSocketServer } = require('ws');
// const websocketController = require('./controllers/websocketController');
import express from 'express';
import http from 'http';
import { onConnection } from './controllers/websocketController.js';
import "dotenv/config"
import { websocket } from './config/websocket.js';

// const app = express();
// const server = http.createServer(app);

// WebSocket server setup
const { wss, server } = websocket

wss.on('connection', onConnection);

const port = process.env.SERVER_PORT || 3000
server.listen(port , () => {
  console.log('Server is listening on port on ' + port);
});

