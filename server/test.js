import { TEMPLATE_USER_HEADER_ROW, USER_HEADER_ROW } from "./constants/common.js";
import { getAttendances } from "./dbServices/attendanceService.js";
import { initSheet, syncDataFromSheet } from "./dbServices/dataService.js";
import { getDeviceByIp } from "./dbServices/deviceService.js";
import { getSheetsByDeviceIp } from "./dbServices/sheetService.js";
import { getLastUID } from "./dbServices/userService.js";
import Zkteco from "zkteco-js";
import ZktecoJsCustom from 'nguyentien0620-zkteco-js'
import ZKLib from "zklib-js";

const manageZktecoDevice = async () => {
    const device = new ZktecoJsCustom("192.168.1.100", 4370, 2000, 5000);

    try {
        // Create socket connection to the device
        await device.createSocket();

        // Retrieve and log all attendance records
        const fw = await device.clearAttendanceLog();
        console.log(fw);

        const user = await device.setUser(100, '11324', 'tien test 1', '1234', 0, 12345678)
        console.log( user)

        // Listen for real-time logs

        // Manually disconnect after using real-time logs
        await device.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

// manageZktecoDevice();

syncDataFromSheet({ DocumentId: '1Ns7Lrror50-O-P7nKsrdgLCp9cwm2X1af_HayYeqK8M', SheetName: 'DATA CHẤM CÔNG' })