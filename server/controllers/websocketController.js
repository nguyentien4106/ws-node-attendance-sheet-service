import { DeviceContainer } from "../models/deviceContainer.js";
import { handleMessage } from "../services/websocketService.js";
import { logger } from "../config/logger.js";
import cron from "node-cron";
import { websocket } from "../config/websocket.js";

const deviceContainer = new DeviceContainer();
const counter = { value: 0 }

deviceContainer.initAll().then((res) => {
    console.log(`Initialize containers ${res ? "successfully" : "failed"}`);
});

const cronTask = cron.schedule("*/30 * * * * *", () => {
    deviceContainer.ping(websocket.wss, counter)
});

export const onConnection = (ws) => {
    try {
        ws.on("message", (message) => {
            handleMessage(ws, message, deviceContainer);
        });

        ws.on("close", () => {
            logger.info("Client disconnected");
        });
    } catch (err) {
        console.log("unhandled exception", err);
        logger.error(`Unhandled exception: ${err.message}`)
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
