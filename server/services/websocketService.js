// const { ActionTypes } = require("../models/actionTypes");
// const { DeviceContainer } = require("../models/deviceContainer");
import { json } from "express"
import { RequestTypes } from "../constants/requestType.js"
import { ActionTypes } from "../models/actionTypes.js"
import { DeviceContainer } from "../models/deviceContainer.js"
import { getResponse } from "../models/response.js"
import * as DeviceService from './deviceService.js'
import Zkteco from "zkteco-js"
const container2 = new DeviceContainer()

const addDevice = (device, container) => {
    const dev = new Zkteco(device.Ip, device.Port, 5200, 5000)
    console.log('addDevice', device)
    container.addDevice({
        ip: device.Ip,
        device: dev
    })
}

const removeDevice = (device, container) => {
    console.log('removeDevice', device)
    container.remove
}

const updateDevice = (device) => {
    console.log('removeDevice', device)
}

const connectDevice = (device, container) => {
    console.log('connect', device)

    const existed = container.some(item => item.ip === device.Ip)
    if(existed){
        container.connect
    }
}


export const handleMessage = (ws, message, deviceContainer) => {
    const request = JSON.parse(message);

    console.log("Received message:", request);

    // You can implement logic based on the message content

    if (request.type === "greeting") {
        ws.send(request.stringify({ response: "Hello, client!" }));
    }

    if(request.type === RequestTypes.GetDevices){
        DeviceService.getAllDevices().then(res => {
            const { rows } = res
            // ws.send(JSON.stringify({ response: rows }));
            ws.send(getResponse({
                type: request.type,
                response: rows
            }))
        })

    }

    switch (request.type) {
        case ActionTypes.AddDevice:
            addDevice(request.data, deviceContainer)
            break;

        case ActionTypes.RemoveDevice:
            removeDevice(request.data)
            break;

        case ActionTypes.UpdateDevice:
            break;

        case ActionTypes.ConnectDevice:
            connectDevice(request.data, deviceContainer)
            break;
    }
};
