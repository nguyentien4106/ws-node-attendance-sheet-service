import React, { useCallback, useEffect, useRef, useState } from "react";
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
import { getHostUrl, isAuth } from "../helper/common";
import Auth from "../layout/Auth";

const WS_URL = getHostUrl();

export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [open, setOpen] = useState(false);
    const { setLoading } = useLoading();
    const submitRef = useRef();
    const [sheets, setSheets] = useState({})

    const { sendJsonMessage } = useWebSocket(WS_URL, {
        onError: (err) => {
            message.error('Kết nối tới máy chủ không thành công. Vui lòng kiểm tra lại IP máy chủ: Cài đặt -> IP máy chủ. ')
        },
        onMessage: useCallback(event => handleWebSocketMessage(event), []),
    });

    const handleWebSocketMessage = (event) => {
        const response = JSON.parse(event.data);
        const { type, data } = response;
    
        setLoading(false);
    
        const handleError = (error) => {
            const { syscall, code } = error?.err?.err || {};
            message.error(`${syscall} ${code}! Vui lòng thử lại`);
        };
    
        switch (type) {
            case RequestTypes.GetDevices:
                setDevices(data);
                break;
    
            case RequestTypes.ConnectDevice:
                if (data.code === 200) {
                    setDevices((prev) =>
                        prev.map((item) =>
                            item.Id === data.data.Id
                                ? { ...item, IsConnected: true }
                                : item
                        )
                    );
                    message.success("Kết nối thiết bị thành công.");
                } else {
                    handleError(data.message);
                }
                break;
    
            case RequestTypes.DisconnectDevice:
                if (data.code === 200) {
                    setDevices((prev) =>
                        prev.map((item) =>
                            item.Id === data.data.Id
                                ? { ...item, IsConnected: false }
                                : item
                        )
                    );
                    message.success("Ngắt kết nối thiết bị thành công.");
                } else {
                    handleError(data.message);
                }
                break;
    
            case RequestTypes.AddDevice:
                if (data.isSuccess) {
                    message.success("Thêm thiết bị thành công.");
                    location.reload();
                } else {
                    message.error(data.message?.trim() || "Đã xảy ra lỗi không mong muốn khi thêm thiết bị. Vui lòng thử lại.");
                }
                break;
    
            case RequestTypes.RemoveDevice:
                if (data.code === 200) {
                    setDevices((prev) => prev.filter((item) => item.Id !== data.data.Id));
                    message.success("Gỡ thiết bị thành công.");
                } else {
                    message.error(data.message);
                }
                break;
    
            case RequestTypes.SyncData:
                if (data.isSuccess) {
                    message.success("Đồng bộ dữ liệu thành công.");
                } else {
                    message.error(data.message);
                }
                break;
    
            case RequestTypes.GetDevicesSheets:
                setDevices(data.data);
                break;
    
            case RequestTypes.GetSheets:
                setSheets(Object.groupBy(data.data, (item) => item.DocumentId));
                break;
    
            case RequestTypes.DeviceClearAttendances:
                if (data.isSuccess) {
                    message.success("Đã xóa toàn bộ dữ liệu trong máy thành công.");
                } else {
                    message.error(data.message);
                }
                break;
    
            default:
                console.warn(`Unhandled response type: ${type}`);
        }
    };
    

    useEffect(() => {
        if (!isAuth) {
            return
        }
        sendJsonMessage({
            type: RequestTypes.GetDevicesSheets,
        });
        sendJsonMessage({
            type: RequestTypes.GetSheets,
        });
    }, []);

    return (
        <Auth>
            <div className="d-flex justify-content-between mb-3">
                <h3>Thiết bị</h3>
                <Button onClick={() => setOpen(true)} type="primary">Thêm thiết bị</Button>
            </div>
            <DevicesTable source={devices} sendJsonMessage={sendJsonMessage} sheets={sheets}/>
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
