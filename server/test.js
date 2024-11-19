import { TEMPLATE_USER_HEADER_ROW, USER_HEADER_ROW } from "./constants/common.js";
import { getAttendances } from "./dbServices/attendanceService.js";
import { initSheet } from "./dbServices/dataService.js";
import { getDeviceByIp } from "./dbServices/deviceService.js";
import { getSheetsByDeviceIp } from "./dbServices/sheetService.js";
import { getLastUID } from "./dbServices/userService.js";
import Zkteco from "zkteco-js";

// const query = await getLastUID()
// console.log(query)
// const sheet = (await initSheet('11PzLthgKxIg6a70ZRQkFAWSxG5qEP_e4HIULGKNzhJM', 'users', TEMPLATE_USER_HEADER_ROW)).data

// const rows = await sheet.getRows({
//     offset: 0
// })

// const users = rows.map(row => ({
//     userId: row.get(TEMPLATE_USER_HEADER_ROW[0]),
//     role: row.get(TEMPLATE_USER_HEADER_ROW[1]),
//     deviceIp: row.get(TEMPLATE_USER_HEADER_ROW[2]),
//     name: row.get(TEMPLATE_USER_HEADER_ROW[3]),
//     displayName: row.get(TEMPLATE_USER_HEADER_ROW[4]),
//     password: row.get(TEMPLATE_USER_HEADER_ROW[5]),
// }))
// console.log(users)
const manageZktecoDevice = async () => {
    const device = new Zkteco("192.168.1.160", 4370, 5200, 5000);

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

// manageZktecoDevice();

getAttendances().then(res => {
    console.log(res.rows)
})