import ZktecoJsCustom from 'nguyentien0620-zkteco-js-test'
import { getRole, UserRoles } from './constants/userRoles.js';
import { getAttendances } from './dbServices/attendanceService.js';
import { handleRealTimeData } from './helper/dataHelper.js';
import dayjs from 'dayjs';
import { DATABASE_DATE_FORMAT, DATE_FORMAT, TIME_FORMAT, USER_HEADER_ROW } from './constants/common.js';
import { getAllUsers } from './dbServices/userService.js';
import { appendRow, initSheets } from './dbServices/dataService.js';
import os from 'os'
import { getCPUUsage, getRAMUsage } from './helper/system.js';
const manageZktecoDevice = async () => {
    const device = new ZktecoJsCustom("192.168.1.100", 4370, 2000, 5000);

    try {
        // Create socket connection to the device
        await device.createSocket();
        const uid = 18;
        const a = await device.setUser(uid, `${uid}`, `Tien ${uid}`, `${uid}`, 0, `${uid}`)
        // Retrieve and log all attendance records
        const atte = await device.getUsers();
        console.log(atte.data)

        await device.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

manageZktecoDevice()
const a = async() => {
    const a1 = [
        [
            {
                "Id": 657,
                "Name": "Tien 15",
                "Password": "15",
                "Role": 0,
                "CardNo": "15",
                "DisplayName": "Tien 15",
                "DeviceIp": "192.168.1.100",
                "UID": 15,
                "UserId": "15",
                "EmployeeCode": ""
            }
        ],
        [
            {
                "Id": 657,
                "Name": "Tien 15",
                "Password": "15",
                "Role": 0,
                "CardNo": "15",
                "DisplayName": "Tien 15",
                "DeviceIp": "192.168.1.100",
                "UID": 15,
                "UserId": "15",
                "EmployeeCode": ""
            }
        ]
    ]

    const rs = a1.flat()
    console.log(rs)
}
// a()

const getUsage = async () => {
    const cpus = os.cpus();
    console.log('CPU Information:');
    cpus.forEach((cpu, index) => {
        console.log(`Core ${index + 1}:`);
        console.log(`  Model: ${cpu.model}`);
        console.log(`  Speed: ${cpu.speed} MHz`);
        console.log(`  Times:`, cpu.times);
    });
}

const b = async () => {

    const a = [ 1, 2, 3, 4, 5]
    const a1 = [ 1, 2, 3, 6]
    const rs = a.filter(i => !a1.includes(i))
    console.log(rs)
}

// b()

// getStorageUsage().then(res => console.log(res))
// const sleep = ms => new Promise(r => setTimeout(r, ms));

// const a = async () => {
//     for(let i = 0 ; i < 50; i++){
//         const reuslt = await handleRealTimeData({ userId: [121, 1234571, 4, 123457][i % 4], attTime: dayjs().format(DATABASE_DATE_FORMAT + " " + TIME_FORMAT)}, 37)
//         console.log('done', reuslt)
//         sleep(3000)
//     }
// }

// a();