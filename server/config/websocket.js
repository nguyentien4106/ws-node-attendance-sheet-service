import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';

const app = express();
const server = http.createServer(app);

export const websocket = {
    wss: new WebSocketServer({ server }),
    server: server
};