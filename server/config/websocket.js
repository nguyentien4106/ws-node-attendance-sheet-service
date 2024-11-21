import { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { getSettings, login } from "../dbServices/settingsService.js";
import { Result } from "../models/common.js";

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
	console.log(`Request received:`);
	console.log(`URL: ${req.url}`);
	console.log(`Method: ${req.method}`);
	console.log(`Headers: `, req.headers);
	let body = "";
    let logs = []
	req.on("data", (chunk) => {
		console.log("chunk", chunk.toString("ascii"));
        const opLogs = chunk.toString("ascii").split("\n")
        logs = opLogs.map(log => log.split("\t"))
		body += chunk.toString();
	});
	req.on("end", () => {
		console.log(`lgos: `, logs);
		res.end("OK");
	});
});

// 123       2024-11-22 01:10:00     4       1       0       0       0       0       0       0

const port = 8081;
cloudServer.listen(port, () => {
	console.log("Server is listening on port " + port);
});


export const websocket = {
    wss: new WebSocketServer({ server }),
    server: server,
};
