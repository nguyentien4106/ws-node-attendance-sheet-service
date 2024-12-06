import { RequestTypes } from "../constants/requestType.js";
import { deleteAttendance, getAttendances, insertAttendance, updateAttendance } from "../dbServices/attendanceService.js";
import { getResponse } from "../models/response.js";
import { syncLogData } from "../services/attendance.js";
import { Result } from "../models/common.js";
import { DATE_FORMAT, TIME_FORMAT } from "../constants/common.js";
import dayjs from "dayjs";

export const attendanceHandlers = (request, ws, deviceContainer) => {
    switch (request.type) {
        case RequestTypes.GetAttendances:
            getAttendances(request.data)
                .then((res) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rows,
                        })
                    );
                })
                .catch((err) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: err,
                        })
                    );
                });
            break;

        case RequestTypes.SyncData:
            deviceContainer.syncAttendancesData(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: RequestTypes.SyncData,
                        data: res,
                    })
                );
            });

            break;

        case RequestTypes.AddLog:
            insertAttendance(
                {
                    userId: request.data.UserId,
                    attTime: request.data.DateTime,
                },
                request.data.DeviceId,
                false,
                true
            ).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res.rowCount
                            ? Result.Success(res.rows.map(item => Object.assign(item, { VerifyDate: dayjs(item.VerifyDate).format(DATE_FORMAT + " " + TIME_FORMAT) })))
                            : Result.Fail(500, "Thêm không thành công! Vui lòng thử lại"),
                    })
                );
            });
            break;

        case RequestTypes.DeleteLog:
            deleteAttendance(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;

        case RequestTypes.UpdateLog:
            updateAttendance(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;

        case RequestTypes.SyncLogData:
            syncLogData(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;

        case RequestTypes.ExportExcel:
            getAttendances(request.data)
                .then((res) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rows,
                        })
                    );
                })
                .catch((err) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: err,
                        })
                    );
                });
            break;
    }
};
