import { DeviceContainer } from "../models/deviceContainer.js";
import { handleMessage } from "../services/websocketService.js";
import { logger } from "../config/logger.js";
const deviceContainer = new DeviceContainer();

deviceContainer.initAll().then((res) => {
  console.log("init All ", res);
});

export const onConnection = (ws) => {
  try {
    logger.info("New Client connected");

    ws.on("message", (message) => {
      handleMessage(ws, message, deviceContainer);
    });

    ws.on("close", () => {
      logger.info("Client disconnected");
    });
  } catch (err) {
    console.log("unhandled exception", err);
    deviceContainer.disconnectAll().then((res) => {
      console.log("disconnected all devices in unhandled exception");
    });
  }
};

process.on("SIGTERM", shutDown);
process.on("SIGINT", shutDown);
process.on("exit", (code) => {
    console.log('app exited with ' + code)
});

function shutDown() {
  deviceContainer.disconnectAll().finally(() => process.exit(0));
}
