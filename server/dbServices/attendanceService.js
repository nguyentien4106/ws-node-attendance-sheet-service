import dayjs from "dayjs";
import { query, queryFormat } from "../config/db.js";
import { insertToGGSheet } from "../helper/dataHelper.js";
import { Result } from "../models/common.js";
import { getAllDevices } from "./deviceService.js";
import { DATABASE_DATE_FORMAT, TIME_FORMAT } from "../constants/common.js";

export const insertAttendances = (attendances, users) => {
    const getUser = (userId, uid) => {
        const result = users.filter(
            (item) => item.uid === uid && item.userId === userId
        );
        return result.length ? result[0] : null;
    };

    const values = attendances?.map((item) => {
        const user = getUser(item.user_id, item.sn);
        if (!user) {
            return [
                -1,
                new Date(item.record_time).toLocaleString(),
                "DeviceName: " + item.ip,
                "UserName: " + item.user_id,
                item.user_id,
                "Name: " + item.user_id,
                true,
            ];
        } else {
            return [
                -1,
                new Date(item.record_time).toLocaleString(),
                "DeviceName: " + item.ip,
                user.name,
                user.userId,
                user.name,
                true,
            ];
        }
    });

    return queryFormat(
        `INSERT INTO public."Attendances"("DeviceId", "VerifyDate", "DeviceName", "UserName", "UserId", "Name", "Uploaded")`,
        values
    );
};

export const insertAttendance = (log, deviceId, uploaded = true, manual = false) => {
    return query(
        `
        WITH 
            display_name AS (
            SELECT 
                "Users"."Name" AS "UserName", 
                "Users"."DisplayName" AS "Name", 
                "Devices"."Name" AS "DeviceName", 
                "Devices"."Id" AS "DeviceId" 
            FROM public."Users" 
            JOIN "Devices" ON "Users"."DeviceIp" = "Devices"."Ip" 
            WHERE "Users"."UserId" = '${log.userId}' AND "Devices"."Id" = ${deviceId}
            ),
            a_1 AS (
            INSERT INTO public."Attendances"("UserId", "DeviceId", "VerifyDate", "DeviceName", "UserName", "Name", "Uploaded", "Manual")
            SELECT 
                '${log.userId}', 
                "DeviceId", 
                '${dayjs(log.attTime).format(DATABASE_DATE_FORMAT + " " + TIME_FORMAT)}', 
                "DeviceName", 
                "UserName", 
                "Name", 
                ${uploaded},
                ${manual}
            FROM display_name 
            RETURNING *
            ) 
            SELECT a_1.*, "Users"."EmployeeCode" FROM a_1 JOIN "Users" ON "Users"."UserId" = a_1."UserId";

        `
    );
};

export const getAttendancesById = async id => {
    const sql = `
        SELECT 
            "Attendances"."Id", 
            "DeviceId", 
            "Attendances"."UserId", 
            "DeviceName", 
            "UserName", 
            "Attendances"."Name", 
            "Uploaded", 
            TO_CHAR("VerifyDate", 'YYYY-MM-DD HH24:MI:SS') AS "VerifyDate", 
            "Users"."EmployeeCode" AS "EmployeeCode"
        FROM 
            public."Attendances"
        JOIN 
            "Users" 
        ON 
            "Attendances"."UserId" = "Users"."UserId"

        WHERE "Attendances"."Id" = ${id}
    `;

    return query(sql)
}

