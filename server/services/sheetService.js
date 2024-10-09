import { query } from "../config/db";

export const getSheets = deviceId => query(`SELECT * FROM public."Sheets" WHERE "DeiceId" = '${deviceId}' ORDER BY "Id" ASC `)