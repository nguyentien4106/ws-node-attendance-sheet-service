// Declaration
import { logger } from "../config/logger.js";
import {
    deleteDevice,
    getAllDevices,
    getDeviceByIp,
    insertNewDevice,
    setConnectStatus,
} from "../services/deviceService.js";
import { Result } from "./common.js";
import Zkteco from "zkteco-js";
import {
    appendRow,
    initSheet,
    initSheets,
    isSheetsValid,
} from "../services/dataService.js";
import { syncAttendancesData } from "../services/attendanceService.js";
import {
    getAllUsers,
    getLastUID,
    insertNewUsers,
    removeUser,
    validUserId,
} from "../services/userService.js";
import {
    handleRealTimeData,
    handleSyncDataToSheet,
} from "../helper/dataHelper.js";
import { getResponse } from "./response.js";
import { sendMail } from "../services/emailService.js";
import dayjs from "dayjs";
import { DATE_FORMAT, TEMPLATE_USER_HEADER_ROW, TIME_FORMAT } from "../constants/common.js";
import { getSheets } from "../services/sheetService.js";
import { UserRoles } from "../constants/userRoles.js";

const TIME_OUT = 5500;
const IN_PORT = 2000;

const UNCONNECTED_ERR_MSG = `Thiết bị này chưa được kết nối. Vui lòng kết nối trước khi thực hiện hành động này. `;
const UNEXPECTED_ERR_MSG =
    "Đã xảy ra lỗi không mong muốn. Vui lòng reset thiết bị và thử lại hoặc liên hệ quản trị. ";

export class DeviceContainer {
    constructor(devices = []) {
        this.deviceSDKs = devices;
        this.sheetServices = [];
    }

    getDevices() {
        return this.deviceSDKs;
    }

    async initAll() {
        try {
            const res = await getAllDevices();
            for (const device of res.rows) {
                const addSuccess = this.addDeviceToContainer(device);
                if (!addSuccess) {
                    return Result.Fail(500, "Không thể khởi tạo thiết bị.");
                }
            }

            return Result.Success();
        }
        catch (err) {
            if(err.code === 'ECONNREFUSED'){
                return Result.Fail(500, "Không thể kết nối tới database. Vui lòng liên hệ quản trị.")
            }

            return Result.Fail(500, "Xảy ra lỗi không mong muốn. Vui lòng liên hệ quản trị.")

        }
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

        return Result.Fail(
            500,
            "Device was existed in container " + device.Ip,
            device
        );
    }

