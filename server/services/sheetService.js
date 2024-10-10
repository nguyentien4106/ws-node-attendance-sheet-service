import { query } from "../config/db.js";

export const getSheets = deviceId => query(`SELECT * FROM public."Sheets" WHERE "DeviceId" = '${deviceId}' ORDER BY "Id" ASC `)