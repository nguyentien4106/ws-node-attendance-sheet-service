import React, { useEffect, useState } from "react";
import DevicesTable from "../components/devices/DevicesTable";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";

const WS_URL = "ws://127.0.0.1:3000";
export default function Devices() {
    const [devices, setDevices] = useState([])
    const { sendJsonMessage, readyState } = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connection established.");
        },
        onClose: () => {
            console.log("on closed");
        },
        onMessage: (event) => {
            const json = JSON.parse(event.data)
            if(json.type === RequestTypes.GetDevices){
                console.log('set device', json.response)
                setDevices(json.response)
            }
        },
    });


    useEffect(() => {
        sendJsonMessage({
            type: RequestTypes.GetDevices
        })
    }, [])

    useEffect(() => {
    }, [devices])
    return (
        <div>
            <DevicesTable source={devices} sendJsonMessage={sendJsonMessage}/>
        </div>
    );
}
