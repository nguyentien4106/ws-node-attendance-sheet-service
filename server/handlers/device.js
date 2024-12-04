import { RequestTypes } from "../constants/requestType.js";
import { getAllUsers } from "../dbServices/userService.js";
import { getResponse } from "../models/response.js";
import * as DeviceService from "../dbServices/deviceService.js";
import { addDevice, connectDevice, disconnectDevice, removeDevice } from "../services/device.js";
import { Result } from "../models/common.js";

export const deviceHandlers = (request, ws, deviceContainer) => {
    switch (request.type) {
        case RequestTypes.AddDevice:
            addDevice(request.data, deviceContainer).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;

        case RequestTypes.RemoveDevice:
            removeDevice(request.data, deviceContainer).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;

        case RequestTypes.ConnectDevice:
            connectDevice(request.data, deviceContainer, ws)
                .then((res) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                })
                .catch((err) => { });
            break;

        case RequestTypes.DisconnectDevice:
            disconnectDevice(request.data, deviceContainer)
                .then((res) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                })
                .catch((err) => { });
            break;

        case RequestTypes.GetDevices:
            DeviceService.getAllDevices().then((res) => {
                const { rows } = res;
                ws.send(
                    getResponse({
                        type: request.type,
                        data: rows,
                    })
                );
            });
            break;

        case RequestTypes.GetDevicesSheets:
            DeviceService.getAllDevicesWithSheets().then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;

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

        case RequestTypes.DeviceClearAttendances:
            deviceContainer.clearAttendances(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: Result.Success(res.rows),
                    })
                );
            });
            break;
    }
}