import { query } from "../config/db.js";

export const insertNewUser = (user) => query(`INSERT INTO public."Users"(
	"UID", "Name", "Password", "Role", "CardNo", "DisplayName", "UserId", "DeviceIp")
	VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING "UID";`, user)

export const getUID = (deviceIp) => query(`SELECT "UID" FROM public."Users" WHERE "DeviceIp" = '${deviceIp}' ORDER BY "UID" DESC LIMIT 1`)