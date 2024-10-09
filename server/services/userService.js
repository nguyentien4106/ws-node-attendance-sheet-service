import { query, queryFormat } from "../config/db.js";
import format from "pg-format";

export const insertNewUsers = (users, deviceIp) => {
	const values = users.map(item => [item.uid, item.name, item.password, item.role, item.cardno, item.name, item.userId, deviceIp])
	return queryFormat(`INSERT INTO public."Users"("UID", "Name", "Password", "Role", "CardNo", "DisplayName", "UserId", "DeviceIp")`, values)
	
}

export const getAllUsers = () => query(`SELECT * FROM public."Users"`)
export const getUID = (deviceIp) => query(`SELECT "UID" FROM public."Users" WHERE "DeviceIp" = '${deviceIp}' ORDER BY "UID" DESC LIMIT 1`)