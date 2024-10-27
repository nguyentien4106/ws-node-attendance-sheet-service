import { onConnection } from './controllers/websocketController.js';
import "dotenv/config"
import { websocket } from './config/websocket.js';

const { wss, server } = websocket

wss.on('connection', onConnection);

const port = process.env.SERVER_PORT || 3000
server.listen(port , () => {
  console.log('Server is listening on port on ' + port);
});

