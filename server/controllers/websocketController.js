import { DeviceContainer } from '../models/deviceContainer.js';
import { handleMessage } from '../services/websocketService.js';

const deviceContainer = new DeviceContainer();
export const onConnection = (ws) => {
  console.log('New client connected');

  ws.on('message', (message) => {
    handleMessage(ws, message, deviceContainer);
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
};