import dayjs from "dayjs";
import { Result } from "../models/common.js";
import { insertAttendance, setUploadStatus } from "../dbServices/attendanceService.js";
import { appendRow, initSheets } from "../dbServices/dataService.js";
import { getSheets } from "../dbServices/sheetService.js";
import { DATE_FORMAT, HEADER_ROW, OPTIONS_DELETE_SHEETS, TIME_FORMAT } from "../constants/common.js";
import { websocket } from '../config/websocket.js'
import { RequestTypes } from "../constants/requestType.js";
import { getResponse } from "../models/response.js";
import { getDeviceBySN } from "../dbServices/deviceService.js";

export const handleRealTimeDataBySN = async (log, sn) => {
    try{
        const query = await getDeviceBySN(sn)
        if(!query.rowCount){
            return Result.Fail(500, `Không tìm thấy thiết bị nào có số Serial: ${sn} trong hệ thống`)
        }

        const device = query.rows[0]
        return await handleRealTimeData(log, device.Id)
    }
    catch(err){

        return Result.Fail(500, err.message, { log })
    }
};

export const handleRealTimeData = async (log, deviceId) => {
    try{
        const dbRow = await insertDB(log, deviceId)

        if(!dbRow.length){
            return Result.Fail(500, "Đã xảy ra lỗi khi thêm dữ liệu attendance mới.", { log, deviceId })
        }
        const sheetRows = dbRow.map(item => {
            const time = dayjs(item.VerifyDate)
            return [item.Id, item.DeviceId, item.DeviceName, item.UserId, item.UserName, item.Name, time.format(DATE_FORMAT), time.format(TIME_FORMAT)]
        })

        const sheetRow =  await insertToGGSheet(sheetRows, deviceId);

        if(!sheetRow.isSuccess){
            setUploadStatus(dbRow[0].Id)
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
    catch(err){

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
        for(const row of rows){
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

        if(opts.type === OPTIONS_DELETE_SHEETS.ByDeviceId){
            for(const sheet of services){
                const rows = await sheet.getRows()
                for(const row of rows){
                    if(+row.get(HEADER_ROW[1]) === opts.deviceId){
                        await row.delete()
                    }
                }
            } 
        }
        else if(opts.type === OPTIONS_DELETE_SHEETS.All){
            for(const sheet of services){
                await sheet.clearRows()
            } 
        }

        await appendRow(services, rows);
        for(const row of rows){
            setUploadStatus(row[0], true)
        }
        return Result.Success({ rows, deviceId })
    } catch (err) {
        console.error("insert to gg sheet error: ", err.message);
        return Result.Fail(500, err.message, { rows, deviceId });
    }
}