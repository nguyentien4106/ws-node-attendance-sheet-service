import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "./constants/requestType";
import "dotenv/config"

function App() {
    const { sendJsonMessage, readyState } = useWebSocket(process.env.WS_URL, {
        onOpen: () => {
            console.log("WebSocket connection established.");
        },
        onClose: () => {
            console.log("on closed")
        },
        onMessage: (event) => {
            console.log(JSON.parse(event.data))
        }
    });

    console.log(readyState)

    const getDevices = () => {
        sendJsonMessage({
            type: RequestTypes.GetDevices
        })
    }

    useEffect(() => {
        getDevices()
    }, []) 
    
    return (
        <>
            <div>
                <a href="https://react.dev" target="_blank">
                    <img
                        src={reactLogo}
                        className="logo react"
                        alt="React logo"
                    />
                </a>
            </div>
            <button onClick={getDevices}>Get Devices</button>
        </>
    );
}

export default App;
