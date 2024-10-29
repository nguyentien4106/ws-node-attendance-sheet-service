import { query, queryFormat } from "../config/db.js";

export const insertNewUsers = (users, deviceIp, displayName) => {
    const values = users.map((item) => [
        item.uid,
        item.name,
        item.password,
        item.role,
        item.cardno,
        displayName ?? item.name,
        item.userId,
        deviceIp,
    ]);

    return queryFormat(
        `INSERT INTO public."Users"("UID", "Name", "Password", "Role", "CardNo", "DisplayName", "UserId", "DeviceIp")`,
        values
    );
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

export const getUID = (deviceIp) =>
    query(
        `SELECT "UID" FROM public."Users" WHERE "DeviceIp" = '${deviceIp}' ORDER BY "UID" DESC LIMIT 1`
    );

export const removeUser = (uid, deviceIp) =>
    query(`DELETE FROM public."Users"
	WHERE "UID" = ${uid} and "DeviceIp" = '${deviceIp}';`);

export const getUser = (uid, userId) => query(
    `SELECT * FROM public."Users" WHERE "UID" = '${uid}' AND "UserId" = '${userId}'`
);