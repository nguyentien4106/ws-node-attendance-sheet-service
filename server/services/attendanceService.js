import { query } from "../config/db.js";

export const insertNewAtt = (obj) => query(`INSERT INTO "Attendances"(
	"EmployeeId", "DeviceId", "VerifyDate", "DeviceName")
	VALUES ($1, $2, $3, $4)`, obj)

export const insertAttendances = (attendances, deviceIp) => {
	const values = attendances.map(item => [item.uid, item.name, item.password, item.role, item.cardno, item.name, item.userId, deviceIp])
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

            SELECT '${log.userId}', "DeviceId", NOW(), "DeviceName", "DisplayName" from display_name RETURNING *
        `
    )
}

export const getAttendances = () => query(`SELECT * FROM "Attendances"`);


/*atts {
  data: [
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sat Oct 12 2024 16:50:35 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sat Oct 12 2024 16:50:36 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
     */