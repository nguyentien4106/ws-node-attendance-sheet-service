import Zkteco from 'zkteco-js'
const manageZktecoDevice = async () => {
    const device = new Zkteco("192.168.1.201", 4370, 5200, 5000);

    try {
        // Create socket connection to the device
        await device.createSocket();

        // Retrieve and log all attendance records

        const users = await device.getAttendances()
        console.log(users.data)
        // console.log(users.data.map(item => [item.uid, item.name, item.password, item.role, item.cardno, item.name, item.userId, "192.168.1.201"]))
        // Manually disconnect after using real-time logs
        await device.disconnect();
    } catch (error) {
        console.error("Error:", error);
    }
};

manageZktecoDevice();