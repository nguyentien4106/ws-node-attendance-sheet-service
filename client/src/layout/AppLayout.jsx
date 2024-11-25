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
import logo from "../assets/logo.png";
import devicePng from "../assets/logo.png";

const { Header, Content, Footer, Sider } = Layout;

const AppLayout = () => {
	const [collapsed, setCollapsed] = useState(false);
	const {
		token: { colorBgContainer, borderRadiusLG },
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
                        backgroundColor: bgColor,
                        borderRadius: 20
					}}
				>
					<div
						style={{
							padding: 24,
							minHeight: 360,
							background: colorBgContainer,
							borderRadius: 20,
                            backgroundColor: bgColor,
                            
						}}
					>
						<Outlet>{contextHolder}</Outlet>
					</div>
				</Content>
				<Footer
					style={{
						textAlign: "center",
					}}
				>
					SANA POS ©{new Date().getFullYear()} Created by ePower Team
				</Footer>
			</Layout>
		</Layout>
	);
};
export default AppLayout;
