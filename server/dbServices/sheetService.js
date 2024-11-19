import { query } from "../config/db.js";

export const getSheets = (deviceId = null) => {
    if(deviceId) {
        return query(`SELECT * FROM public."Sheets" WHERE "DeviceId" = ${deviceId} ORDER BY "Id" ASC `)
    }

    return query(`SELECT * FROM public."Sheets" ORDER BY "Id" ASC `)
}

export const getSheetsByDeviceIp = async (ip) => {
    const sql = `
        SELECT * FROM public."Sheets" JOIN "Devices" ON "Devices"."Id" = "Sheets"."DeviceId"
        WHERE "Devices"."Ip" = '${ip}'
    `
    return query(sql)
}