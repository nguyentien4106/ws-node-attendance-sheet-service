// const { RequestTypes } = require("../models/RequestTypes");
// const { DeviceContainer } = require("../models/deviceContainer");
import { DeviceContainer } from "../models/deviceContainer.js";
import { getResponse } from "../models/response.js";
import * as DeviceService from "./deviceService.js";
import { logger } from "../config/logger.js";
import { RequestTypes } from "../constants/requestType.js";
import { UserRoles } from "../constants/userRoles.js";
import { Result } from "../models/common.js";
import { getAllUsers } from "./userService.js";
import { getAttendances } from "./attendanceService.js";
import { handleDeviceRequest } from "../helper/handlers/handleDeviceRequest.js";

const c = new DeviceContainer();
// c.addDevice()
// c.removeDevice()
const addDevice = (device, container) => {
    return container.addDevice(device);
};

const removeDevice = (device, container) => {
    console.log("removeDevice", device);
    return container.removeDevice(device);
};

const connectDevice = (device, container) => {
    console.log("connect", device);

    return container.connectDevice(device);
};

const disconnectDevice = (device, container) => {
    console.log("disconnectDevice", device);

    return container.disconnectDevice(device);
};

const addUser = (user, container) => {
    console.log("adduser", user);

    return container.addUser(user);
};

const deleteUser = (data, container) => {
    console.log("deleteUser", data);

    return container.deleteUser(data);
};

const syncData = (data, container, ws) => {
    console.log("syncData", data);

    return container.syncData(data, ws)
} 

export const handleMessage = (ws, message, deviceContainer) => {
    const request = JSON.parse(message);
    console.log("Received message:", request);

    if(request.type.endsWith("Device")){
        handleDeviceRequest(request, deviceContainer)
    }
    try {
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

            case RequestTypes.UpdateDevice:
                break;

            case RequestTypes.ConnectDevice:
                connectDevice(request.data, deviceContainer)
                    .then((res) => {
                        console.log("RequestTypes.ConnectDevice ", res);
                        ws.send(
                            getResponse({
                                type: request.type,
                                data: res,
                            })
                        );
                    })
                    .catch((err) => {});
                break;

            case RequestTypes.DisconnectDevice:
                disconnectDevice(request.data, deviceContainer)
                    .then((res) => {
                        console.log("RequestTypes.DisconnectDevice ", res);
                        ws.send(
                            getResponse({
                                type: request.type,
                                data: res,
                            })
                        );
                    })
                    .catch((err) => {});
                break;

            case RequestTypes.GetUsers:
                deviceContainer.getUsers(request.data).then((users) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: users,
                        })
                    );
                }).catch(err => {
                    console.log(err)
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

            case RequestTypes.AddUser:
                addUser(request.data, deviceContainer).then((res) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                });
                break;

            case RequestTypes.GetAttendances:
                getAttendances(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rows,
                        })
                    );
                }).catch(err => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: err,
                        })
                    );
                })
                // deviceContainer.get
                break;

            case RequestTypes.DeleteUser:
                deleteUser(request.data, deviceContainer).then((res) => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                });
                break;

            case RequestTypes.GetAllUsers:
                getAllUsers().then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rows,
                        })
                    );
                })
                break;

            case RequestTypes.SyncData:
                syncData(request.data, deviceContainer, ws)
                ws.send(
                    getResponse({
                        type: request.type,
                        data: "Done",
                    })
                );
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
