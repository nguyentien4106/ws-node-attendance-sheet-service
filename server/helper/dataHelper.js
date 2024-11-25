import dayjs from "dayjs";
import { Result } from "../models/common.js";
import { getAttendancesById, insertAttendance, setUploadStatus } from "../dbServices/attendanceService.js";
import { appendRow, initSheets } from "../dbServices/dataService.js";
import { getSheets, getSheetsByDeviceIp } from "../dbServices/sheetService.js";
import { DATE_FORMAT, EMPLOYEE_DATA, HEADER_ROW, OPTIONS_DELETE_SHEETS, TIME_FORMAT, USER_HEADER_ROW } from "../constants/common.js";
import { websocket } from '../config/websocket.js'
import { RequestTypes } from "../constants/requestType.js";
import { getResponse } from "../models/response.js";
import { getDeviceBySN } from "../dbServices/deviceService.js";

export const handleRealTimeDataBySN = async (log, sn) => {
    try {
        const query = await getDeviceBySN(sn)
        if (!query.rowCount) {
            return Result.Fail(500, `Không tìm thấy thiết bị nào có số Serial: ${sn} trong hệ thống`)
        }

        const device = query.rows[0]
        return await handleRealTimeData(log, device.Id)
    }
    catch (err) {

        return Result.Fail(500, err.message, { log })
    }
};

export const handleRealTimeData = async (log, deviceId) => {
    try {
        const logRow = await insertDB(log, deviceId)

        if (!logRow.length) {
            return Result.Fail(500, "Đã xảy ra lỗi khi thêm dữ liệu attendance mới.", { log, deviceId })
        }

        const rows = (await getAttendancesById(logRow[0].Id)).rows

        if (!rows.length) {
            return Result.Fail(500, "Đã xảy ra lỗi khi thêm dữ liệu attendance mới.", { log, deviceId })
        }

        const sheetRows = rows.map(item => {
            const time = dayjs(item.VerifyDate)
            return [item.Id, item.DeviceName, item.UserId, item.EmployeeCode, item.UserName, item.Name, time.format(DATE_FORMAT), time.format(TIME_FORMAT)]
        })

        const sheetRow = await insertToGGSheet(sheetRows, deviceId);

        if (!sheetRow.isSuccess) {
            setUploadStatus(logRow[0].Id)
            return Result.Fail(500, `Data chưa được đẩy lển sheet. ${sheetRow.message}`)
        }

        websocket.wss.clients.forEach(function each(client) {
            client.send(
                getResponse({
                    type: RequestTypes.AddLog,
                    data: Result.Success(dbRow),
                })
            );
        });

        return Result.Success(dbRow)
    }
    catch (err) {

        return Result.Fail(500, err.message, { log, deviceId })
    }
};

const insertDB = async (log, deviceId) => {
    const result = await insertAttendance(log, deviceId)
    return result.rows
};

export const insertToGGSheet = async (rows, deviceId) => {
    try {
        const sheets = await getSheets();
        const sheetServices = await initSheets(sheets.rows);
        await appendRow(sheetServices.filter(item => item.isSuccess).map(item => item.data), rows);
        for (const row of rows) {
            setUploadStatus(row[0], true)
        }
        return Result.Success({ rows, deviceId })
    } catch (err) {
        console.error("insert to gg sheet error: ", err.message);
        return Result.Fail(500, err.message, { rows, deviceId });
    }
};

export const handleSyncDataToSheet = async (rows, deviceId, opts) => {
    try {
        const sheets = await getSheets();
        const sheetServices = await initSheets(sheets.rows);
        const services = sheetServices.filter(item => item.isSuccess).map(item => item.data)

        if (opts.type === OPTIONS_DELETE_SHEETS.ByDeviceId) {
            for (const sheet of services) {
                const rows = await sheet.getRows()
                for (const row of rows) {
                    if (+row.get(HEADER_ROW[1]) === opts.deviceId) {
                        await row.delete()
                    }
                }
            }
        }
        else if (opts.type === OPTIONS_DELETE_SHEETS.All) {
            for (const sheet of services) {
                await sheet.clearRows()
            }
        }

        await appendRow(services, rows);
        for (const row of rows) {
            setUploadStatus(row[0], true)
        }
        return Result.Success({ rows, deviceId })
    } catch (err) {
        console.error("insert to gg sheet error: ", err.message);
        return Result.Fail(500, err.message, { rows, deviceId });
    }
}

export const removeUserOnSheet = async (deviceIp, user) => {
    try {
        const sheets = (await getSheetsByDeviceIp(deviceIp)).rows
        const sheetServices = await initSheets(sheets.map(item => ({ DocumentId: item.DocumentId, SheetName: EMPLOYEE_DATA })))
        // await appendRow(sheetServices.filter(item => item.isSuccess).map(item => item.data), [[user[0].Id, "deleted"]])
        const services = sheetServices.filter(item => item.isSuccess).map(item => item.data)
        for (const service of services) {
            const rows = await service.getRows()
            for (const row of rows) {
                if (+row.get(USER_HEADER_ROW[0]) === user.Id) {
                    await row.delete()
                }
            }
        }
        return Result.Success(user, "Đã xoá User trên Sheets thành công.")
    }
    catch (err) {
        return Result.Fail(500, err.message)
    }
}