import { DeviceContainer } from '../models/deviceContainer.js';
import { handleMessage } from '../services/websocketService.js';
import { logger } from '../config/logger.js';
const deviceContainer = new DeviceContainer();

deviceContainer.initAll().then(res => {
    console.log('init All', res)
})

export const onConnection = (ws) => {
  logger.info("New Client connected");

  ws.on('message', (message) => {
    handleMessage(ws, message, deviceContainer);
  });

  ws.on('close', () => {
    logger.info("Client disconnected");
  });
};

process.on('SIGTERM', shutDown);
process.on('SIGINT', shutDown);
process.on("exit", code => {
    logger.info("App stoped with code " + code);
    logger.error("App stoped with code " + code);
});

function shutDown() {
    deviceContainer.disconnectAll().finally(() => process.exit(0))
}