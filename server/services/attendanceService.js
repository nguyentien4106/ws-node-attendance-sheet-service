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

export const insertAttendance = (log, deviceId, uploaded = true) => {
    return query(
        `
        WITH display_name as (
            SELECT "Users"."Name" as "UserName", "Users"."DisplayName" as "Name", "Devices"."Name" as "DeviceName", "Devices"."Id" as "DeviceId" 
            FROM public."Users" JOIN "Devices" ON "Users"."DeviceIp" = "Devices"."Ip" 
            WHERE "Users"."UserId" = '${log.userId}' AND "Devices"."Id" = '${deviceId}'
        )
 
        INSERT INTO public."Attendances"(
            "UserId", "DeviceId", "VerifyDate", "DeviceName", "UserName", "Name", "Uploaded")

            SELECT '${log.userId}', "DeviceId", '${dayjs(log.attTime).format(DATABASE_DATE_FORMAT + " " + TIME_FORMAT)}', "DeviceName", "UserName", "Name", ${uploaded} from display_name RETURNING *
        `
    );
};

export const getAttendances = (params) => {
    if (params.deviceId == "All") {
        return query(`
            SELECT "Id", "DeviceId", "UserId", "DeviceName", "UserName", "Name", "Uploaded", TO_CHAR("VerifyDate", 'YYYY-MM-DD HH24:MI:SS') AS "VerifyDate"
            FROM public."Attendances"
            WHERE "VerifyDate" BETWEEN SYMMETRIC '${params.fromDate}' AND '${params.toDate}'
            ORDER BY "Id" DESC 
        `);
    }

    return query(`
        SELECT "Id", "DeviceId", "UserId", "DeviceName", "UserName", "Name", "Uploaded", TO_CHAR("VerifyDate", 'YYYY-MM-DD HH24:MI:SS') AS "VerifyDate"
        FROM public."Attendances"
        WHERE "DeviceId" = ${params.deviceId} and "VerifyDate" BETWEEN SYMMETRIC '${params.fromDate}' AND '${params.toDate}'
        ORDER BY "Id" DESC 
    `);
};

export const setUploadStatus = (attId, status = false) => {
    return query(`
        UPDATE "Attendances" SET "Uploaded" = ${status} where "Id" = ${attId}
    `);
};

export const syncAttendancesData = async (attendances, users, isDeleteAll = true) => {
    const queryDevices = await getAllDevices();

    const getUser = (userId) => users.find((item) => item.UserId === userId);

    const devices = queryDevices.rows;
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

    if(isDeleteAll){
        await query('DELETE FROM public."Attendances";')
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

export const insertRawAttendances = async (values, isDeleteAll = true) => {

    if(isDeleteAll){
        await query('DELETE FROM public."Attendances";')
    }

    if(values?.length === 0) {
        return []
    }

    const result = await queryFormat(
        `
            INSERT INTO public."Attendances"("DeviceId", "DeviceName", "UserId", "Name", "UserName", "VerifyDate", "Uploaded")
        `,
        values
    );

    return result.rows
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
            await insertToGGSheet([[log.Id, "deleted"]], log.DeviceId)
            return Result.Success(log)
        }

        return Result.Fail(500, "Đã xảy ra lỗi không mong muốn vui lòng thử lại", log)
    } catch (err) {
        return Result.Fail(500, err.message, log)
    }
}
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
