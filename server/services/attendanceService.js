import { query } from "../config/db.js";

export const insertNewAtt = (obj) => query(`INSERT INTO "Attendances"(
	"EmployeeId", "DeviceId", "VerifyDate", "DeviceName")
	VALUES ($1, $2, $3, $4)`, obj)