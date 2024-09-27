import { query } from "../config/db.js";


export const getAllDevices = () => query('SELECT * FROM "Devices"')

export const getSheetsByDevice = (deviceId) => query(`SELECT * FROM "Sheets" WHERE "Sheets"."DeviceId" = ${deviceId}`)