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
            width: 60,
            render: (text) => <a>{text}</a>,
        },
        {
            title: "UID",
            dataIndex: "UID",
            key: "UID",
            render: (text) => <a>{text}</a>,
            width: 80
        },
        {
            title: "User ID",
            dataIndex: "UserId",
            key: "UserId",
            render: (text) => <a>{text}</a>,
            width: 80
        },
        {
            title: "Mã nhân viên",
            dataIndex: "EmployeeCode",
            key: "EmployeeCode",
            width: 120,
        },
        {
            title: "Quyền",
            dataIndex: "Role",
            key: "Role",
            width: 100,
            render: (value) => {

                return <p>{value === 0 ? UserRoles[0].text : UserRoles[1].text}</p>
                
            },
        },
        {
            title: "IP thiết bị",
            dataIndex: "DeviceIp",
            key: "DeviceIp",
            width: 130,
        },
        {
            title: "Tên thiết bị",
            dataIndex: "DeviceName",
            key: "DeviceName",
            width: 150,
        },
        {
            title: "Tên trong máy",
            dataIndex: "Name",
            key: "name",
            width: 150,
        },
        {
            title: "Tên nhân viên",
            dataIndex: "DisplayName",
            key: "DisplayName",
            width: 150,
        },
        {
            title: "Mật khẩu",
            dataIndex: "Password",
            key: "password",
            width: 100,
        },
        {
            title: "Mã thẻ từ",
            dataIndex: "CardNo",
            key: "CardNo",
            width: 120,
        },
        {
            title: "Action",
            key: "action",
            fixed: 'right',
            width: 150,
            render: (_, record) => (
                <Space size="small" direction="vertical" className="w-full sm:flex-row">
                    <Button 
                        onClick={() => setUser(record)} 
                        style={{ backgroundColor: "#C3C7F4" }}
                        size="small"
                        block
                    >
                        Sửa
                    </Button>

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
                        <Button danger size="small" block>Xóa</Button>
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
                pagination={{ 
                    pageSize: 100,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    responsive: true,
                }}
                scroll={{ 
                    x: 1400,
                    y: window.innerHeight - 300 
                }}
                size="middle"
                className="responsive-table"
            />
            {user && (
                <Modal
                    open={user}
                    onCancel={() => setUser(null)}
                    onOk={() => {
                        submitRef.current.click();
                        setUser(null);
                    }}
                    centered
                    width="90%"
                    style={{ maxWidth: 600 }}
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
