import dayjs from "dayjs";
import { insertAttendance } from "./services/attendanceService.js";

import Zkteco from "zkteco-js";


const manageZktecoDevice = async () => {
  const device = new Zkteco("192.168.1.201", 4370, 5200, 5000);

  try {
      // Create socket connection to the device
      await device.createSocket();

      // Retrieve and log all attendance records
      const atts = await device.getAttendances();
      console.log(atts)

      // Manually disconnect after using real-time logs
      await device.disconnect();
  } catch (error) {
      console.error("Error:", error);
  }
};

manageZktecoDevice();