import { Result } from "../models/common.js";
import { insertAttendance, setUploadStatus } from "../services/attendanceService.js";
import { appendRow, initSheets } from "../services/dataService.js";
import { getSheets } from "../services/sheetService.js";

export const handleRealTimeData = async (log, deviceId) => {
    try{
        const dbRow = await insertDB(log)
        const sheetRows = dbRow.map(item => [item.Id, item.DeviceId, item.DeviceName, item.UserId, item.UserName, item.Name, item.VerifyDate])

        const sheetRow =  await insertToGGSheet(sheetRows, deviceId);
        if(!sheetRow.isSuccess){
            setUploadStatus(dbRow[0].Id)
            return Result.Fail(500, `Data chưa được đẩy lển sheet. ${sheetRow.message}`)
        }
        return Result.Success({ dbRow, sheetRow })
    }
    catch(err){

        return Result.Fail(500, err.message, { log, deviceId })
    }
};

const insertDB = async (log) => {
    const result = await insertAttendance(log)
    return result.rows
};

export const insertToGGSheet = async (rows, deviceId) => {
    try {
        const sheets = await getSheets(deviceId);
        const result = await initSheets(sheets.rows);

        if(!result.isSuccess){
            return result
        }

        await appendRow(result.data, rows);
        for(const row of rows){
            setUploadStatus(row[0], true)
        }
        return Result.Success({ rows, deviceId })
    } catch (err) {
        console.error("insert to gg sheet error: ", err.message);
        return Result.Fail(500, err.message, { rows, deviceId });
    }
};

export const handleSyncDataToSheet = async (rows, deviceId) => {
    try {
        const sheets = await getSheets(deviceId);
        const result = await initSheets(sheets.rows);

        if(!result.isSuccess){
            return result
        }
        for(const sheet of result.data){
            console.log('clearing rows', sheet.title)
            await sheet.clearRows()
        } 
        await appendRow(result.data, rows);
        for(const row of rows){
            setUploadStatus(row.Id, true)
        }
        return Result.Success({ rows, deviceId })
    } catch (err) {
        console.error("insert to gg sheet error: ", err.message);
        return Result.Fail(500, err.message, { rows, deviceId });
    }
}