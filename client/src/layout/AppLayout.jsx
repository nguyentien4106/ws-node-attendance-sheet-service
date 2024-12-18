import React, { useState } from "react";
import { Layout, Menu, message, theme } from "antd";
import { Outlet, useNavigate } from "react-router-dom";
import logo from "../assets/logo.png";
const { Content, Footer, Sider } = Layout;

const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer },
    } = theme.useToken();

    const navigate = useNavigate();
    const [msg, contextHolder] = message.useMessage();
    const [tab, setTab] = useState([
        window.location.pathname.slice(1).trim() ?? "Devices",
    ]);

    const items = [
        {
            key: "Devices",
            icon: (
                <img
                    width="32"
                    height="32"
                    color="white"
                    style={{ color: "white" }}
                    src="https://img.icons8.com/ios/50/usb-connected.png"
                    alt="usb-connected"
                />
            ),
            label: "Thiết bị",
            onClick: () => {
                setTab(["Devices"]);
                navigate("/Devices");
            },
        },
        {
            key: "Users",
            icon: (
                <img
                    width="32"
                    height="32"
                    src="https://img.icons8.com/ios-filled/50/user-male-circle.png"
                    alt="user-male-circle"
                />
            ),
            label: "Người dùng",
            onClick: () => {
                setTab(["Users"]);
                navigate("/Users");
            },
        },
        {
            key: "Attendances",
            icon: (
                <img
                    width="32"
                    height="32"
                    src="https://img.icons8.com/material-two-tone/100/edit-property.png"
                    alt="edit-property"
                />
            ),
            label: "Dữ liệu chấm công",
            onClick: () => {
                setTab(["Attendances"]);
                navigate("/Attendances");
            },
        },
        {
            key: "Settings",
            icon: (
                <img
                    width="32"
                    height="32"
                    src="https://img.icons8.com/dotty/50/settings.png"
                    alt="settings"
                />
            ),
            label: "Cài đặt",
            onClick: () => {
                setTab(["Settings"]);
                navigate("/Settings");
            },
        },
    ];
    const bgColor = "#B6C99B"

    return (
        <Layout
            style={{
                minHeight: "100vh",
            }}

        >
            <Sider
                collapsible
                collapsed={collapsed}
                onCollapse={(value) => setCollapsed(value)}
                width={250}
                theme="light"
            >
                <div className="demo-logo-vertical" />
                {!collapsed ? (
                    <img
                        src={logo}
                        height={100}
                        width={200}
                        className="pointer"
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                            setTab([""]);
                            navigate("/");
                        }}
                    />
                ) : <div style={{ height: 100 }}></div>}
                <Menu
                    theme="light"
                    selectedKeys={tab}
                    defaultSelectedKeys={["Devices"]}
                    mode="inline"
                    items={items}
                />
            </Sider>
            <Layout>
                <Content
                    style={{
                        margin: "32px 16px",
                        // backgroundColor: bgColor,
                        borderRadius: 20
                    }}
                >
                    <div
                        className="layout-container"
                    >
                        <Outlet>{contextHolder}</Outlet>
                    </div>
                </Content>
                <Footer
                    style={{
                        textAlign: "center",
                    }}
                >
                    <div className="d-flex justify-content-between">
                        <p>SANA POS ©{new Date().getFullYear()} Created by ePower Team</p>
                        <a href="https://forms.gle/aVrc69W6YwdB6vbJA" target="_blank">Góp ý/Phản hồi lỗi</a>
                    </div>
                </Footer>
            </Layout>
        </Layout>
    );
};
export default AppLayout;
