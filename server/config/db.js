
import pkg from "pg";
import "dotenv/config"
import format from "pg-format";
import { sendMessageToClients, websocket } from "./websocket.js";
import { getResponse } from "../models/response.js";
const { Pool } = pkg

const pool = new Pool({
    user: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    host: process.env.POSTGRES_HOST,
    port: +process.env.POSTGRES_PORT,
    database: process.env.POSTGRES_DATABASE,
});

export const query = (text, params) => {
    try{
        return pool.query(text, params)
    }
    catch(err){
        sendMessageToClients(getResponse({
            type: "Ping",
            data: err.code === 'ECONNREFUSED' ? "Không thể kết nối tới database. Vui lòng liên hệ quản trị." : err.message ,
        }))
    }
};

export const queryFormat = (text, values) => {
    try{
        return pool.query(format(`${text} VALUES %L RETURNING *;`, values));
    }
    catch(err) {
        sendMessageToClients(getResponse({
            type: "Ping",
            data: err.code === 'ECONNREFUSED' ? "Không thể kết nối tới database. Vui lòng liên hệ quản trị." : err.message ,
        }))
    }
}