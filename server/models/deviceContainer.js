// Declaration
import { logger } from "../config/logger.js";
import {
    deleteDevice,
    getAllDevices,
    insertNewDevice,
    setConnectStatus,
} from "../services/deviceService.js";
import { Result } from "./common.js";
import Zkteco from "zkteco-js";
import {
    isSheetsValid,
} from "../services/dataService.js";
import {
    syncAttendancesData,
} from "../services/attendanceService.js";
import {
    getAllUsers,
    insertNewUsers,
    removeUser,
} from "../services/userService.js";
import { handleRealTimeData, handleSyncDataToSheet } from "../helper/dataHelper.js";
import { getResponse } from "./response.js";
import { sendMail } from "../services/emailService.js";
import dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "../constants/common.js";

const TIME_OUT = 5500;
const IN_PORT = 2000;

const UNCONNECTED_ERR_MSG = `Thiết bị này chưa được kết nối. Vui lòng kết nối trước khi thực hiện hành động này.`;
const UNEXPECTED_ERR_MSG =
    "Đã xảy ra lỗi không mong muốn. Vui lòng reset thiết bị và thử lại hoặc liên hệ quản trị.";
export class DeviceContainer {
    constructor(devices = []) {
        this.deviceSDKs = devices;
        this.sheetServices = [];
    }

    getDevices() {
        return this.deviceSDKs;
    }

    async initAll() {
        const res = await getAllDevices();
        for (const device of res.rows) {
            const addSuccess = this.addDeviceToContainer(device);
            if (!addSuccess) {
                return false;
            }
        }

        return true;
    }

    addDeviceToContainer(device) {
        const existed = this.deviceSDKs.some((item) => item.ip === device.Ip);

        if (!existed) {
            const deviceSDK = new Zkteco(
                device.Ip,
                device.Port,
                TIME_OUT,
                IN_PORT
            );
            
            this.deviceSDKs.push(deviceSDK);
            logger.info(
                `Added successfully device ${device.Ip} into container`
            );
            return Result.Success(device);
        }

        logger.info(
            `Add failed device ${device.Ip} into container because of duplication`
        );
        return Result.Fail(500, "Device was existed in container", device);
    }

    async addDevice(device) {
        try {
            const existed = this.deviceSDKs.some(
                (item) => item.ip === device.Ip
            );
            if (existed) {
                logger.error("Device with this IP is existed in the system.");
                return new Result(
                    200,
                    "Thiết bị đã có trong hệ thống.",
                    device
                );
            }

            const deviceSDK = new Zkteco(
                device.Ip,
                device.Port,
                TIME_OUT,
                IN_PORT
            );

            const sheetsValid = await isSheetsValid(device.Sheets);
            if (!sheetsValid.isSuccess) {
                return sheetsValid;
            }

            const success = await deviceSDK.createSocket();
            if (success) {
                const users = await deviceSDK.getUsers();
                const result = await insertNewUsers(users.data, deviceSDK.ip);
                
                await deviceSDK.disconnect();
            }

            this.deviceSDKs.push(deviceSDK);
            const result = await insertNewDevice(device);
            return result.rowCount
                ? Result.Success(result.rows[0])
                : Result.Fail(
                      500,
                      "Không thể thêm thiết bị vào hệ thống. Vui lòng reset và thử lại.",
                      device
                  );
        } catch (err) {
            logger.error(err.message);

            return Result.Fail(500, err.message, device);
        }
    }

    async connectDevice(device) {
        try {
            let success = false;
            const deviceSDK = this.deviceSDKs.find(
                (item) => item.ip === device.Ip
            );

            const connect = async () => {
                success = await deviceSDK.createSocket();
                const info = await deviceSDK.getPIN()
                console.log(info)
                await deviceSDK.getRealTimeLogs(async (realTimeLog) => {
                    const insertResult = await handleRealTimeData(
                        realTimeLog,
                        device.Id
                    );
                    console.log("handle realtime data result: ", insertResult);
                });
                setConnectStatus(device.Ip, success);

                return success
                    ? Result.Success(device)
                    : Result.Fail(500, "Cannot connect to device", device);
            };

            if (deviceSDK) {
                return await connect();
            }

            const newDeviceSDK = new Zkteco(
                device.Ip,
                device.Port,
                TIME_OUT,
                IN_PORT
            );
            this.deviceSDKs.push(newDeviceSDK);
            return await connect();
        } catch (err) {
            console.error(err.message);
            return Result.Fail(500, err, device);
        }
    }

