// const ZKHLIB = require("zkh-lib");
import ZKHLIB from "zkh-lib";
const runMachine = async (ip) => {
  let obj = new ZKHLIB(ip, 4370, 5200, 5000);
  try {
    // Create socket to machine
    await obj.createSocket();

    // Get all logs in the machine

    // Read real-time logs
    await obj.getRealTimeLogs((data) => {
      console.log(data);
    });

    // Disconnect from device
  } catch (e) {
    console.log(e);
  }
};

runMachine('192.168.1.201');
runMachine('192.168.1.235');