import { query } from "../config/db.js";

export const insertNewAtt = (obj) => query(`INSERT INTO "Attendances"(
	"EmployeeId", "DeviceId", "VerifyDate", "DeviceName")
	VALUES ($1, $2, $3, $4)`, obj)

export const insertAttendances = (attendances, deviceIp) => {
	const values = users.map(item => [item.uid, item.name, item.password, item.role, item.cardno, item.name, item.userId, deviceIp])
	return queryFormat(`INSERT INTO public."Users"("UID", "Name", "Password", "Role", "CardNo", "DisplayName", "UserId", "DeviceIp")`, values)
	
}