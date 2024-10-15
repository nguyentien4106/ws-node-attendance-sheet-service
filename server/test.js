// const Zkteco = require("zkteco-js");
import Zkteco from 'zkteco-js'
const manageZktecoDevice = async () => {
    const device = new Zkteco("192.168.1.201", 4370, 5200, 5000);

    try {
        // Create socket connection to the device
        await device.createSocket();
        // //console.log("clear data")

        const atts = await device.getAttendances()
        //console.log('atts', atts)
        const users = await device.getUsers()
        //console.log('atts', users)

        await device.disconnect();
    } catch (error) {
        console.error("Error:", error);
        await device.disconnect();
    }
};

manageZktecoDevice();
