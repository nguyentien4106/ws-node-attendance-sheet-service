import { insertAttendance } from "./services/attendanceService.js";

insertAttendance({ userId: '123456' }, 2).then(console.log)