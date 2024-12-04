import ZktecoJsCustom from 'nguyentien0620-zkteco-js'
import { UserRoles } from './constants/userRoles.js';
import { getAttendances } from './dbServices/attendanceService.js';
import { handleRealTimeData } from './helper/dataHelper.js';
import dayjs from 'dayjs';
import { DATABASE_DATE_FORMAT, DATE_FORMAT, TIME_FORMAT } from './constants/common.js';
import { getAllUsers } from './dbServices/userService.js';

const manageZktecoDevice = async () => {
    const device = new ZktecoJsCustom("192.168.1.100", 4370, 2000, 5000);

    try {
        // Create socket connection to the device
        await device.createSocket();

        // Retrieve and log all attendance records
        const atte = await device.clearData();
        console.log(atte);
        // Listen for real-time logs

        // Manually disconnect after using real-time logs
        await device.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

manageZktecoDevice()
// const sleep = ms => new Promise(r => setTimeout(r, ms));

// const a = async () => {
//     for(let i = 0 ; i < 50; i++){
//         const reuslt = await handleRealTimeData({ userId: [121, 1234571, 4, 123457][i % 4], attTime: dayjs().format(DATABASE_DATE_FORMAT + " " + TIME_FORMAT)}, 37)
//         console.log('done', reuslt)
//         sleep(3000)
//     }
// }

// a();