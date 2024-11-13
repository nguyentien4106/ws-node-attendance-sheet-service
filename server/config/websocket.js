import { WebSocketServer } from "ws";
import express from "express";
import http from "http";
import cors from "cors";
import bodyParser from "body-parser";
import { getSettings, login } from "../services/settingsService.js";
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
  console.log(req.body);
  try {
    const query = await login(req.body.email, req.body.password);
    console.log(query)
    const result = query.rowCount
      ? Result.Success({
          auth: true,
          email: query.rows[0].Email,
        })
      : Result.Fail("Sai tên đăng nhập hoặc mật khẩu.");

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

export const websocket = {
  wss: new WebSocketServer({ server }),
  server: server,
};
