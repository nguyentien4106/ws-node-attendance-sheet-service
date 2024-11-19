import { RequestTypes } from "../constants/requestType";
import { getAllUsers } from "../dbServices/userService";
import { getResponse } from "../models/response";
import * as DeviceService from "../dbServices/deviceService.js";
import { addDevice, connectDevice, disconnectDevice, removeDevice } from "../services/device";
import { syncData } from "../services/attendance";
import { syncDataFromSheet } from "../dbServices/dataService";

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
            connectDevice(request.data, deviceContainer)
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

        case RequestTypes.GetUsers:
            getAllUsers(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res.rows,
                    })
                );
            });

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


        case RequestTypes.SyncData:
            syncData(request.data, deviceContainer, ws);

            break;

        case "GetDevicesSheets":
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

    }
}