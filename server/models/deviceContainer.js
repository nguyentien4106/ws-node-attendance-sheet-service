// Declaration
import { logger } from "../config/logger.js";
import { disconnectAllDevices, setConnectStatus } from "../services/deviceService.js";
import { DeviceInformation, Result } from "./common.js";
import Zkteco from "zkteco-js"

export class DeviceContainer {
    constructor(devices = []) {
        this.deviceInfos = devices;
    }

    getDevices() {
        return this.deviceInfos;
    }

    async addDevice(device) {
        const existed = this.deviceInfos.some(item => item.ip === device.ip)
        if(existed){
            logger.error("Device with this IP is existed in the system.")
            return new Result(500, "Device with this IP is existed in the system.")
        }
        const deviceSDK = new Zkteco(device.Ip, device.Port, 5200, 5000);
        const deviceInfo = new DeviceInformation(device.ip, deviceSDK)
        this.deviceInfos.push(deviceInfo);
        return Result.Success()
    }

    async connectDevice(device){
        let success = false
        const deviceInfo = this.deviceInfos.filter(item => item.ip === device.Ip)
        if(deviceInfo.length){
            success = await deviceInfo.deviceSDK.createSocket()
            setConnectStatus(device.Id, success)
            return success ? Result.Success() : Result.Fail()
        }

        const newDeviceSDK = new Zkteco(device.Ip, device.Port, 5200, 5000);
        const newDeviceInfo = new DeviceInformation(device.ip, newDeviceSDK)
        newDeviceSDK.getUsers()
        this.deviceInfos.push(newDeviceInfo); 
        success = await newDeviceSDK.createSocket()
        setConnectStatus(device.Id, success)
        return success ? Result.Success() : Result.Fail()
    }

    removeDevice(deviceIp) {
        const device = this.deviceInfos.filter((item) => item.ip === deviceIp);
    }

    async getUsers(deviceIp){
        const deviceInfo = this.deviceInfos.filter(item => item.ip === device.Ip)
        if(!deviceInfo.length){
            return Result.Fail("Device was not connected")
        }

        const users = await deviceInfo.deviceSDK.getUsers()
        return users
    }

    async disconnectAll() {
        logger.info("Disconnect All Devices");
        const result = await disconnectAllDevices()
        console.log('disconnectAllDevices', result)
        for (let deviceInfo in this.deviceInfos) {
            console.log('disconnect', deviceInfo)
            await deviceInfo.deviceSDK.disconnect();
        }

        return true;
    }
}
