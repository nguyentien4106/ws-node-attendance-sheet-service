import { useEffect, useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import "./App.css";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "./constants/requestType";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import AppLayout from "./layout/AppLayout";
import Devices from "./pages/Devices";
import Home from "./pages/Home";
import { message, Spin } from "antd";
import { useLoading } from "./context/LoadingContext";
import { LoadingOutlined } from '@ant-design/icons';

const WS_URL = "ws://127.0.0.1:3000";

function App() {
    const { loading } = useLoading()
    const [msg, contextHolder] = message.useMessage();

    return (
        <>
            {
                loading &&  <Spin fullscreen indicator={<LoadingOutlined style={{ fontSize: 48 }} spin />} />
            }
            {contextHolder}
            <Routes>
                <Route path="/" element={<AppLayout />}>
                    <Route index element={<Home />} />
                    <Route path="/devices" element={<Devices />} />
                </Route>
            </Routes>
        </>
    );
}

export default App;
