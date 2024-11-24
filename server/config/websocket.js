import { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { getSettings, login } from "../dbServices/settingsService.js";
import { Result } from "../models/common.js";
import { initializeCloudServer } from "./server/cloudServer.js";
import dayjs from "dayjs";

const app = express();
const server = http.createServer(app);
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

app.use(bodyParser.json());
app.use(cors());

app.post("/login", async (req, res) => {
    try {
        const query = await login(req.body.email, req.body.password);
        const result = query.rowCount
            ? Result.Success({
                auth: true,
                email: query.rows[0].Email,
            })
            : Result.Fail(500, "Sai tên đăng nhập hoặc mật khẩu.");

        res.send(result);
    } catch (err) {
        res.send(Result.Fail(500, err.message));
    }
});

app.get("/test", async (req, res) => {
    res.send(dayjs().format());
});

export const websocket = {
    wss: new WebSocketServer({ server }),
    server: server,
    cloudServer: initializeCloudServer()
};
