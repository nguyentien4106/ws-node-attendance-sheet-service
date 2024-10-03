import React from "react";
import { Button, Space, Table, Tag, Popconfirm } from "antd";
import { RequestTypes } from "../../constants/requestType";

export default function DevicesTable({ sendJsonMessage, source }) {
    const columns = [
        {
            title: "Id",
            dataIndex: "Id",
            key: "id",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "Ip",
            dataIndex: "Ip",
            key: "Ip",
        },
        {
            title: "Port",
            dataIndex: "Port",
            key: "Port",
        },
        {
            title: "CommKey",
            dataIndex: "CommKey",
            key: "CommKey",
        },
        {
            title: "Status",
            dataIndex: "IsConnected",
            key: "IsConnected",
            render: (value, record) =>
                value ? (
                    <img
                        width="48"
                        height="48"
                        src="https://img.icons8.com/color/48/checkmark--v1.png"
                        alt="checkmark--v1"
                    />
                ) : (
                    <img
                        width="32"
                        height="32"
                        src="https://img.icons8.com/dusk/64/disconnected--v2.png"
                        alt="disconnected--v2"
                    />
                ),
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title={`Device: ${record.Ip}`}
                        description="Are you sure to delete this device?"
                        onConfirm={(e) => {
                            console.log(e)
                            handleDelete(record)
                        }}
                        onCancel={() => {}}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger>Delete</Button>
                    </Popconfirm>
                    <a onClick={() => handleStatus(record)}>
                        {record.IsConnected ? "Disconnect" : "Connect"}
                    </a>
                    {/* <a onClick={() => handleUser(record)}>{"Get Users"}</a> */}
                </Space>
            ),
        },
    ];

    const handleUser = (record) => {
        if (record.IsConnected) {
            sendJsonMessage({
                type: RequestTypes.GetUsers,
            });
        }
    };

    const handleStatus = (record) => {
        console.log(record);
        if (record.IsConnected) {
            sendJsonMessage({
                type: RequestTypes.ConnectDevice,
            });
        } else {
            sendJsonMessage({
                type: RequestTypes.ConnectDevice,
                data: record,
            });
        }
    };

    const handleDelete = (record) => {
        console.log('handle delete')
        sendJsonMessage({
            type: RequestTypes.RemoveDevice,
            data: record,
        });
    };

    return <Table columns={columns} dataSource={source} rowKey={"Id"}/>;
}