    async disconnectDevice(device) {
        try {
            setConnectStatus(device.Ip, false);

            const deviceSDK = this.deviceSDKs.find(
                (item) => item.ip === device.Ip
            );

            if (deviceSDK.ztcp.socket) {
                await deviceSDK.disconnect();
                return Result.Success(device);
            }

            return Result.Success(device);
        } catch (err) {
            return Result.Fail(500, err, device);
        }
    }

    async removeDevice(device) {
        const deviceSDK = this.deviceSDKs.find((item) => item.ip === device.Ip);

        if (!deviceSDK) {
            logger.info("Didn't find any device with IP = " + device.Ip);
            return Result.Fail(
                500,
                "Didn't find any device with IP = " + device.Ip,
                device
            );
        }

        if (deviceSDK.isBusy) {
            logger.info("Device is being busy, please try later this action!");
            return Result.Fail(
                500,
                "Device is being busy, please try later this action!",
                device
            );
        }

        const action = async () => {
            try {
                const indexSDK = this.deviceSDKs.indexOf(deviceSDK);
                if (indexSDK > -1) {
                    this.deviceSDKs.splice(indexSDK, 1);
                }

                const dbSuccess = await deleteDevice(device);

                return dbSuccess.rowCount
                    ? Result.Success(device)
                    : Result.Fail(500, "Fail to remove", device);
            } catch (err) {
                console.log(err.message);
                return Result.Fail(500, err.message, device)
            }
        };
        // is not being connected
        if (!deviceSDK.ztcp.socket) {
            return await action();
        }

        // is being connected
        const result = await deviceSDK.disconnect();

        if (result) {
            logger.info("Disconnect successfully!");
            return await action();
        }

        return Result.Fail(500, "Some errors occur", device);
    }

    async getUsers(deviceIp) {
        const deviceSDK = this.deviceSDKs.find((item) => item.ip === deviceIp);

        if (!deviceSDK) {
            logger.info(`Some errors occur. Please reset and try again`);
            return Result.Fail(500, UNEXPECTED_ERR_MSG);
        }

        if (!deviceSDK.ztcp.socket) {
            logger.info(`Device with IP = ${deviceIp} was not connected`);
            return Result.Fail(500, UNCONNECTED_ERR_MSG);
        }

        const result = await getAllUsers(deviceIp);

        return Result.Success(result.rows);
    }

    async disconnectAll() {
        for (let deviceSDK of this.deviceSDKs) {
            console.log("disconnect " + deviceSDK.ip);

            if (!deviceSDK.connectionType) {
                continue;
            }

            const result = await deviceSDK.disconnect();
            if (result) {
                console.log(
                    `Disconnect device = ${deviceSDK.ip} successfully!`
                );
                await setConnectStatus(deviceSDK.ip, false);
            } else {
                console.error(`Disconnect device = ${deviceSDK.ip} failed!`);
            }
        }

        return true;
    }

    async addUser(user) {
        const result = [];
        for (const deviceIp of user.devices) {
            const deviceSDK = this.deviceSDKs.find(
                (item) => item.ip === deviceIp
            );

            if (!deviceSDK) {
                return Result.Fail(500, UNEXPECTED_ERR_MSG, user);
            }

            if (!deviceSDK.connectionType) {
                return Result.Fail(500, UNCONNECTED_ERR_MSG, user);
            }

            try {
                const users = await deviceSDK.getUsers();
                const lastUid = Math.max(
                    ...users.data.map((item) => +item.uid)
                );

                const addDBResult = await insertNewUsers(
                    [Object.assign(user, { cardno: 0, uid: lastUid + 1 })],
                    deviceSDK.ip,
                    user.displayName
                );
                const res = await deviceSDK.setUser(
                    lastUid + 1,
                    user.userId,
                    user.name,
                    user.password,
                    user.role
                );

                result.push({ addDBResult: addDBResult.rowCount, res });
            } catch (err) {
                console.log(err.message);
                return Result.Fail(500, err, user);
            }
        }

        return Result.Success(result);
    }

