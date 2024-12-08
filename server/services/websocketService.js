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
import os from 'os'
import { settingHandlers } from "../handlers/setting.js";

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
		else {
			settingHandlers(request, ws, deviceContainer)
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
