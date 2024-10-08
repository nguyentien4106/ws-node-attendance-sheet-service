// Declaration
import { logger } from "../config/logger.js";
import {
    deleteDevice,
    getAllDevices,
    insertNewDevice,
    setConnectStatus,
} from "../services/deviceService.js";
import { DeviceInformation, Result } from "./common.js";
import Zkteco from "zkteco-js";
import { appendRow, initSheet, initSheets, isSheetsValid } from "../services/dataService.js";
import { insertNewAtt } from "../services/attendanceService.js";
import { insertNewUsers } from "../services/userService.js";
import { handleRealTimeData } from "../helper/dataHelper.js";

const TIME_OUT = 2200;
const IN_PORT = 2000;

const UNCONNECTED_ERR_MSG = `Device chưa được kết nối. Vui lòng kết nối trước khi thực hiện hành động này.`
const UNEXPECTED_ERR_MSG = 'Đã xảy ra lỗi không mong muốn. Vui lòng reset thiết bị và thử lại hoặc liên hệ quản trị.'
export class DeviceContainer {
    constructor(devices = []) {
        this.deviceSDKs = devices;
        this.sheetServices = []
    }

    getDevices() {
        return this.deviceSDKs;
    }

    async initAll(){
        const res = await getAllDevices()
        for(const device of res.rows){
            const addSuccess = this.addDeviceToContainer(device)
            if(!addSuccess){
                return false
            }
        }

        return true
    }

