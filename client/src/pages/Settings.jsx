import { Button, Input, message, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket';
import { RequestTypes } from '../constants/requestType';
import { useLoading } from '../context/LoadingContext';
const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://127.0.0.1:3000";

export default function Settings() {
    const [email, setEmail] = useState('')
    const { setLoading } = useLoading()

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
            console.log(response)

            if(response.type === RequestTypes.GetSettings){
                setEmail(response.data.Email)
            }

            if(response.type === RequestTypes.UpdateEmail){
                if(response.data.isSuccess){
                    message.success("Cập nhật thành công")
                }
                else {
                    message.error("Cập nhật thất bại. " + response.data.message)
                }
            }
        },
    });

    useEffect(() => {
        sendJsonMessage({
            type: RequestTypes.GetSettings
        })
    }, [])
    const updateEmail = () => {
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.UpdateEmail,
            data: email
        })
    }

    return (
        <div className='d-flex justify-content-start'>
            <Space style={{ width: "70%" }}>
                <label>Email nhận cảnh báo: </label>
                <Input width={500} type='email' value={email} onChange={val => setEmail(val.target.value)}></Input>
                <Button onClick={updateEmail}>Cập nhật</Button>
            </Space>
        </div>
    )
}
