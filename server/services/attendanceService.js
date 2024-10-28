import { query, queryFormat } from "../config/db.js";
import { getAllDevices } from "./deviceService.js";
import { getAllUsers } from "./userService.js";

export const insertAttendances = (attendances, users) => {
    const getUser = (userId, uid) => {
        const result = users.filter(
            (item) => item.uid === uid && item.userId === userId
        );
        return result.length ? result[0] : null;
    };

    const values = attendances.map((item) => {
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

export const insertAttendance = (log) => {
    return query(
        `
        WITH display_name as (
            SELECT "Users"."Name" as "Name", "Users"."DisplayName" as "UserName", "Devices"."Name" as "DeviceName", "Devices"."Id" as "DeviceId" 
            FROM public."Users" JOIN "Devices" ON "Users"."DeviceIp" = "Devices"."Ip" 
            WHERE "Users"."UserId" = '${log.userId}'
        )
 
        INSERT INTO public."Attendances"(
            "UserId", "DeviceId", "VerifyDate", "DeviceName", "UserName", "Name", "Uploaded")

            SELECT '${log.userId}', "DeviceId", NOW(), "DeviceName", "UserName", "Name", true from display_name RETURNING *
        `
    );
};

export const getAttendances = (params) => {
    if (params.deviceId == "All") {
        return query(`SELECT * FROM public."Attendances" 
                WHERE "VerifyDate" BETWEEN SYMMETRIC '${params.fromDate}' AND '${params.toDate}'
                ORDER BY "Id" DESC 
                `);
    }

    return query(`SELECT * FROM public."Attendances" 
        WHERE "DeviceId" = ${params.deviceId} and "VerifyDate" BETWEEN SYMMETRIC '${params.fromDate}' AND '${params.toDate}'
        ORDER BY "Id" DESC 
        `);
};

export const setUploadStatus = (attId, status = false) => {
    return query(`
    UPDATE "Attendances" SET "Uploaded" = ${status} where "Id" = ${attId}
  `);
};

export const syncAttendancesData = async (attendances, users) => {
    const getUser = (userId, uid) => {
        const result = users.filter(
            (item) => item.uid === uid && item.userId === userId
        );
        return result.length ? result[0] : null;
    };

    const queryDevices = await getAllDevices()
    const devices = queryDevices.rows

    const getDevice = (ip) => {
        const device = devices.find(item => item.Ip == ip)
        return device
    }

    const values = attendances.map((item) => {
        const user = getUser(item.user_id, item.sn);
        const device = getDevice(item.ip)

        if (!user) {
            return [
                device.Id, 
                new Date(item.record_time).toLocaleString(),
                device.Name,
                "UserName: " + item.user_id,
                item.user_id,
                "Name: " + item.user_id,
                true,
            ];
        } else {
            return [
                device.Id,
                new Date(item.record_time).toLocaleString(),
                device.Name,
                user.name,
                user.userId,
                user.name,
                true,
            ];
        }
    });

    return queryFormat(
        `
        DELETE FROM "Attendances";
        INSERT INTO public."Attendances"("DeviceId", "VerifyDate", "DeviceName", "UserName", "UserId", "Name", "Uploaded")
        `,
        values
    );
};

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
