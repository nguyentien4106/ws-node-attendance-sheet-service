// const { RequestTypes } = require("../models/RequestTypes");
// const { DeviceContainer } = require("../models/deviceContainer");
import { DeviceContainer } from "../models/deviceContainer.js";
import { getResponse } from "../models/response.js";
import * as DeviceService from "./deviceService.js";
import { logger } from "../config/logger.js";
import { RequestTypes } from "../constants/requestType.js";
import { UserRoles } from "../constants/userRoles.js";
import { Result } from "../models/common.js";
import { editUserDisplayName, getAllUsers, getUsersByDeviceId } from "./userService.js";
import { deleteAttendance, getAttendances, insertAttendance, updateAttendance } from "./attendanceService.js";
import { handleDeviceRequest } from "../helper/handlers/handleDeviceRequest.js";
import { appendRow, initSheets, syncDataFromSheet } from "./dataService.js";
import { insertToGGSheet } from "../helper/dataHelper.js";
import { getSettings, updateSettings } from "./settingsService.js";
import dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "../constants/common.js";
import { getSheets } from "./sheetService.js";

const addDevice = (device, container) => {
    return container.addDevice(device);
};

const removeDevice = (device, container) => {
    return container.removeDevice(device);
};

const connectDevice = (device, container) => {

    return container.connectDevice(device);
};

const disconnectDevice = (device, container) => {

    return container.disconnectDevice(device);
};

const addUser = (user, container) => {

    return container.addUser(user);
};

const deleteUser = (data, container) => {

    return container.deleteUser(data);
};

const syncData = (data, container, ws) => {

    return container.syncData(data, ws)
} 


/*

{
    "Id": 4,
    "Name": "nguyenvantien4",
    "Password": "123456",
    "Role": 3,
    "CardNo": "0",
    "DisplayName": "Nguyễn Văn Tiến 4",
    "DeviceIp": "192.168.1.201",
    "UID": 1,
    "UserId": "123459",
    "DeviceName": "Cổng chính"
}
    */
const syncUserData = async (data) => {
    try{
        const rows = data.users.map(item => [item.Id, item.Name, item.Password, item.CardNo, item.DisplayName, item.DeviceIp, item.UID, item.UserId, item.DeviceName])
        const result = await initSheets([data.sheet])

        if(!result.isSuccess){
            return result
        }

        await appendRow(result.data, rows);

        return Result.Success(data)
    }
    catch(err) {
        return Result.Fail(500, err.message, data)
    }

}

const syncLogData = async (data) => {

    try{
        const sheetRows = [data].map(item => [item.Id, item.DeviceId, item.DeviceName, item.UserId, item.UserName, item.Name, dayjs(item.VerifyDate).format(DATE_TIME_FORMAT)])

        const result = await insertToGGSheet(sheetRows, data.DeviceId)
        return result.isSuccess ? Result.Success(data) : Result.Fail(500, result.message, data)
    }
    catch(err){
        return Result.Fail(500, err.msg, data)
    }
}

const updateEmail = async data => {
    try{
        const result = await updateSettings(data)

        return result.rowCount ? Result.Success(data) : Result.Fail(500, "Không thể update settings", data)
    }
    catch(err) {
        return Result.Fail(500, err.message, data)
    }
}

export const handleMessage = (ws, message, deviceContainer) => {
    const request = JSON.parse(message);
    console.log("Received message:", request);

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
                    .catch((err) => {});
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
                    .catch((err) => {});
                break;

            case RequestTypes.GetUsers:
                getAllUsers(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rows,
                        })
                    );
                })
                
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
                
                break;
                
            case "GetDevicesSheets":
                DeviceService.getAllDevicesWithSheets().then(res=> {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                })                
                break;
                
            case RequestTypes.SyncUserData:
                syncUserData(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                })
                break;

            case RequestTypes.SyncLogData:
                syncLogData(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                })
                break;

            case RequestTypes.UpdateEmail:
                updateEmail(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                })
                break;
            
            case RequestTypes.GetSettings:
                getSettings().then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rowCount ? res.rows[0] : { Id: 0, Email: "" },
                        })
                    );
                })
                break;
            case RequestTypes.GetUsersByDeviceId: 
                getUsersByDeviceId(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rows,
                        })
                    );
                })
                break;

            case RequestTypes.UpdateLog: 
                updateAttendance(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                })
                break;

            case RequestTypes.DeleteLog: 
                deleteAttendance(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res,
                        })
                    );
                })
                break;

            case RequestTypes.AddLog: 
                insertAttendance({ userId: request.data.UserId }, request.data.DeviceId, false).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rowCount ? Result.Success(res.rows) : Result.Fail(500, "Thêm không thành công! Vui lòng thử lại"),
                        })
                    );
                })
                break;

            case RequestTypes.GetSheets: 
                getSheets().then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: Result.Success(res.rows),
                        })
                    );
                })
                break;

            case RequestTypes.SyncDataFromSheet: 
                syncDataFromSheet(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: Result.Success(res.rows),
                        })
                    );
                })
                break;

            case RequestTypes.EditUser: 
                editUserDisplayName(request.data).then(res => {
                    ws.send(
                        getResponse({
                            type: request.type,
                            data: res.rowCount ? Result.Success(res.rows[0]) : Result.Fail(500, "Không thể cập nhật thông tin người dùng. Xin thử lại!"),
                        })
                    );
                })
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
