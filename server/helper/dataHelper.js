import { Result } from "../models/common.js";
import { insertAttendance } from "../services/attendanceService.js";
import { appendRow, initSheets } from "../services/dataService.js";
import { getSheets } from "../services/sheetService.js";

export const handleRealTimeData = async (log, deviceId) => {
    try{
        const dbRow = await insertDB(log)
        const sheetRow =  await insertToGGSheet(dbRow, deviceId);
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

const insertToGGSheet = async (rows, deviceId) => {
    const sheetRows = rows.map(item => [item.Id, item.DeviceId, item.DeviceName, item.UserId, item.UserName, item.VerifyDate])
    try {
        const sheets = await getSheets(deviceId);
        const sheetServices = await initSheets(sheets.rows);
        await appendRow(sheetServices, sheetRows);

        return Result.Success({ sheetRows, deviceId })
    } catch (err) {
        console.error("insert to gg sheet error: ", err);
        return Result.Fail(500, err.message, { sheetRows, deviceId });
    }
};
