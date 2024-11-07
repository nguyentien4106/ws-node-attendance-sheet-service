import dayjs from "dayjs";
import { insertAttendance } from "./services/attendanceService.js";

import Zkteco from "zkteco-js";
import { getSheets } from "./services/sheetService.js";

// const device = new Zkteco(
//     '192.168.1.201',
//     4370,
//     5000,
//     5000
// );

// const success = await device.createSocket();
//             if (success) {
//                 const attendances = await device.getAttendances();
//                 console.log(attendances)

//                 await device.disconnect()
//             }
// console.log(dayjs('Sat Oct 12 2024 16:50:36 GMT+0700 (Indochina Time)').isBefore(dayjs('2024-11-05 4:34:47 PM')))
// console.log(dayjs('Sat Oct 12 2024 16:50:36 GMT+0700 (Indochina Time)').isAfter(dayjs('2024-10-12 4:50:35 PM')))

getSheets().then(res => {
    console.log(res.rows)
})
            /*{
  data: [
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sat Oct 12 2024 16:50:35 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sat Oct 12 2024 16:50:36 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sat Oct 12 2024 16:53:34 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sat Oct 12 2024 17:25:15 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sat Oct 12 2024 18:09:37 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sun Oct 13 2024 20:00:17 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sun Oct 13 2024 20:07:40 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sun Oct 13 2024 20:10:36 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 2,
      user_id: '1',
      record_time: 'Sun Oct 13 2024 20:12:01 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sun Oct 13 2024 20:12:07 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sun Oct 13 2024 20:12:08 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Mon Oct 14 2024 00:05:47 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Tue Oct 15 2024 00:25:55 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Tue Oct 15 2024 00:32:28 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sun Oct 27 2024 17:22:24 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sun Oct 27 2024 17:22:26 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sun Oct 27 2024 17:29:14 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sun Oct 27 2024 17:30:33 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sun Oct 27 2024 17:30:34 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sun Oct 27 2024 17:33:32 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sat Jan 01 2000 00:03:27 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sat Jan 01 2000 00:03:55 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sat Jan 01 2000 00:06:40 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    },
    {
      sn: 4,
      user_id: '123456',
      record_time: 'Sat Jan 01 2000 00:10:20 GMT+0700 (Indochina Time)',
      type: 0,
      state: 0,
      ip: '192.168.1.201'
    }
  ]
}
PS C:\Users\NguyenTien\Desktop\ws-node-attendance-sheet-service\server>  */