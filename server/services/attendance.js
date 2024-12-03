import dayjs from "dayjs";
import { DATE_FORMAT, TIME_FORMAT } from "../constants/common.js";
import { insertToGGSheet } from "../helper/dataHelper.js";
import { Result } from "../models/common.js";

export const syncLogData = async (data) => {
    try {
        const sheetRows = [data].map((item) => [
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

        const result = await insertToGGSheet(sheetRows, data.DeviceId);
        return result.isSuccess
            ? Result.Success(data)
            : Result.Fail(500, result.message, data);
    } catch (err) {
        return Result.Fail(500, err.msg, data);
    }
};