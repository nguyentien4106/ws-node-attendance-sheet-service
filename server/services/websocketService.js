// const { RequestTypes } = require("../models/RequestTypes");
// const { DeviceContainer } = require("../models/deviceContainer");
import { RequestTypes } from "../models/requestTypes.js"
import { DeviceContainer } from "../models/deviceContainer.js"
import { getResponse } from "../models/response.js"
import * as DeviceService from './deviceService.js'
import { logger } from "../config/logger.js"


const c = new DeviceContainer()
// c.addDevice()
// c.removeDevice()
const addDevice = (device, container) => {
    return container.addDevice(device)
}

const removeDevice = (device, container) => {
    console.log('removeDevice', device)
    return container.removeDevice(device)
}

const connectDevice = (device, container) => {
    console.log('connect', device)

    return container.connectDevice(device)
}


export const handleMessage = (ws, message, deviceContainer) => {
    const request = JSON.parse(message);
    console.log("Received message:", request);

    switch (request.type) {
        case RequestTypes.AddDevice:
            addDevice(request.data, deviceContainer).then(res => {
                ws.send(getResponse({
                    type: request.type,
                    data: res
                }))
            })
            break;

        case RequestTypes.RemoveDevice:
            removeDevice(request.data, deviceContainer).then(res => {
                ws.send(getResponse({
                    type: request.type,
                    data: res
                }))
            })
            break;

        case RequestTypes.UpdateDevice:
            break;

        case RequestTypes.ConnectDevice:
            connectDevice(request.data, deviceContainer).then(res => {
                console.log('RequestTypes.ConnectDevice ', res)
                ws.send(getResponse({
                    type: request.type,
                    data: res
                }))
            }).catch(err => {
                
            })
            break;

        case RequestTypes.GetUsers:
            deviceContainer.getUsers(request.data).then(users => {
                ws.send(getResponse({
                    type: request.type,
                    data: users
                }))
            })
            break;

        case RequestTypes.GetDevices:
            DeviceService.getAllDevices().then(res => {
                const { rows } = res
                ws.send(getResponse({
                    type: request.type,
                    data: rows
                }))
            })
            break;
    }
};
