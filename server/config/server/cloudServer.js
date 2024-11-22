import http from "http";
import "dotenv/config"
import express from 'express'
import { getRequest, handleNewRecord, handShake } from "./iclockController.js";

export const initializeCloudServer = () => {
    const app = express();

    const cloudServer = http.createServer(app);

    app.get('/iclock/cdata', handShake)

    app.get('/iclock/getrequest', getRequest)

    app.post('/iclock/cdata', handleNewRecord)

    return cloudServer;
};
