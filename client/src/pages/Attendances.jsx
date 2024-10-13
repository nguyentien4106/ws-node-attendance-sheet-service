import React, { useEffect, useState } from "react";
import useWebSocket from "react-use-websocket";
import { useLoading } from "../context/LoadingContext";
import { RequestTypes } from "../constants/requestType";
import AttendancesTable from "../components/attendances/AttendancesTable";
const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://127.0.0.1:3000";


export default function Attendances() {
    const { sendJsonMessage } = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connection established.");
        },
        onClose: () => {
            console.log("on closed");
        },
        onMessage: (event) => {
            const response = JSON.parse(event.data);
            setLoading(false);
            if (response.type === RequestTypes.GetAttendances) {
                console.log(response.data);
                setAttendances(response.data);
            }
        },
    });

    useEffect(() => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.GetAttendances,
            data: "192.168.1.201",
        });
    }, []);

    const { setLoading } = useLoading();
    const [attendances, setAttendances] = useState([]);
    return (
        <div>

            <AttendancesTable
                attendances={attendances}
                sendJsonMessage={sendJsonMessage}
            ></AttendancesTable>
        </div>
    );
}