export const getAttendances = (params) => {
    // Base query and common SELECT fields
    let baseQuery = `
        SELECT 
            "Attendances"."Id", 
            "DeviceId", 
            "Attendances"."UserId", 
            "DeviceName", 
            "UserName", 
            "Attendances"."Name", 
            "Uploaded", 
            "Manual",
            TO_CHAR("VerifyDate", 'YYYY-MM-DD HH24:MI:SS') AS "VerifyDate", 
            "Users"."EmployeeCode" AS "EmployeeCode"
        FROM 
            public."Attendances"
        JOIN 
            "Users" 
        ON 
            "Attendances"."UserId" = "Users"."UserId"
    `;

    if(!params){
        return query(baseQuery + ` ORDER BY "Id" DESC`)
    }

    const conditions = [];

    if (params.deviceId && params.deviceId !== "All") {
        conditions.push(`"DeviceId" = '${params.deviceId}'`);
    }

    if (params.fromDate && params.toDate) {
        conditions.push(`"VerifyDate" BETWEEN SYMMETRIC '${params.fromDate}' AND '${params.toDate}'`);
    }
    if(params.tableParams && params.tableParams.filters && params.tableParams.filters["Name"]?.length){
        const orCondition = `(${params.tableParams.filters["Name"].map(item => `"Attendances"."Name" = '${item}'`).join(" OR ")})`
        conditions.push(orCondition)        
    }

    if(params.tableParams && params.tableParams.current && params.tableParams.pageSize){
        conditions.push(`LIMIT ${params.tableParams.pageSize} OFFSET ${(params.tableParams.current - 1) * params.tableParams.pageSize}`)
    }

    const conditionQuery = conditions.join(" AND ")

    const sql = baseQuery + " WHERE " + conditionQuery + ` ORDER BY "Id" DESC`
    console.log(sql)
    return query(sql)
}

export const setUploadStatus = (attId, status = false) => {
    return query(`
        UPDATE "Attendances" SET "Uploaded" = ${status} where "Id" = ${attId}
    `);
};

export const handleSyncAttendancesDB = async (attendances, users, deviceId) => {
    const devices = (await getAllDevices()).rows;

    const getUser = (userId) => users.find((item) => item.UserId === userId);
    const getDevice = (ip) => devices.find((item) => item.Ip == ip)

    const values = attendances?.map((item) => {
        const user = getUser(item.user_id);
        const device = getDevice(item.ip);
        return [
            device.Id,
            dayjs(item.record_time).format("YYYY-MM-DD HH:mm:ss"),
            device.Name,
            user?.Name ?? "User Deleted: " + item.user_id,
            item.user_id,
            user
                ? user.DisplayName
                : "User Deleted: " + item.user_id,
            true,
        ];
    });

    if(deviceId){
        await query(`DELETE FROM public."Attendances" WHERE "DeviceId" = ${deviceId};`)
    }
    
    if(values?.length == 0){
        return []
    }
    
    const result = await queryFormat(`
            INSERT INTO public."Attendances"("DeviceId", "VerifyDate", "DeviceName", "UserName", "UserId", "Name", "Uploaded")
        `,
        values
    );

    return result.rows
};

export const insertRawAttendances = async (values, isDeleteAll = false) => {

    if(isDeleteAll){
        await query('DELETE FROM public."Attendances";')
    }

    if(values?.length === 0) {
        return []
    }
    const devices = (await getAllDevices()).rows
    const getDeviceId = deviceName => devices.find(item => item.Name == deviceName)?.Id
    
    values = values.map(row => [getDeviceId(row[0]), ...row])
    const deniedItems = values.filter(row => !row[0])
    const acceptItems = values.filter(row => row[0])
    const result = await queryFormat(
        `
            INSERT INTO public."Attendances"("DeviceId", "DeviceName", "UserId", "Name", "UserName", "VerifyDate", "Uploaded")
        `,
        acceptItems
    );

    return Result.Success({
        accepts: result.rows,
        denieds: deniedItems
    })
}

export const updateAttendance = async ({ logId, date }) => {
    try {
        const sql = `
            UPDATE public."Attendances"
            SET "VerifyDate"='${date}', "Uploaded"= false
            WHERE "Id" = ${logId};
        `;
        const result = await query(sql);

        return result.rowCount ? Result.Success({ logId, date }) : Result.Fail(500, "Đã xảy ra lỗi không mong muốn vui lòng thử lại", { logId, date })
    } catch (err) {
        return Result.Fail(500, err.message, { logId, date })
    }
};

export const deleteAttendance = async (log) => {
    try {
        const sql = `
            DELETE FROM public."Attendances"
            WHERE "Id" = ${log.Id};
        `;
        const result = await query(sql);
        if(result.rowCount){
            await insertToGGSheet([[log.Id, "DELETED"]], log.DeviceId)
            return Result.Success(log)
        }

        return Result.Fail(500, "Đã xảy ra lỗi không mong muốn vui lòng thử lại", log)
    } catch (err) {
        return Result.Fail(500, err.message, log)
    }
}