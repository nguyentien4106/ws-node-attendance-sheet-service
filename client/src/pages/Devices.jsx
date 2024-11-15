import React, { useEffect, useRef, useState } from "react";
import DevicesTable from "../components/devices/DevicesTable";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import {
    Button,
    Card,
    Form,
    Input,
    message,
    Modal,
    Space,
    Typography,
} from "antd";
import { useLoading } from "../context/LoadingContext";
import { CloseOutlined } from "@ant-design/icons";
import { notification } from "antd";
import DeviceForm from "../components/devices/DeviceForm";
import { getHostUrl } from "../helper/common";
import Auth from "../layout/Auth";

const WS_URL = getHostUrl();

export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [open, setOpen] = useState(false);
    const { setLoading } = useLoading();
    const submitRef = useRef();

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
            setLoading(false)
            if (response.type === RequestTypes.GetDevices) {
                setDevices(response.data);
            }

            if (response.type === RequestTypes.ConnectDevice) {
                const data = response.data;
                if(data.code === 200){
                    setDevices(prev => prev.map(item => item.Id === data.data.Id ? Object.assign(item, { IsConnected: true }) : item))
                    message.success("Kết nối thiết bị thành công.")
                }
                else {
                    const { syscall, code } = data.message.err.err
                    message.error(`${syscall} ${code}! Vui lòng thử lại`)
                }
            }

            if (response.type === RequestTypes.DisconnectDevice) {
                const data = response.data;
                if(data.code === 200){
                    setDevices(prev => prev.map(item => item.Id === data.data.Id ? Object.assign(item, { IsConnected: false }) : item))
                    message.success("Ngắt kết nối thiết bị thành công.")
                }
                else {
                    const { syscall, code } = data.message.err.err
                    message.error(`${syscall} ${code}! Đã có lỗi xảy ra vui lòng thử lại hoặc liên hệ quản trị để xử lý.`)
                }
            }

            if(response.type === RequestTypes.AddDevice){
                const data = response.data;
                if(data.isSuccess){
                    location.reload()
                    setDevices(prev => [...prev, data.data])
                    message.success("Thêm thiết bị thành công.")
                }
                else {
                    message.error(data.message)

                }
            }

            if(response.type === RequestTypes.RemoveDevice){
                const data = response.data;
                if(data.code === 200){
                    setDevices(prev => prev.filter(item => item.Id !== data.data.Id ))
                    message.success("Gỡ thiết bị thành công.")
                }
                else {
                    message.error(data.message)
                }
            }

            if(response.type === RequestTypes.SyncData){
                const data = response.data;
                if(data.isSuccess){
                    message.success("Đồng bộ dữ liệu thành công")
                }
                else {
                    message.error(data.message)
                }
            }

            if(response.type === "GetDevicesSheets"){
                setDevices(response.data.data);

            }

            if(response.type === "Ping"){
                const data = response.data
                message.error(data)
            }
        },
    });

    useEffect(() => {
        sendJsonMessage({
            type: "GetDevicesSheets",
        });
    }, []);

    return (
        <Auth>
            <div className="d-flex justify-content-between mb-3">
                <h3>Thiết bị</h3>
                <Button onClick={() => setOpen(true)} type="primary">Thêm thiết bị</Button>
            </div>
            <DevicesTable source={devices} sendJsonMessage={sendJsonMessage} />
            <Modal
                title={
                    <div className="d-flex justify-content-center">
                        Thông tin thiết bị
                    </div>
                }
                centered
                open={open}
                okText={"Thêm"}
                onOk={() => submitRef.current.click()}
                onCancel={() => setOpen(false)}
                width={"50%"}
            >
                <DeviceForm setLoading={setLoading} setOpen={setOpen} sendJsonMessage={sendJsonMessage} submitRef={submitRef}></DeviceForm>
            </Modal>
        </Auth>
    );
}
