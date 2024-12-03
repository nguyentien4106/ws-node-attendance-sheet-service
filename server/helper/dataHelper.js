import dayjs from "dayjs";
import { Result } from "../models/common.js";
import { getAttendances, getAttendancesById, insertAttendance, setUploadStatus } from "../dbServices/attendanceService.js";
import { appendRow, initSheets } from "../dbServices/dataService.js";
import { getSheets, getSheetsByDeviceIp } from "../dbServices/sheetService.js";
import { DATE_FORMAT, EMPLOYEE_DATA, TIME_FORMAT, USER_HEADER_ROW } from "../constants/common.js";
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

        console.log(rows)
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
                    data: Result.Success(logRow),
                })
            );
        });

        return Result.Success(logRow)
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

export const handleSyncDataToSheet = async () => {
    try {
        const sheets = await getSheets();
        const sheetServices = await initSheets(sheets.rows);
        const services = sheetServices.filter(item => item.isSuccess).map(item => item.data)
        for (const sheet of services) {
            await sheet.clearRows()
        }
        const attendances = await getAttendances();
        const rowsData = attendances.rows.map((item) => [
            item.Id,
            item.DeviceName,
            item.UserId,
            item.EmployeeCode,
            item.UserName,
            item.Name,
            dayjs(item.VerifyDate).format(DATE_FORMAT),
            dayjs(item.VerifyDate).format(TIME_FORMAT),
            item.Manual ? "X" : ""
        ]);

        await appendRow(services, rowsData);
        for (const row of rowsData) {
            setUploadStatus(row[0], true)
        }

        return Result.Success()
    } catch (err) {
        console.error("insert to gg sheet error: ", err.message);
        return Result.Fail(500, err.message);
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