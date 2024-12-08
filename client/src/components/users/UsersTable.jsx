import { Button, Space, Table, Popconfirm, Modal, Checkbox } from "antd";
import React, { useRef, useState } from "react";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import { UserRoles } from "../../constants/userRoles";
import EditUserForm from "./EditUserForm";

export default function UsersTable({
    users,
    sendJsonMessage,
}) {
    const columns = [
        {
            title: "ID",
            dataIndex: "Id",
            key: "Id",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "UID",
            dataIndex: "UID",
            key: "UID",
            render: (text) => <a>{text}</a>,
            width: "80px"
        },
        {
            title: "User ID",
            dataIndex: "UserId",
            key: "UserId",
            render: (text) => <a>{text}</a>,
            width: "80px"
        },
        {
            title: "Mã nhân viên",
            dataIndex: "EmployeeCode",
            key: "EmployeeCode",
        },
        {
            title: "Quyền",
            dataIndex: "Role",
            key: "Role",
            render: (value) => {

                return <p>{value === 0 ? UserRoles[0].text : UserRoles[1].text}</p>
                
            },
        },
        {
            title: "IP thiết bị",
            dataIndex: "DeviceIp",
            key: "DeviceIp",
        },
        {
            title: "Tên thiết bị",
            dataIndex: "DeviceName",
            key: "DeviceName",
        },
        {
            title: "Tên trong máy",
            dataIndex: "Name",
            key: "name",
        },
        {
            title: "Tên nhân viên",
            dataIndex: "DisplayName",
            key: "DisplayName",
        },
        {
            title: "Mật khẩu",
            dataIndex: "Password",
            key: "password",
        },
        {
            title: "Mã thẻ từ",
            dataIndex: "CardNo",
            key: "CardNo",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Button onClick={() => setUser(record)} style={{ backgroundColor: "#C3C7F4" }}>Sửa</Button>

                    <Popconfirm
                        title={`Device: ${record.DeviceName}`}
                        description={() => descriptionContent(record)}
                        onConfirm={(e) => {
                            handleDelete(record);
                        }}
                        onCancel={() => { setDeleteSheet(false) }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const descriptionContent = (record) => {
        const texts = [`Xoá ${record.Name} (${record.EmployeeCode}) khỏi thiết bị ${record.DeviceName} ? `, 'Xoá trên Sheet ? ']

        return (
            <ul>
                {texts.map((text, index) => index === 1 ? (
                    <li key={index}>
                        {text}
                        <Checkbox onClick={() => setDeleteSheet(prev => !prev)} checked={deleteSheet}></Checkbox>
                    </li>

                ) : (
                    <li key={index}>{text}</li>
                ))}
            </ul>
        )
    }

    const handleDelete = (record) => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.DeleteUser,
            data: {
                uid: record.UID,
                deviceIp: record.DeviceIp,
                deleteSheet: deleteSheet
            },
        });
    };

    const [user, setUser] = useState(null);
    const [deleteSheet, setDeleteSheet] = useState(false)
    const { setLoading } = useLoading();
    const submitRef = useRef();

    return (
        <>
            <Table
                rowKey={"Id"}
                dataSource={users}
                columns={columns}
                bordered
                rowHoverable
                pagination={{ pageSize: 100 }}
            ></Table>
            {user && (
                <Modal
                    open={user}
                    onCancel={() => setUser(null)}
                    onOk={() => {
                        submitRef.current.click();
                        setUser(null);
                    }}
                >
                    <EditUserForm
                        user={user}
                        submitRef={submitRef}
                        sendJsonMessage={sendJsonMessage}
                    ></EditUserForm>
                </Modal>
            )}
        </>
    );
}
