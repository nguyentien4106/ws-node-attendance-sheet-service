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
import Users from "./pages/Users";
import Attendances from "./pages/Attendances";
import Settings from "./pages/Settings";
const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://127.0.0.1:3000";

function App() {
    const { loading } = useLoading()
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
                </Route>
            </Routes>
        </>
    );
}

export default App;
