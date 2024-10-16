import { Button, Space, Table, Popconfirm } from 'antd'
import React from 'react'
import { RequestTypes } from '../../constants/requestType';
import { useLoading } from '../../context/LoadingContext';
import { UserRoles } from '../../constants/userRoles';

export default function UsersTable({ users, sendJsonMessage, deviceIp }) {
    const columns = [
        {
            title: "ID",
            dataIndex: "Id",
            key: "Id",
            render: (text) => <a>{text}</a>,
        },{
            title: "UID",
            dataIndex: "UID",
            key: "UID",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "Mã nhân viên",
            dataIndex: "UserId",
            key: "userId",
        },
        {
            title: "Quyền",
            dataIndex: "Role",
            key: "Role",
            render: (value) => {
                const role = UserRoles.filter(item => item.value === value)
                if(role.length){
                    return <p>{role[0].text}</p>
                }
                return <p>{"Nguời dùng"}</p>
            }
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
            title: "Tên nhân viên",
            dataIndex: "Name",
            key: "name",
        },
        {
            title: "Tên hiển thị",
            dataIndex: "DisplayName",
            key: "DisplayName",
        },        
        {
            title: "Mật khẩu",
            dataIndex: "Password",
            key: "password",
        },
        {
            title: "Action",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title={`Device: ${record.uid}`}
                        description={`Bạn có muốn xóa người dùng này khỏi thiết bị ${record.DeviceName}?`}
                        onConfirm={(e) => {
                            handleDelete(record)
                        }}
                        onCancel={() => {}}
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
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.DeleteUser,
            data: {
                uid: record.UID,
                deviceIp: record.DeviceIp
            }
        })
    }

    const { setLoading } = useLoading()

  return (
    <Table rowKey={"Id"} dataSource={users} columns={columns} bordered rowHoverable pagination={{ pageSize: 100 }}>
    </Table>
  )
}