    async getAttendances(deviceIp) {
        const deviceSDK = this.deviceSDKs.find((item) => item.ip === deviceIp);

        if (!deviceSDK) {
            return Result.Fail(
                500,
                "Some errors occur that make service is not existed in system. Please reset and try again.",
                deviceIp
            );
        }

        if (!deviceSDK.connectionType) {
            return Result.Fail(500, UNCONNECTED_ERR_MSG, deviceIp);
        }

        try {
            const result = await deviceSDK.getAttendances((e) => {
            });
            console.log(result);

            return Result.Success(result);
        } catch (err) {
            console.log(err.message);
            return Result.Fail(500, err, deviceIp);
        }
    }

    async deleteUser(data) {
        const deviceSDK = this.deviceSDKs.find(
            (item) => item.ip === data.deviceIp
        );

        if (!deviceSDK || !deviceSDK.ztcp.socket) {
            logger.info(`Device with IP = ${data.deviceIp} was not connected`);
            return Result.Fail(500, UNCONNECTED_ERR_MSG);
        }
        try {
            await deviceSDK.deleteUser(+data.uid);
            await removeUser(data.uid, data.deviceIp);
            return Result.Success(data);
        } catch (err) {
            console.error(err);
            return Result.Fail(500, err.message, data);
        }
    }

    async syncData(data, ws) {
        const deviceSDK = this.deviceSDKs.find((item) => item.ip === data.Ip);

        if (!deviceSDK || !deviceSDK.ztcp.socket) {
            logger.info(`Device with IP = ${data.Ip} was not connected`);
            return Result.Fail(500, UNCONNECTED_ERR_MSG);
        }
        try {
            const atts = await deviceSDK.getAttendances();
            const users = await deviceSDK.getUsers();
            const attendances = await syncAttendancesData(atts.data, users.data)
            const rowsData = attendances.map(item => [item.Id, item.DeviceId, item.DeviceName, item.UserId, item.UserName, item.Name, dayjs(item.VerifyDate).format(DATE_TIME_FORMAT)])
            await handleSyncDataToSheet(rowsData, data.Id)
            
            ws.send(
                getResponse({
                    type: "SyncData",
                    data: Result.Success(data),
                })
            );

            return Result.Success(data);
        } catch (err) {
            console.error(err);
            ws.send(
                getResponse({
                    type: "SyncData",
                    data: Result.Fail(500, err.message, data),
                })
            );
            return Result.Fail(500, err.message, data);
        }
    }

    async ping(wss, counter){
        const devices = this.deviceSDKs.filter(device => device.connectionType)
        for(const deviceSDK of devices){
            try{
                const info = await deviceSDK.getPIN()
                if(counter.value === 50){
                    const fd = await deviceSDK.freeData()
                    counter.value = 0;
                }
                else {
                    counter.value++;
                }
                console.log(counter)

            }
            catch(err) {
                await setConnectStatus(deviceSDK.ip, false);
                const result = await this.connectDevice({ Ip: deviceSDK.ip })
                if(result.isSuccess){
                    wss.clients.forEach(function each(client) {
                        client.send(getResponse({
                            type: "Ping",
                            data: {
                                deviceIp: deviceSDK.ip,
                                status: true
                            }
                        }));
                     });
                }
                else {
                    sendMail({
                        subject: "Device Disconnection Alert",
                        device: {
                            Name: "Thiết bị máy chấm công",
                            Ip: deviceSDK.ip
                        }
                    })
                    wss.clients.forEach(function each(client) {
                        client.send(getResponse({
                            type: "Ping",
                            data: {
                                deviceIp: deviceSDK.ip,
                                status: false
                            }
                        }));
                    });

                    this.deviceSDKs = this.deviceSDKs.map(device => {
                        if(device.ip === deviceSDK.ip){
                            device.ztcp.socket = null
                        }

                        return device
                    })
                }
            }
        }
    }
}
