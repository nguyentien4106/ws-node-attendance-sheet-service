export const addDevice = (device, container) => {
    return container.addDevice(device);
};

export const removeDevice = (device, container) => {
    return container.removeDevice(device);
};


export const connectDevice = (device, container) => {
    return container.connectDevice(device);
};

export const disconnectDevice = (device, container) => {
    return container.disconnectDevice(device);
};