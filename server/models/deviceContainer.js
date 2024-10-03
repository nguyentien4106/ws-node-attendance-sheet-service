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

const TIME_OUT = 5200;
const IN_PORT = 5000;

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

                const users = await deviceSDK.getUsers()
                console.log('users', users)
                await deviceSDK.getRealTimeLogs((realTimeLog) => {
                    console.log(realTimeLog);
                });
                setConnectStatus(device.Ip, success);
    
                return success ? Result.Success(device) : Result.Fail(500, "Cannot conenct to device", device);
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

            if (deviceSDK) {
                success = await deviceSDK.disconnect();
                return success ? Result.Success(device) : Result.Fail(500, "Cannot conenct to device", device);
            }
            return Result.Fail(500, `Can not find device ip: ${device.Ip}`, device);
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
            return dbSuccess ? Result.Success(device) : Result.Fail(500, "Fail to remove", device)
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
            logger.info(`Device with IP = ${deviceIp} was not connected`)
            return Result.Fail(500, `Device with IP = ${deviceIp} was not connected`)
        }

        const users = await deviceSDK.getUsers();

        return Result.Success(users);
    }

    async disconnectAll() {
        logger.info("Disconnect All Devices");
        for (let deviceSDK in this.deviceSDKs) {
            const result = await deviceSDK.disconnect();
            if(result){
                logger.info(`Disconnect device = ${deviceSDK.ip} successfully!`)
                await setConnectStatus(deviceSDK.ip, false)
            }
            else {
                logger.error(`Disconnect device = ${deviceSDK.ip} failed!`)
            }
        }

        return true;
    }
}
