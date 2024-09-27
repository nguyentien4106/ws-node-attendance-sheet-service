// const { ActionTypes } = require("../models/actionTypes");
// const { DeviceContainer } = require("../models/deviceContainer");
import { ActionTypes } from "../models/actionTypes.js"
import { DeviceContainer } from "../models/deviceContainer.js"
import * as DeviceService from './deviceService.js'

const container = new DeviceContainer()

const addDevice = (device ) => {
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
    const json = JSON.parse(message);

    console.log("Received message:", json);

    // You can implement logic based on the message content

    if (json.type === "greeting") {
        ws.send(JSON.stringify({ response: "Hello, client!" }));
    }

    if(json.type === "get1"){
        DeviceService.getAllDevices().then(res => {
            const { rows } = res
            ws.send(JSON.stringify({ response: rows }));
        })

    }

    if(json.type === "get"){
        ws.send(JSON.stringify({ response: container.getDevices() }));
    }

    switch (json.type) {
        case ActionTypes.AddDevice:
            addDevice(json.data)
            break;

        case ActionTypes.RemoveDevice:
            removeDevice(json.data)
            break;

        case ActionTypes.UpdateDevice:
            break;

        case ActionTypes.ConnectDevice:
            break;
    }
};
