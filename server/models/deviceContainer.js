// Declaration
import { logger } from "../config/logger.js";
import { DeviceInformation, Result } from "./common.js";
import Zkteco from "zkteco-js"

export class DeviceContainer {
    constructor(devices = []) {
        this.devices = devices;
    }

    getDevices() {
        return this.devices;
    }

    async addDevice(device) {
        const existed = this.devices.some(item => item.ip === device.ip)
        if(existed){
            logger.error("Device with this IP is existed in the system.")
            return new Result(500, "Device with this IP is existed in the system.")
        }
        const deviceSDK = new Zkteco(device.ip, device.port, 5200, 5000);
        
        this.devices.push(new DeviceInformation(device.ip, deviceSDK));
        return Result.Success()
    }

    removeDevice(deviceIp) {
        const device = this.devices.filter((item) => item.ip === deviceIp);
    }

    async disconnectAll() {
        logger.info("Disconnect All Devices");
        for (let device in this.devices) {
            await device.disconnect();
        }

        return true;
    }
}
