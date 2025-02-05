import { DeviceContainer } from "../models/deviceContainer.js";
import { handleMessage } from "../services/websocketService.js";
import { logger } from "../config/logger.js";
import cron from "node-cron";
import { sendMessageToClients, websocket } from "../config/websocket.js";
import { getResponse } from "../models/response.js";

const deviceContainer = new DeviceContainer();
const counter = { value: 0 }

deviceContainer.initAll().then((res) => {
    if(res.isSuccess){
        logger.info(`Initialize containers successfully`)
    }
    else {
        logger.info(`Initialize containers failed`)
        sendMessageToClients(getResponse({
            type: "Ping",
            data: res.message
        }))
    }
});

cron.schedule("*/2 * * * *", () => {
    deviceContainer.ping(websocket.wss, counter)
});

cron.schedule("*/2 * * * *", () => {})

export const onConnection = (ws) => {
    try {
        ws.on("message", (message) => {
            try{
                handleMessage(ws, message, deviceContainer);
            }
            catch(err){
                console.log(err.message)
            }
        });

        ws.on("close", () => {
        });
    } catch (err) {
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
