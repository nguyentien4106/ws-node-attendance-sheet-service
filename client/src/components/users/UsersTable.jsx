import { Button, Space, Table, Popconfirm } from 'antd'
import React from 'react'
import { RequestTypes } from '../../constants/requestType';

export default function UsersTable({ users, sendJsonMessage, deviceIp }) {
    const columns = [
        {
            title: "UID",
            dataIndex: "UID",
            key: "UID",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "User ID",
            dataIndex: "UserId",
            key: "userId",
        },
        {
            title: "Device Ip",
            dataIndex: "DeviceIp",
            key: "DeviceIp",
        },
        {
            title: "Name",
            dataIndex: "Name",
            key: "name",
        },
        {
            title: "Display Name",
            dataIndex: "DisplayName",
            key: "DisplayName",
        },        
        {
            title: "Password",
            dataIndex: "Password",
            key: "password",
        },
        {
            title: "Card Number",
            dataIndex: "CardNo",
            key: "carno",
        },        
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title={`Device: ${record.uid}`}
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
                </Space>
            ),
        },
    ];

    const handleDelete = (record) => {
        console.log(record)
        sendJsonMessage({
            type: RequestTypes.DeleteUser,
            data: {
                userId: record.uid,
                deviceIp: deviceIp
            }
        })
    }

  return (
    <Table rowKey={"Id"} dataSource={users} columns={columns}>
    </Table>
  )
}
