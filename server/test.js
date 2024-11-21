import { TEMPLATE_USER_HEADER_ROW, USER_HEADER_ROW } from "./constants/common.js";
import { getAttendances } from "./dbServices/attendanceService.js";
import { initSheet } from "./dbServices/dataService.js";
import { getDeviceByIp } from "./dbServices/deviceService.js";
import { getSheetsByDeviceIp } from "./dbServices/sheetService.js";
import { getLastUID } from "./dbServices/userService.js";
import Zkteco from "zkteco-js";
import ZktecoJsCustom from 'zkteco-js-custom'

const manageZktecoDevice = async () => {
    const device = new ZktecoJsCustom("192.168.1.160", 4370, 2000, 5000);

    try {
        // Create socket connection to the device
        await device.createSocket();

        // Retrieve and log all attendance records
        const fw = await device.getFirmware();
        console.log(fw);

        // Listen for real-time logs

        const inf = await device.getInfo();
        console.log(inf);

        const pl = await device.getPlatform();
        console.log(pl);

        const ver = await device.getDeviceVersion();
        console.log(ver);

        // const ver = await device.get();
        // console.log(ver);

        await device.getRealTimeLogs((realTimeLog) => {
            console.log(realTimeLog);
        });

        // Manually disconnect after using real-time logs
        await device.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

manageZktecoDevice();