    addDeviceToContainer(device){
        const existed = this.deviceSDKs.some(
            (item) => item.ip === device.Ip
        );

        if(!existed){
            const deviceSDK = new Zkteco(
                device.Ip,
                device.Port,
                TIME_OUT,
                IN_PORT
            );
            this.deviceSDKs.push(deviceSDK);
            logger.info(`Added successfully device ${device.Ip} into container`)
            return Result.Success(device)
        }

        logger.info(`Add failed device ${device.Ip} into container because of duplication`)
        return Result.Fail(500, "Device was existed in container", device)
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

            const sheetsValid = await isSheetsValid(device.Sheets)
            if(!sheetsValid.isSuccess){
                return sheetsValid
            }

            const success = await deviceSDK.createSocket()
            if(success){
                const users = await deviceSDK.getUsers()
                console.log('users', users)
                const result = await insertNewUsers(users.data, deviceSDK.ip)
                console.log(`${result.rowCount ? "Successfully": "Failed"} to add existing users into DB with count = ${result.rowCount}`)
                await deviceSDK.disconnect()
            }

            this.deviceSDKs.push(deviceSDK);
            const result = await insertNewDevice(device)
            return result.rowCount ? Result.Success(device) : Result.Fail(500, "Không thể thêm thiết bị vào hệ thống. Vui lòng reset và thử lại.", device)
        } catch (err) {
            logger.error(err.message);

            return Result.Fail(500, err.message, device);
        }
    }

    async connectDevice(device) {
        try{
            let success = false;
            const deviceSDK = this.deviceSDKs.find(
                (item) => item.ip === device.Ip
            );
            
            const connect = async () => {
                success = await deviceSDK.createSocket();
                await deviceSDK.getRealTimeLogs(async (realTimeLog) => {
                    const insertResult = await handleRealTimeData(realTimeLog, device.Id)
                    console.log('handle data result: ', insertResult)
                });
                setConnectStatus(device.Ip, success);
    
                return success ? Result.Success(device) : Result.Fail(500, "Cannot connect to device", device);
            }
            
            if (deviceSDK) {
                // success = await deviceSDK.createSocket();
                // await deviceSDK.getRealTimeLogs(async (realTimeLog) => {
                //     const insertResult = await handleRealTimeData(realTimeLog, device.Id)
                //     console.log('handle data result: ', insertResult)
                // });
                // setConnectStatus(device.Ip, success);
    
                // return success ? Result.Success(device) : Result.Fail(500, "Cannot connect to device", device);
                return await connect()
            }
    
            const newDeviceSDK = new Zkteco(device.Ip, device.Port, TIME_OUT, IN_PORT);
            this.deviceSDKs.push(newDeviceSDK);
            // success = await newDeviceSDK.createSocket();
            // setConnectStatus(device.Ip, success);

            // return success ? Result.Success(device) : Result.Fail(500, `Can not connect device ip: ${device.Ip}`, device);
            return await connect()
        }
        catch(err){
            console.error(err.message)
            return Result.Fail(500, err, device)
        }
    }

    async disconnectDevice(device) {
        try{
            setConnectStatus(device.Ip, false);

            const deviceSDK = this.deviceSDKs.find(
                (item) => item.ip === device.Ip
            );

            if (deviceSDK.connectionType) {
                await deviceSDK.disconnect();
                return Result.Success(device) 
            }
            
            return Result.Success(device);
        }
        catch(err){
            console.error(err.message)
            return Result.Fail(500, err, device)
        }
    }

    async removeDevice(device) {
        const deviceSDK = this.deviceSDKs.find(item => item.ip === device.Ip)

        if(!deviceSDK){
            logger.info("Didn't find any device with IP = " + device.Ip)
            return Result.Fail(500, "Didn't find any device with IP = " + device.Ip, device)
        }

        if(deviceSDK.isBusy){
            logger.info("Device is being busy, please try later this action!")
            return Result.Fail(500, "Device is being busy, please try later this action!", device)
        }

        const action = async () => {
            const indexSDK = this.deviceSDKs.indexOf(deviceSDK)
            if(indexSDK > -1){
                this.deviceSDKs.splice(indexSDK, 1)
            }
            const dbSuccess = await deleteDevice(device)

            return dbSuccess.rowCount ? Result.Success(device) : Result.Fail(500, "Fail to remove", device)
        }
        // is not being connected
        if(!deviceSDK.connectionType){
            return await action()
        }

        // is being connected
        const result = await deviceSDK.disconnect()
        if(result){
            logger.info("Disconnect successfully!")
            return await action()
        }

        return Result.Fail(500, "Some errors occur", device)
    }

    async getUsers(deviceIp) {
        const deviceSDK = this.deviceSDKs.find(
            (item) => item.ip === deviceIp
        );

        if(!deviceSDK){
            logger.info(`Some errors occur. Please reset and try again`)
            return Result.Fail(500, UNEXPECTED_ERR_MSG)
        }

        if(!deviceSDK.connectionType){
            logger.info(`Device with IP = ${deviceIp} was not connected`)
            return Result.Fail(500, UNCONNECTED_ERR_MSG)
        }

        const users = await deviceSDK.getUsers();

        return Result.Success(users);
    }

    async disconnectAll() {
        console.log("Disconnect All Devices");
        for (let deviceSDK of this.deviceSDKs) {
            console.log('disconnect ' + deviceSDK.ip)

            if(!deviceSDK.connectionType){
                continue
            }

            const result = await deviceSDK.disconnect();
            if(result){
                console.log(`Disconnect device = ${deviceSDK.ip} successfully!`)
                await setConnectStatus(deviceSDK.ip, false)
            }
            else {
                console.error(`Disconnect device = ${deviceSDK.ip} failed!`)
            }
        }

        return true;
    }

    async addUser(user){
        const result = []
        for(const deviceIp of user.devices){
            const deviceSDK = this.deviceSDKs.find(item => item.ip === deviceIp);

            if(!deviceSDK){
                return Result.Fail(500, UNEXPECTED_ERR_MSG, user)
            }
    
            if(!deviceSDK.connectionType){
                return Result.Fail(500, UNCONNECTED_ERR_MSG, user)
            }
    
            try{
                const users = await deviceSDK.getUser()
                const lastUid = users.map(item => item.uid).max()
                const addDBResult = await insertNewUsers([Object.assign(user, { cardno: 0, uid: lastUid + 1 })], deviceSDK.ip, user.displayName)
                const res = await deviceSDK.setUser(lastUid + 1, user.userId, user.name, user.password, user.role)
                
                return result.push({ addDBResult: addDBResult.rowCount, res })
            }
            catch(err){
                console.log(err)
                return Result.Fail(500, err, user)
            }
        }

        return Result.Success(result)
    }

    async getAttendances(deviceIp){
        const deviceSDK = this.deviceSDKs.find(item => item.ip === deviceIp);

        if(!deviceSDK){
            return Result.Fail(500, "Some errors occur that make service is not existed in system. Please reset and try again.", deviceIp)
        }

        if(!deviceSDK.connectionType){
            return Result.Fail(500, UNCONNECTED_ERR_MSG,deviceIp)
        }

        try{
            console.log('getAttendances', deviceSDK)
            const result = await deviceSDK.getAttendances(e => {
                console.log("e", e)
            })
            console.log(result)

            return Result.Success(result)
        }
        catch(err){
            console.log(err)
            return Result.Fail(500, err, deviceIp)
        }
    }

    async deleteUser(data){
        const deviceSDK = this.deviceSDKs.find(
            (item) => item.ip === data.deviceIp
        );

        if(!deviceSDK || !deviceSDK.connectionType){
            logger.info(`Device with IP = ${deviceIp} was not connected`)
            return Result.Fail(500, `Device with IP = ${deviceIp} was not connected`)
        }
        // let a  = new Zkteco()
        // a.deleteUser()
        try{
            const result = await deviceSDK.deleteUser(data.uid)
            console.log(result)
            console.log(typeof result)
            

            return Result.Success(data)
        }
        catch(err){
            console.error(err)
            return Result.Fail(500, err.message, data)
        }
    }
}
