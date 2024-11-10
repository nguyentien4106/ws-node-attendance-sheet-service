import dayjs from "dayjs";
import { insertAttendance } from "./services/attendanceService.js";

import Zkteco from "zkteco-js";
import { getSheets } from "./services/sheetService.js";
import { appendRow, initSheets, syncDataFromSheet } from "./services/dataService.js";
import { DATE_FORMAT } from "./constants/common.js";

const manageZktecoDevice = async () => {
  const device = new Zkteco("192.168.1.201", 4370, 5200, 5000);

  try {
      // Create socket connection to the device
      await device.createSocket();

      // Retrieve and log all attendance records
      const time = await device.clearAttendanceLog();
      console.log(time)
      await device.setTime(new Date())
      const time1 = await device.getTime();
      console.log(time1)

      // Manually disconnect after using real-time logs
      await device.disconnect();
  } catch (error) {
      console.error("Error:", error);
  }
};

manageZktecoDevice();