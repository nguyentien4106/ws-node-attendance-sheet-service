const websocketService = require('../services/websocketService');

module.exports.onConnection = (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    websocketService.handleMessage(ws, message);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
};