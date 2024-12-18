import { query, queryFormat } from "../config/db.js";
import { EMPLOYEE_DATA, USER_HEADER_ROW } from "../constants/common.js";
import { getRole, UserRoles } from "../constants/userRoles.js";
import { removeUserOnSheet } from "../helper/dataHelper.js";
import { Result } from "../models/common.js";
import { appendRow, initSheets } from "./dataService.js";
import { getSheetsByDeviceIp } from "./sheetService.js";

export const insertNewUsers = async (
	users,
	device,
	displayName,
	pushToSheet = true
) => {
	const values = users.map((item) => [
		item.uid,
		item.name,
		item.password,
		item.role,
		item.cardno,
		displayName ?? item.name,
		`${item.uid}`,
		device.Ip,
		item.employeeCode ?? "",
	]);

    if(!values.length){
        return { rowCount: 0, rows: []}
    }

	const result = await queryFormat(
		`INSERT INTO public."Users"("UID", "Name", "Password", "Role", "CardNo", "DisplayName", "UserId", "DeviceIp", "EmployeeCode")`,
		values
	);

	if (!pushToSheet) {
		return result;
	}

	const usersToSheet = result.rows.map((item) => [
		item.Id,
		item.UID,
		item.EmployeeCode,
		getRole(item.Role),
		item.DeviceIp,
		device.DeviceName,
		item.Name,
		item.DisplayName,
		item.Password,
		item.CardNo,
	]);

	let sheets = device.Sheets;
	if (!sheets) {
		const query = await getSheetsByDeviceIp(device.Ip);
		sheets = query.rows;
	}

	const sheetServices = await initSheets(
		sheets.map((item) => ({
			DocumentId: item.DocumentId,
			SheetName: EMPLOYEE_DATA,
		})),
		USER_HEADER_ROW
	);
	await appendRow(
		sheetServices.filter((item) => item.isSuccess).map((item) => item.data),
		usersToSheet
	);

	return result;
};

export const getAllUsers = (deviceIp = "All") => {
	const sql = `
        SELECT 
            "Users".*, 
            "Devices"."Name" as "DeviceName" 
        FROM 
            public."Users" 
        JOIN 
            "Devices"
        ON 
            "Users"."DeviceIp" = "Devices"."Ip"
        ${deviceIp !== "All" ? `WHERE "Users"."DeviceIp" = '${deviceIp}'` : ""}
        ORDER BY "Users"."Id" DESC
    `;

	return query(sql);
};

export const getUsersByDeviceId = (deviceId) => {
	const sql = `
        SELECT "Users".*, "Devices"."Name" as "DeviceName" 
        FROM public."Users" JOIN "Devices" ON "Users"."DeviceIp" = "Devices"."Ip"
        ${
					deviceId && deviceId !== "All"
						? `WHERE "Devices"."Id" = ${deviceId}`
						: ""
				}
        ORDER BY "Users"."Id" DESC
    `;

	return query(sql);
};

export const getLastUID = (deviceIp) =>
	query(
		`SELECT "UID" FROM public."Users" WHERE "DeviceIp" = '${deviceIp}' ORDER BY "UID" DESC LIMIT 1`
	);

export const removeUser = async ({ uid, deviceIp, deleteSheet }) => {
	const sql = `
        DELETE FROM public."Users"
	    WHERE "UID" = ${uid} and "DeviceIp" = '${deviceIp}' RETURNING *;
    `;
	const users = (await query(sql)).rows;

	if (!users.length) {
		return Result.Fail(
			404,
			"Không tìm thấy người dùng này vui lòng refresh và thử lại."
		);
	}

	if (!deleteSheet) {
		return Result.Success(users[0], "Đã xoá User trong hệ thống thành công.");
	}

	return await removeUserOnSheet(deviceIp, users[0]);
};

export const getUser = (uid, userId) =>
	query(
		`SELECT * FROM public."Users" WHERE "UID" = '${uid}' AND "UserId" = '${userId}'`
	);

