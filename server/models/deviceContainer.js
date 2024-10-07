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
import { initSheet, isSheetsValid } from "../services/sheetService.js";
import { insertNewAtt } from "../services/attendanceService.js";

const TIME_OUT = 2200;
const IN_PORT = 2000;

export class DeviceContainer {
    constructor(devices = []) {
        this.deviceSDKs = devices;
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
        console.log('Add device', device)
        try {
            const existed = this.deviceSDKs.some(
                (item) => item.ip === device.Ip
            );
            if (existed) {
                logger.error("Device with this IP is existed in the system.");
                return new Result(
                    500,
                    "Device with this IP is existed in the system.",
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

            this.deviceSDKs.push(deviceSDK);
            const result = await insertNewDevice(device)
            return result.rowCount ? Result.Success(device) : Result.Fail(500, "Failed to insert to database", device)
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
            
            if (deviceSDK) {
                success = await deviceSDK.createSocket();
            
                await deviceSDK.getRealTimeLogs(async (realTimeLog) => {
                    console.log(realTimeLog);
                    const row = await insertNewAtt([realTimeLog.userId, device.Id, new Date(`${realTimeLog.attTime}`)])

                    console.log('insert to db', row)
                });
                setConnectStatus(device.Ip, success);
    
                return success ? Result.Success(device) : Result.Fail(500, "Cannot connect to device", device);
            }
    
            const newDeviceSDK = new Zkteco(device.Ip, device.Port, TIME_OUT, IN_PORT);
            this.deviceSDKs.push(newDeviceSDK);
            success = await newDeviceSDK.createSocket();
            setConnectStatus(device.Ip, success);

            return success ? Result.Success(device) : Result.Fail(500, `Can not connect device ip: ${device.Ip}`, device);
        }
        catch(err){
            console.error(err.message)
            return Result.Fail(500, err, device)
        }
    }

    async disconnectDevice(device) {
        try{
            setConnectStatus(device.Ip, false);

            let success = false;
            const deviceSDK = this.deviceSDKs.find(
                (item) => item.ip === device.Ip
            );

            if (deviceSDK.connectionType) {
                success = await deviceSDK.disconnect();
                return success ? Result.Success(device) : Result.Fail(500, "Cannot conenct to device", device);
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
            console.log('cation delete')
            const indexSDK = this.deviceSDKs.indexOf(deviceSDK)
            if(indexSDK > -1){
                this.deviceSDKs.splice(indexSDK, 1)
            }
            console.log('deviceSDKs', this.deviceSDKs)

            const dbSuccess = await deleteDevice(device)

            console.log('db', dbSuccess)
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
            return Result.Fail(500, `Some errors occur. Please reset and try again`)
        }

        if(!deviceSDK.connectionType){
            logger.info(`Device with IP = ${deviceIp} was not connected`)
            return Result.Fail(500, `Device with IP = ${deviceIp} was not connected`)
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
                return Result.Fail(500, "Some errors occur that make service is not existed in system. Please reset and try again.", user)
            }
    
            if(!deviceSDK.connectionType){
                return Result.Fail(500, "Device was not connected! Please connect the device first.", user)
            }
    
            try{
                const res = await deviceSDK.setUser(user.uid, user.userId, user.name, user.password, user.role)
                console.log('add user', res)
                
                return result.push(res)
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
            return Result.Fail(500, "Device was not connected! Please connect the device first.",deviceIp)
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
