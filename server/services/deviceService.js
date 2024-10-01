import { query } from "../config/db.js";


export const getAllDevices = () => query('SELECT * FROM "Devices"')

export const disconnectAllDevices = () => query('UPDATE "Devices" SET "IsConnected" = false');

export const setConnectStatus = (deviceId, status) => query(`UPDATE "Devices" SET "IsConnected" = ${status ? "true" : "false"} WHERE "Id" = ${deviceId}`);

export const getSheetsByDevice = (deviceId) => query(`SELECT * FROM "Sheets" WHERE "Sheets"."DeviceId" = ${deviceId}`)