import { Button, Input, message, Space } from 'antd'
import React, { useEffect, useState } from 'react'
import useWebSocket from 'react-use-websocket';
import { RequestTypes } from '../constants/requestType';
import { useLoading } from '../context/LoadingContext';
import { getHostUrl, getServerIp, setServerIp } from '../helper/common';
const WS_URL = getHostUrl();

export default function Settings() {
    const [email, setEmail] = useState('')
    const { setLoading } = useLoading()
    const [ip, setIp] = useState(getServerIp())
    const { sendJsonMessage } = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connection established.");
        },
        onClose: () => {
            console.log("on closed");
        },
        onError: (err) => {
            console.log(err)
            message.error('Kết nối tới máy chủ không thành công. Vui lòng kiểm tra lại IP máy chủ: Cài đặt -> IP máy chủ. ')
        },
        onMessage: (event) => {
            const response = JSON.parse(event.data);
            setLoading(false);

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

            if(response.type === RequestTypes.SyncTime){
                console.log(response.data)
                const successes = response.data.data.filter(item => item.isSuccess)
                const failed = response.data.data.filter(item => !item.isSuccess)
                if(successes.length){
                    message.success(`Cập nhật thành công thiết bị: ${successes.map(item => item.data).join(", ")}`)
                }
                if(failed.length) {
                    message.error("Cập nhật thất bại thiết bị: " + failed.map(item => item.data).join(", "))
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

    const syncTime = () => {
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.SyncTime
        })
    }
    return (
        <div className='d-flex justify-content-start flex-column'>
            <Space style={{ width: "70%" }}>
                <label>Email nhận cảnh báo: </label>
                <Input width={500} type='email' value={email} onChange={val => setEmail(val.target.value)}></Input>
                <Button onClick={updateEmail}>Cập nhật</Button>
            </Space>
            <Space style={{ width: "70%", marginTop: 20}}>
                <label>IP máy chủ: </label>
                <Input width={500} type='email' value={ip} onChange={val => setIp(val.target.value)}></Input>
                <Button onClick={() => {
                    setServerIp(ip)
                    message.success("Cài đặt IP máy chủ thành công.")
                }}>Cập nhật</Button>
            </Space>
            <Space style={{ width: "70%", marginTop: 20}}>
                <label>Thời gian trên máy: </label>
                <Button onClick={() => {
                    syncTime()
                }}>Đồng bộ thời gian</Button>
            </Space>
            
        </div>
    )
}
