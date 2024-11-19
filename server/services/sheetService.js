import { query } from "../config/db.js";

export const getSheets = () => query(`SELECT * FROM public."Sheets" ORDER BY "Id" ASC `)

export const getSheetsByDeviceId = deviceId => query(`SELECT * FROM public."Sheets" WHERE "DeviceId" = ${deviceId} ORDER BY "Id" ASC `)