import { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { getSettings, login } from "../dbServices/settingsService.js";
import { Result } from "../models/common.js";
import { handleRealTimeDataBySN } from "../helper/dataHelper.js";
import url from 'url'

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
    const settings = await getSettings();
    res.send({
        token: settings.rows,
    });
});

const cloudServer = http.createServer((req, res) => {
    const method = req.method
	console.log(`URL: `, req.url);
	console.log(`Method: `, method);
	console.log(`Headers: `, req.headers);
    const URL = url.parse(req.url, true);
    const SN = URL.query["SN"]

    let logs = []

	req.on("data", (chunk) => {
        const opLogs = chunk.toString("ascii").split("\n")
        logs = opLogs.map(log => log.split("\t"))
	});

	req.on("end", async () => {
        if(method === "GET"){
            return
        }

        for(const log of logs){
            const att = {
                userId: log[0] === "OPLOG" ? log[1] : log[0],
                attTime: log[0] === "OPLOG" ? log[2] : log[1],
            }
            await handleRealTimeDataBySN(att, SN)
        }
		res.end("OK");
	});
});

// 123       2024-11-22 01:10:00     4       1       0       0       0       0       0       0

const port = 8081;
cloudServer.listen(port, () => {
	console.log("Cloud Server is listening on port " + port);
});


export const websocket = {
    wss: new WebSocketServer({ server }),
    server: server,
};
