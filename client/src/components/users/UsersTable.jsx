import { Button, Space, Table, Popconfirm, Modal } from "antd";
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
            title: "Mã nhân viên",
            dataIndex: "EmployeeCode",
            key: "EmployeeCode",
        },
        {
            title: "Quyền",
            dataIndex: "Role",
            key: "Role",
            render: (value) => {
                const role = UserRoles.filter((item) => item.value === value);
                if (role.length) {
                    return <p>{role[0].text}</p>;
                }
                return <p>{"Nguời dùng"}</p>;
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
                        title={`Device: ${record.uid}`}
                        description={`Bạn có muốn xóa người dùng này khỏi thiết bị ${record.DeviceName}?`}
                        onConfirm={(e) => {
                            handleDelete(record);
                        }}
                        onCancel={() => { }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>Xóa</Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const handleDelete = (record) => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.DeleteUser,
            data: {
                uid: record.UID,
                deviceIp: record.DeviceIp,
            },
        });
    };

    const [user, setUser] = useState(null);
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
