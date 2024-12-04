import { getResponse } from "../models/response.js";
import { RequestTypes } from "../constants/requestType.js";
import { Result } from "../models/common.js";
import {
	changePassword,
	getSettings,
	updateSettings,
} from "../dbServices/settingsService.js";
import dayjs from "dayjs";
import { getSheets } from "../dbServices/sheetService.js";
import { deviceHandlers } from "../handlers/device.js";
import { userHandlers } from "../handlers/user.js";
import { attendanceHandlers } from "../handlers/attendance.js";

const updateEmail = async (data) => {
	try {
		const result = await updateSettings(data);

		return result.rowCount
			? Result.Success(data)
			: Result.Fail(500, "Không thể update settings", data);
	} catch (err) {
		return Result.Fail(500, err.message, data);
	}
};

export const handleMessage = (ws, message, deviceContainer) => {
	const request = JSON.parse(message);
	console.log("Received message:", request);

	try {
		if (request.type.startsWith("Device.")) {
			deviceHandlers(request, ws, deviceContainer);
		} else if (request.type.startsWith("User.")) {
			userHandlers(request, ws, deviceContainer);
		} else if (request.type.startsWith("Attendance.")) {
			attendanceHandlers(request, ws, deviceContainer);
		}
		switch (request.type) {
			case RequestTypes.UpdateEmail:
				updateEmail(request.data).then((res) => {
					ws.send(
						getResponse({
							type: request.type,
							data: res,
						})
					);
				});
				break;

			case RequestTypes.GetSettings:
				deviceContainer.getInfo().then((info) => {
					getSettings().then((res) => {
						ws.send(
							getResponse({
								type: request.type,
								data: {
									setting: res.rowCount ? res.rows[0] : { Id: 0, Email: "" },
									time: dayjs().format(),
									info: info.map(item => item.data),
								},
							})
						);
					});
				});

				break;

			case RequestTypes.GetSheets:
				getSheets().then((res) => {
					ws.send(
						getResponse({
							type: request.type,
							data: Result.Success(res.rows),
						})
					);
				});
				break;

			case RequestTypes.SyncTime:
				deviceContainer.syncTime().then((res) => {
					ws.send(
						getResponse({
							type: request.type,
							data: Result.Success(res),
						})
					);
				});
				break;

			case RequestTypes.ChangePassword:
				changePassword(request.data).then((res) => {
					ws.send(
						getResponse({
							type: request.type,
							data: res.rowCount
								? Result.Success(res.rows)
								: Result.Fail(
										500,
										"Không thể cập nhật mật khẩu vui lòng thử lại."
								  ),
						})
					);
				});
				break;
		}
	} catch (err) {
		console.error(err);
		ws.send(
			getResponse({
				type: request.type,
				data: Result.Fail(500, err.message, request.data),
			})
		);
	}
};
