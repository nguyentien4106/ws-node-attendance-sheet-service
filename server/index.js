import { onConnection } from './controllers/websocketController.js';
import "dotenv/config"
import { websocket } from './config/websocket.js';
import { notifyToSheets } from './helper/common.js';
import { logger } from './config/logger.js';

const { wss, server, cloudServer } = websocket

wss.on('connection', onConnection);

const port = process.env.SERVER_PORT || 3000
const cloudServerPort = process.env.CLOUD_SERVER_PORT || 8081

server.listen(port , () => {
  console.log('Server is listening on port on ' + port);
  notifyToSheets("SERVER", "RUNNING BOX", "Server đã được khởi động lại").then().catch((err) => { logger.error(err); })
});

cloudServer.listen(cloudServerPort, () => {
  console.log('Cloud Server is listening on port on ' + cloudServerPort);
})

