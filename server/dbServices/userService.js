import { query, queryFormat } from "../config/db.js";
import { EMPLOYEE_DATA, USER_HEADER_ROW } from "../constants/common.js";
import { UserRoles } from "../constants/userRoles.js";
import { appendRow, initSheets } from "./dataService.js";
import { getSheetsByDeviceIp } from "./sheetService.js";

export const insertNewUsers = async (users, device, displayName) => {
    const values = users.map((item) => [
        item.uid,
        item.name,
        item.password,
        item.role,
        item.cardno,
        displayName ?? item.name,
        `${item.uid}`,
        device.Ip,
        item.employeeCode
    ]);

    const result = await queryFormat(
        `INSERT INTO public."Users"("UID", "Name", "Password", "Role", "CardNo", "DisplayName", "UserId", "DeviceIp", "EmployeeCode")`,
        values
    );

    const usersToSheet = result.rows.map(item => [item.Id, item.UID, item.EmployeeCode, UserRoles[item.Role], item.DeviceIp, device.DeviceName, item.Name, item.DisplayName, item.Password, item.CardNo])
    
    let sheets = device.Sheets
    if (!sheets){
        const query = await getSheetsByDeviceIp(device.Ip);
        sheets = query.rows
    }

    const sheetServices = await initSheets(sheets.map(item => ({ DocumentId: item.DocumentId, SheetName: EMPLOYEE_DATA})), USER_HEADER_ROW)
    await appendRow(sheetServices.filter(item => item.isSuccess).map(item => item.data), usersToSheet)

    return result
};

export const getAllUsers = (deviceIp = "All") => {
    const text = `SELECT "Users".*, "Devices"."Name" as "DeviceName" 
        FROM public."Users" JOIN "Devices" ON "Users"."DeviceIp" = "Devices"."Ip"
        ${deviceIp !== "All" ? `WHERE "Users"."DeviceIp" = '${deviceIp}'` : ""}
        ORDER BY "Users"."Id" DESC`;
        
    return query(text);
};

export const getUsersByDeviceId = deviceId => {
    if(!deviceId) return null
    const text = `
        SELECT "Users".*, "Devices"."Name" as "DeviceName" 
        FROM public."Users" JOIN "Devices" ON "Users"."DeviceIp" = "Devices"."Ip"
        WHERE "Devices"."Id" = ${deviceId}
        ORDER BY "Users"."Id" DESC
    `;
        
    return query(text);
}

export const getLastUID = (deviceIp) =>
    query(
        `SELECT "UID" FROM public."Users" WHERE "DeviceIp" = '${deviceIp}' ORDER BY "UID" DESC LIMIT 1`
    );

export const removeUser = async (uid, deviceIp) => {
    const sql = `
        DELETE FROM public."Users"
	    WHERE "UID" = ${uid} and "DeviceIp" = '${deviceIp}' RETURNING *;
    `
    const user = (await query(sql)).rows
    const sheets = (await getSheetsByDeviceIp(deviceIp)).rows
    const sheetServices = await initSheets(sheets.map(item => ({ DocumentId: item.DocumentId, SheetName: EMPLOYEE_DATA})))
    await appendRow(sheetServices.filter(item => item.isSuccess).map(item => item.data), [[user[0].Id, "deleted"]])
};

export const getUser = (uid, userId) => query(
    `SELECT * FROM public."Users" WHERE "UID" = '${uid}' AND "UserId" = '${userId}'`
);

export const editUserDisplayName = async (data) => {
    const sql = `
        UPDATE public."Users"
        SET "DisplayName"= '${data.DisplayName}'
        WHERE "Id" = ${data.Id}
        RETURNING *;
    `

    return query(sql)
}

export const validUserId = async (deviceIp, userId) => {
    const users = (await getAllUsers(deviceIp)).rows

    return users.find(item => item.UserId === userId) ? false : true
}