export const editUserDisplayName = async (data) => {
	const sql = `
        UPDATE public."Users"
        SET "DisplayName"= '${data.DisplayName}', "EmployeeCode" = '${data.EmployeeCode}'
        WHERE "Id" = ${data.Id}
        RETURNING *;
    `;

	const result = await query(sql);
	if (!result.rowCount) {
		return result;
	}

	try {
		const sheets = (await getSheetsByDeviceIp(data.DeviceIp)).rows;
		const sheetServices = await initSheets(
			sheets.map((item) => ({
				DocumentId: item.DocumentId,
				SheetName: EMPLOYEE_DATA,
			}))
		);
		// await appendRow(sheetServices.filter(item => item.isSuccess).map(item => item.data), [[user[0].Id, "deleted"]])
		const services = sheetServices
			.filter((item) => item.isSuccess)
			.map((item) => item.data);
		for (const service of services) {
			const rows = await service.getRows();
			for (const row of rows) {
				if (+row.get(USER_HEADER_ROW[0]) === data.Id) {
					row.set(USER_HEADER_ROW[7], result.rows[0].DisplayName);
					row.set(USER_HEADER_ROW[2], result.rows[0].EmployeeCode);
					await row.save();
				}
			}
		}
	} catch (err) {
		return Result.Fail(500, err.message);
	}

	return result;
};

export const validUserId = async (deviceIp, userId) => {
	const users = (await getAllUsers(deviceIp)).rows;

	return users.find((item) => item.UserId === userId) ? false : true;
};

const updateUser = async (user, deviceIp) => {
	let sql = `
            UPDATE public."Users"
            SET "Name"='${user.name}', "Password"='${user.password}', "Role"=${user.role}, "CardNo"='${user.cardno}'
            WHERE "UID" = ${user.uid} AND "DeviceIp" = '${deviceIp}'; 
        `;

	await query(sql);

	return {
		Role: user.role,
		Name: user.name,
		Password: user.password,
		CardNo: user.cardno,
		DeviceIp: deviceIp,
		UID: user.uid,
	};
};

const deleteUser = async (user, deviceIp) => {
	let sql = `
        DELETE FROM public."Users"
        WHERE "UID" = ${user.UID} AND "DeviceIp" = '${deviceIp}';
    `;

	await query(sql);

	return { UID: user.UID, DeviceIp: deviceIp };
};

const addUser = async (user, deviceIp, deviceName) => {
	let sql = `
        INSERT INTO public."Users"(
        "Name", "Password", "Role", "CardNo", "DisplayName", "DeviceIp", "UID", "UserId", "EmployeeCode")
        VALUES ('${user.name}', '${user.password}', ${user.role}, ${user.cardno}, '${user.name}', '${deviceIp}', ${user.uid}, ${user.userId}, '') RETURNING *;
    `;

	const result = await query(sql);

	return result.rows.map(item => Object.assign(item, { DeviceName: deviceName }));
};

export const handleLoadUsersFromMachine = async (usersInMachine, deviceIp, deviceName) => {
	try {
		const usersInDb = (await getAllUsers(deviceIp)).rows;
		const uidsInDb = usersInDb.map((user) => user.UID);
        const userIdsDb = usersInDb.map(u => u.UserId)
		const uidsInMachine = usersInMachine.map((user) => user.uid);
        const userIdsMachine = usersInMachine.map(u => u.userId)

		// Identify deleted and new users
		const uidsDeleted = [...uidsInDb].filter(
			(uid) => !uidsInMachine.includes(uid)
		);
		const removeUsers = usersInDb.filter((user) =>
			uidsDeleted.includes(user.UID)
		);
		const newUsers = usersInMachine.filter(
			(user) => !userIdsDb.includes(user.userId)
		);

		console.log("newUsers", newUsers);
		// Helper function to check if a user needs an update
		const isUpdateUser = (machineUser) => {
			const userInDb = usersInDb.find(
				(dbUser) =>
					dbUser.UID === machineUser.uid && dbUser.DeviceIp === deviceIp
			);
			if (!userInDb) return false;

			// Compare relevant fields
			return (
				machineUser.role != userInDb.Role ||
				machineUser.password != userInDb.Password ||
				machineUser.name != userInDb.Name ||
				machineUser.cardno != userInDb.CardNo
			);
		};

		// Identify users to update
		const updateUsers = usersInMachine.filter(isUpdateUser);

		// Process updates and deletions
		const resultUpdate = await Promise.all(
			updateUsers.map((user) => updateUser(user, deviceIp))
		);
		const resultRemove = await Promise.all(
			removeUsers.map((user) => deleteUser(user, deviceIp))
		);
		const resultAdd = await Promise.all(
			newUsers.map((user) => addUser(user, deviceIp, deviceName))
		);

		console.log("result all", {
			resultAdd,
			resultUpdate,
			resultRemove,
		});
		return {
			resultAdd,
			resultUpdate,
			resultRemove,
		};
	} catch (err) {
		console.log(err);
	}
};
