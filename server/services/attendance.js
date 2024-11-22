import dayjs from "dayjs";
import { DATE_FORMAT, TIME_FORMAT } from "../constants/common.js";
import { insertToGGSheet } from "../helper/dataHelper.js";
import { Result } from "../models/common.js";

export const syncAttendancesData = (data, container, ws) => {
    return container.syncAttendancesData(data, ws);
};

export const syncLogData = async (data) => {
    try {
        const sheetRows = [data].map((item) => [
            item.Id,
            item.DeviceId,
            item.DeviceName,
            item.UserId,
            item.UserName,
            item.Name,
            dayjs(item.VerifyDate).format(DATE_FORMAT),
            dayjs(item.VerifyDate).format(TIME_FORMAT),
        ]);

        const result = await insertToGGSheet(sheetRows, data.DeviceId);
        return result.isSuccess
            ? Result.Success(data)
            : Result.Fail(500, result.message, data);
    } catch (err) {
        return Result.Fail(500, err.msg, data);
    }
};