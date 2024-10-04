import React, { useState } from "react";
import {
    DesktopOutlined,
    FileOutlined,
    PieChartOutlined,
    TeamOutlined,
    UserOutlined,
} from "@ant-design/icons";
import { Breadcrumb, Layout, Menu, message, theme } from "antd";
import Devices from "../pages/Devices";
import { Outlet, useNavigate } from "react-router-dom";
const { Header, Content, Footer, Sider } = Layout;


const AppLayout = () => {
    const [collapsed, setCollapsed] = useState(false);
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();
    const navigate = useNavigate()
    const [msg, contextHolder] = message.useMessage();

    const items = [
        {
            key: 'Devices',
            icon: <TeamOutlined />,
            label: 'Devices',
            onClick: () => navigate("/Devices")
        },
        {
            key: 'Users',
            icon: <DesktopOutlined />,
            label: 'Users',
            onClick: () => navigate("/Users")
        },
    
    ];

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
            >
                <div className="demo-logo-vertical" />
                <Menu
                    theme="dark"
                    defaultSelectedKeys={["Devices"]}
                    mode="inline"
                    items={items}
                />
            </Sider>
            <Layout>
                <Header
                    style={{
                        padding: 0,
                        background: colorBgContainer,
                    }}
                />
                <Content
                    style={{
                        margin: "0 16px",
                    }}
                >
                    <div
                        style={{
                            padding: 24,
                            minHeight: 360,
                            background: colorBgContainer,
                            borderRadius: borderRadiusLG,
                        }}
                    >
                        <Outlet>
                            {contextHolder}
                        </Outlet>
                    </div>
                </Content>
                <Footer
                    style={{
                        textAlign: "center",
                    }}
                >
                    Ant Design ©{new Date().getFullYear()} Created by Ant UED
                </Footer>
            </Layout>
        </Layout>
    );
};
export default AppLayout;
