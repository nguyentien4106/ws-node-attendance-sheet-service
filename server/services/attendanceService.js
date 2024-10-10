import { query } from "../config/db.js";

export const insertNewAtt = (obj) => query(`INSERT INTO "Attendances"(
	"EmployeeId", "DeviceId", "VerifyDate", "DeviceName")
	VALUES ($1, $2, $3, $4)`, obj)

export const insertAttendances = (attendances, deviceIp) => {
	const values = users.map(item => [item.uid, item.name, item.password, item.role, item.cardno, item.name, item.userId, deviceIp])
	return queryFormat(`INSERT INTO public."Users"("UID", "Name", "Password", "Role", "CardNo", "DisplayName", "UserId", "DeviceIp")`, values)
	
}

export const insertAttendance = (log) => {
    return query(
        `
        WITH display_name as (
            SELECT "Users"."DisplayName" as "DisplayName", "Devices"."Name" as "DeviceName", "Devices"."Id" as "DeviceId" 
            FROM public."Users" JOIN "Devices" ON "Users"."DeviceIp" = "Devices"."Ip" 
            WHERE "Users"."UserId" = '${log.userId}'
        )

        INSERT INTO public."Attendances"(
            "UserId", "DeviceId", "VerifyDate", "DeviceName", "UserName")

            SELECT '${log.userId}', "DeviceId", '${log.attTime}', "DeviceName", "DisplayName" from display_name RETURNING *
        `
    )
}

export const getAttendances = () => query(`SELECT * FROM "Attendances"`);