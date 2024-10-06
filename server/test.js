import Zkteco from "zkteco-js";

const runMachine = async () => {
  let obj = new Zkteco("192.168.1.201", 4370, 5200, 5000);
  try {
    // Create socket to machine
    await obj.createSocket();

    // Get all logs in the machine
    const logs = await obj.getAttendances();
    console.log(logs);

    // Read real-time logs
    await obj.getRealTimeLogs((data) => {
      console.log(data);
    });

    // Disconnect from device
    await obj.disconnect(); // when you are using real-time logs, you need to disconnect manually
  } catch (e) {
    console.log(e);
  }
};

runMachine();