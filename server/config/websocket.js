import { WebSocketServer } from 'ws';
import express from 'express';
import http from 'http';
import cors from 'cors'
import bodyParser from 'body-parser';
import { getSettings, login } from '../services/settingsService.js';

const app = express();
const server = http.createServer(app);
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

app.use(cors())
app.post('/login', async (req, res) => {
    console.log(req.body)
    const result = await login(req.body.email, req.body.password)
    res.send({
        auth: result.rowCount ? true : false,
        email:result.rowCount ? result.rows[0].Email : ""
    });
})

app.get("/test", async (req, res) => {
    const settings = await getSettings()
    res.send({
      token: settings.rows
    });
})

export const websocket = {
    wss: new WebSocketServer({ server }),
    server: server
};