// const { ActionTypes } = require("../models/actionTypes");
// const { DeviceContainer } = require("../models/deviceContainer");
import { RequestTypes } from "../constants/requestType.js"
import { ActionTypes } from "../models/actionTypes.js"
import { DeviceContainer } from "../models/deviceContainer.js"
import { getResponse } from "../models/response.js"
import * as DeviceService from './deviceService.js'

// const container = new DeviceContainer()

const addDevice = (device, container) => {
    console.log('addDevice', device)
    container.addDevice(device)
}

const removeDevice = (device ) => {
    console.log('removeDevice', device)
}

const updateDevice = (device ) => {
    console.log('removeDevice', device)
}

const connectDevice = (device ) => {
    console.log('removeDevice', device)
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

    // if(request.type === RequestTypes.GetDevices){
    //     ws.send(JSON.stringify({ type: request.type, data:  }));
    // }

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
            break;
    }
};