    async addDevice(device) {
        try {
            const existed = this.deviceSDKs.some(
                (item) => item.ip === device.Ip
            );
            if (existed) {
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
            const success = await deviceSDK.createSocket();
            await deviceSDK.getPIN();

            const sheetsValid = await isSheetsValid(device.Sheets);
            if (!sheetsValid.isSuccess) {
                return sheetsValid;
            }

            if (success) {
                await deviceSDK.freeData()
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
            console.log(err)
            if(err.err.toString().includes("TIMEOUT_ON_WRITING_MESSAGE")){
                return Result.Fail(500, "Thiết bị đang bị quá tải hoặc đang được kết nối bởi một tác vụ khác. Vui lòng reset lại MCC và thử lại!")
            }
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
                await deviceSDK.getPIN();
                await deviceSDK.getRealTimeLogs(async (realTimeLog) => {
                    console.log('realTimeLog', realTimeLog)
                    const insertResult = await handleRealTimeData(
                        realTimeLog,
                        device.Id
                    );
                    console.log("handle realtime data result: ", insertResult.isSuccess);
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
            return Result.Fail(500, UNCONNECTED_ERR_MSG + device.Ip, device);
        }

        if (deviceSDK.isBusy) {
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
                return Result.Fail(500, err.message, device);
            }
        };
        // is not being connected
        if (!deviceSDK.ztcp.socket) {
            return await action();
        }

        // is being connected
        const result = await deviceSDK.disconnect();

        if (result) {
            return await action();
        }

        return Result.Fail(500, "Some errors occur", device);
    }

    async getUsers(deviceIp) {
        const deviceSDK = this.deviceSDKs.find((item) => item.ip === deviceIp);

        if (!deviceSDK) {
            return Result.Fail(500, UNCONNECTED_ERR_MSG + deviceIp);
        }

        if (!deviceSDK.ztcp.socket) {
            return Result.Fail(500, UNCONNECTED_ERR_MSG + deviceIp);
        }

        const result = await getAllUsers(deviceIp);

        return Result.Success(result.rows);
    }

    async disconnectAll() {
        for (let deviceSDK of this.deviceSDKs) {
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

    async addUserToDevice(user, deviceSDK, deviceName){
        try {
            // const users = await deviceSDK.getUsers();
            const query = (await getLastUID(deviceSDK.ip))
            const lastUid = query.rowCount ? query.rows[0].UID + 1 : 1;

            const isValidUserId = await validUserId(deviceSDK.ip, user.userId)
            if(!isValidUserId){
                return Result.Fail(500, `UserID ${user.userId}: Đã tồn tại trong thiết bị ${deviceSDK.ip}, vui lòng chọn một UserId khác.`)
            }
            const addDBResult = await insertNewUsers(
                [Object.assign(user, { uid: lastUid })],
                deviceSDK.ip,
                user.displayName
            );
            await deviceSDK.setUser(
                lastUid,
                user.userId,
                user.name,
                user.password,
                user.role,
                +user.cardno
            );

            return Result.Success({ user: addDBResult.rowCount ? { ...addDBResult.rows[0], DeviceName: deviceName } : null }, `Thiết bị: ${deviceSDK.ip}: Thêm thành công. User ID: ${user.userId} - Tên: ${user.name}`);
        } catch (err) {
            console.log(err)
            return Result.Fail(500, err, user)
        }
    }

    async addUser(user) {
        const result = [];
        for (const device of user.devices) {
            const deviceSDK = this.deviceSDKs.find(
                (item) => item.ip === device.ip
            );
    
            if (!deviceSDK ) {
                result.push(Result.Fail(500, UNEXPECTED_ERR_MSG + deviceIp, deviceIp))
                continue
            }

            if(!deviceSDK.connectionType || !deviceSDK.ztcp?.socket){
                result.push(Result.Fail(500, UNCONNECTED_ERR_MSG + deviceIp, deviceIp));
                continue
            }

            const res = await this.addUserToDevice(user, deviceSDK, device.name)

            result.push(res)
        }

        return result;
    }

    async getAttendances(deviceIp) {
        const deviceSDK = this.deviceSDKs.find((item) => item.ip === deviceIp);

        if (!deviceSDK) {
            return Result.Fail(500, UNEXPECTED_ERR_MSG + deviceIp, deviceIp);
        }

        if (!deviceSDK.connectionType) {
            return Result.Fail(500, UNCONNECTED_ERR_MSG + deviceIp, deviceIp);
        }

        try {
            const result = await deviceSDK.getAttendances((e) => { });

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
            return Result.Fail(500, UNCONNECTED_ERR_MSG + data.deviceIp);
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
            ws.send(
                getResponse({
                    type: "SyncData",
                    data: Result.Fail(500, UNCONNECTED_ERR_MSG + data.Ip),
                })
            );

            return;
        }
        try {
            const isDeleteAll = data.type == "All";
            // await deviceSDK.freeData()
            const atts = await deviceSDK.getAttendances();
            const users = (await getAllUsers(data.Ip)).rows;
            const getAttendanceData = () => {
                if (isDeleteAll) {
                    return atts.data;
                }

                const fromDate = dayjs(data.fromDate);
                const toDate = dayjs(data.toDate);
                return atts.data.filter((att) => {
                    const record_time = dayjs(att.record_time);
                    return (
                        record_time.isBefore(toDate) &&
                        record_time.isAfter(fromDate)
                    );
                });
            };

            const attendances = await syncAttendancesData(
                getAttendanceData(),
                users,
                isDeleteAll
            );

            const rowsData = attendances?.map((item) => [
                item.Id,
                item.DeviceId,
                item.DeviceName,
                item.UserId,
                item.UserName,
                item.Name,
                dayjs(item.VerifyDate).format(DATE_FORMAT),
                dayjs(item.VerifyDate).format(TIME_FORMAT)
            ]);

            const result = await handleSyncDataToSheet(
                rowsData,
                data.Id,
                isDeleteAll
            );

            ws.send(
                getResponse({
                    type: "SyncData",
                    data: result,
                })
            );
        } catch (err) {
            console.error(err);
            ws.send(
                getResponse({
                    type: "SyncData",
                    data: Result.Fail(500, err.message, data),
                })
            );
        }
    }

    async syncTime() {
        const devices = this.deviceSDKs.filter(
            (device) => device.connectionType
        );
        const result = []
        for (const device of devices) {
            try {
                 await device.setTime(new Date(new Date().getTime()  + 7 * 60 * 60 * 1000));
                result.push(Result.Success(device.ip))
            }
            catch (err) {
                result.push(Result.Fail(500, ``, device.ip))
            }
        }
        return result
    }

    async ping(wss, counter) {
        const devices = this.deviceSDKs.filter(
            (device) => device.connectionType && device.ztcp?.socket
        );

        for (const deviceSDK of devices) {
            try {
                await deviceSDK.getPIN();
                if (counter.value === 10) {
                    await deviceSDK.freeData();
                    counter.value = 0;
                } else {
                    counter.value++;
                }
                console.log('ping', counter)
            } catch (err) {
                await setConnectStatus(deviceSDK.ip, false);
                const query = (await getDeviceByIp(deviceSDK.ip))
                const deviceName = query.rowCount ? query.rows[0].Name : `Thiết bị : ${deviceSDK.ip}`
                sendMail({
                    subject: "Cảnh báo mất kết nối máy chấm công.",
                    device: {
                        Name: deviceName,
                        Ip: deviceSDK.ip,
                    },
                });

                wss.clients.forEach(function each(client) {
                    client.send(
                        getResponse({
                            type: "Ping",
                            data: `${deviceSDK.ip} đã bị mất kết nối. Vui lòng kiểm tra lại.`,
                        })
                    );
                });

                this.deviceSDKs = this.deviceSDKs.map((device) => {
                    if (device.ip === deviceSDK.ip) {
                        device.ztcp.socket = null;
                        device.connectionType = null
                    }

                    return device;
                });

                logger.error(`Device: ${deviceSDK.ip} lost connection at ${dayjs().format(DATE_FORMAT)}`);

                const sendErrorToSheet = async () => {
                    const sheets = await getSheets();
                    const sheetServices = await initSheets(
                        sheets.rows.map((item) => ({
                            SheetName: "THÔNG BÁO",
                            DocumentId: item.DocumentId,
                        })),
                        ["ID","IP", "Tên thiết bị", "Lỗi", "Ngày", "Giờ"]
                    );

                    await appendRow(sheetServices.filter(item => item.isSuccess).map(item => item.data), [
                        [da().unix(), deviceSDK.ip, deviceName, "Mất kết nối", dayjs().format(DATE_FORMAT), dayjs().format(TIME_FORMAT)],
                    ]);
                };

                await sendErrorToSheet()
            }
        }
    }


    async handlePullUserData(data){
        const initResult = await initSheet(data.DocumentId, data.SheetName, TEMPLATE_USER_HEADER_ROW)
        if(!initResult.isSuccess){
            return [initResult]
        }

        const sdk = this.deviceSDKs.find(item => item.ip === data.Device)

        if(!sdk || !sdk.connectionType || !sdk.ztcp?.socket){
            return Result.Fail(500, UNCONNECTED_ERR_MSG + sdk.Ip);
        }

        const sheet = initResult.data

        const rows = await sheet.getRows()
        const newUsers = rows.map(row => {
            const roleText = row.get(TEMPLATE_USER_HEADER_ROW[1])
            const role = UserRoles.indexOf(roleText) 
            return {
                userId: row.get(TEMPLATE_USER_HEADER_ROW[0]),
                role: role === -1 ? 0 : role,
                deviceIp: row.get(TEMPLATE_USER_HEADER_ROW[2]),
                name: row.get(TEMPLATE_USER_HEADER_ROW[3]),
                displayName: row.get(TEMPLATE_USER_HEADER_ROW[4]),
                password: row.get(TEMPLATE_USER_HEADER_ROW[5]),
            }
        })

        const result = []
        const users = (await sdk.getUsers()).data
        for(const user of newUsers){
            const addResult = await this.addUserToDevice(user, users ?? [], sdk)
            result.push(addResult)
        }

        return result
    }
}
