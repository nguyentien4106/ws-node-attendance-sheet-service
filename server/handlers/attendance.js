import { RequestTypes } from "../constants/requestType.js";
import { deleteAttendance, getAttendances, insertAttendance, updateAttendance } from "../dbServices/attendanceService.js";
import { getResponse } from "../models/response.js";
import * as DeviceService from "../dbServices/deviceService.js";
import { syncLogData } from "../services/attendance.js";

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

		case RequestTypes.SyncDataFromSheet:
			syncDataFromSheet(request.data).then((res) => {
				ws.send(
					getResponse({
						type: request.type,
						data: Result.Success(res.rows),
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
				false
			).then((res) => {
				ws.send(
					getResponse({
						type: request.type,
						data: res.rowCount
							? Result.Success(res.rows)
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
	}
};
