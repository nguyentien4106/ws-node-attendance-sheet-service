// Declaration
export class DeviceContainer {
    constructor(devices = []) {
        this.devices = devices;
    }

    getDevices(){
        return this.devices
    }

    addDevice(device) {
        this.devices.push(device)
    }

}