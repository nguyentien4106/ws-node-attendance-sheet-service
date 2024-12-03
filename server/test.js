import ZktecoJsCustom from 'nguyentien0620-zkteco-js'
import { UserRoles } from './constants/userRoles.js';
import { getAttendances } from './dbServices/attendanceService.js';

const manageZktecoDevice = async () => {
    const device = new ZktecoJsCustom("192.168.1.201", 4370, 2000, 5000);

    try {
        // Create socket connection to the device
        await device.createSocket();


        // Retrieve and log all attendance records
        const atte = await device.getAttendances();
        console.log(atte);
        // Listen for real-time logs

        // Manually disconnect after using real-time logs
        await device.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

// manageZktecoDevice();
getAttendances().then(res => {
    console.log(res.rows)
});

// console.log(Object.entries(UserRoles).find(item => item[1] === 'Khách')?.[0])
// const a= 0;
// console.log(UserRoles[a])