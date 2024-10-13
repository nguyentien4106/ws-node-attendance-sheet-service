import { query } from "../config/db.js";
import { Result } from "../models/common.js";


export const getAllDevices = () => query('SELECT * FROM "Devices" ORDER BY "Devices"."Id"')

export const disconnectAllDevices = () => query('UPDATE "Devices" SET "IsConnected" = false');

export const setConnectStatus = (deviceIp, status) => query(`UPDATE "Devices" SET "IsConnected" = ${status ? "true" : "false"} WHERE "Ip" = '${deviceIp}'`);

export const getSheetsByDevice = (deviceId) => query(`SELECT * FROM "Sheets" WHERE "Sheets"."DeviceId" = ${deviceId}`)

export const insertNewDevice = device => {

    if(!device.Sheets.length){
        return Result.Fail(500, 'Sheets is empty', device)
    }

    let sheetQuery = `SELECT "Id", '${device.Sheets[0].SheetName}', '${device.Sheets[0].DocumentId}' FROM "device"`


    for(let i = 1; i < device.Sheets.length; i++){
        const sheet = device.Sheets[i]
        const part = `UNION ALL
        SELECT "Id", '${sheet.SheetName}', '${sheet.DocumentId}' FROM "device"`
        sheetQuery += part
    }

    return query(`WITH device AS (
        INSERT INTO "Devices"("Ip", "Port", "CommKey", "IsConnected", "Name") 
        VALUES ('${device.Ip}', ${device.Port}, 0, false, '${device.Name}') RETURNING *
    )
    
        INSERT INTO "Sheets"("DeviceId", "SheetName", "DocumentId") 
        ${sheetQuery};
    `)
}

export const insertNewSheets = (sheets, deviceId) => query(`INSERT INTO "Sheets"("DeviceId", "SheetName", "DocumentId") VALUES ${sheets.map(item => {
    return `${deviceId}', ${item.SheetName}, ${item.DocumentId})`
}).join(",")}`)

export const deleteDevice = async device => {
    return query(`with delete_devices as (
  delete from "Devices"
  where "Ip" = '${device.Ip}'
  returning "Ip"
)
delete from "Users"
where "DeviceIp" in (select "Ip" from delete_devices);`)
}