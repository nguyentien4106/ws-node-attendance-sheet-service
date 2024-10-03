import { query } from "../config/db.js";


export const getAllDevices = () => query('SELECT * FROM "Devices"')

export const disconnectAllDevices = () => query('UPDATE "Devices" SET "IsConnected" = false');

export const setConnectStatus = (deviceIp, status) => query(`UPDATE "Devices" SET "IsConnected" = ${status ? "true" : "false"} WHERE "Ip" = ${deviceIp}`);

export const getSheetsByDevice = (deviceId) => query(`SELECT * FROM "Sheets" WHERE "Sheets"."DeviceId" = ${deviceId}`)

export const insertNewDevice = device => query(`INSERT INTO "Devices"("Ip", "Port", "CommKey", "IsConnected") VALUES ('${device.Ip}', ${device.Port}, 0, false) RETURNING Id;`)

export const insertNewSheets = (sheets, deviceId) => query(`INSERT INTO "Sheets"("DeviceId", "SheetName", "DocumentId") VALUES ${sheets.map(item => {
    return `${deviceId}', ${item.SheetName}, ${item.DocumentId})`
}).join(",")}`)

export const deleteDevice = device => query(`DELETE FROM "Devices" WHERE "Ip" = '${device.Ip}'` )