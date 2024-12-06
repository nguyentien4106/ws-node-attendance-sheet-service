import "./App.css";
import useWebSocket from "react-use-websocket";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Devices from "./pages/Devices";
import Home from "./pages/Home";
import { message, Spin } from "antd";
import { useLoading } from "./context/LoadingContext";
import { LoadingOutlined } from '@ant-design/icons';
import Users from "./pages/Users";
import Attendances from "./pages/Attendances";
import Settings from "./pages/Settings";
import Login from "./pages/Login";
import { getHostUrl } from "./helper/common";
import { RequestTypes } from "./constants/requestType";
const WS_URL = getHostUrl();

function App() {
    const { loading } = useLoading()
    
    useWebSocket(WS_URL, {
        onError: (err) => {
            message.error('Kết nối tới máy chủ không thành công. Vui lòng kiểm tra lại IP máy chủ: Cài đặt -> IP máy chủ. ')
        },
        onMessage: (event) => {
            const response = JSON.parse(event.data);

            const { type, data } = response
            console.log('response', response)
            if(type === RequestTypes.DeviceNewADMS){
                message.success('Đã phát hiện một thiết bị ADMS có SerialNumber: ' + data)
            }

            if(type === "Ping"){
                message.info('Tín hiệu: ' + data)
            }
        }
    });

    return (
        <>
            {
                loading &&  <Spin fullscreen indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            }
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/devices" index element={<Devices />} />
                    <Route path="/users" element={<Users />} />
                    <Route path="/attendances" element={<Attendances />} />
                    <Route path="/settings" element={<Settings />} />
                    <Route path="/login" element={<Login />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
