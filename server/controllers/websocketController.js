import { DeviceContainer } from "../models/deviceContainer.js";
import { handleMessage } from "../services/websocketService.js";
import { logger } from "../config/logger.js";
import cron from "node-cron";
import { websocket } from "../config/websocket.js";

const deviceContainer = new DeviceContainer();

deviceContainer.initAll().then((res) => {
    console.log("init All ", res);
});

cron.schedule("*/5 * 6-21 * * *", () => {
    console.log('set up job')
    deviceContainer.ping(websocket.wss).then(res => {
        console.log('ping result', res)
    })
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
    console.log("app exited with " + code);
});

function shutDown() {
    deviceContainer.disconnectAll().finally(() => process.exit(0));
}
