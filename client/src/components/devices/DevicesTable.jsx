import React, { useRef, useState } from "react";
import { Button, Space, Table, Tag, Popconfirm, Modal } from "antd";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import UserInformationForm from "../users/UserInformationForm";

export default function DevicesTable({ sendJsonMessage, source }) {
    const columns = [
        {
            title: "Id",
            dataIndex: "Id",
            key: "id",
            render: (text) => <a>{text}</a>,
        },
        {
            title: "Name",
            dataIndex: "Name",
            key: "Name",
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
                        <Button danger type="primary">Delete</Button>
                    </Popconfirm>
                    {/* <Button 
                        onClick={() => addUser(record)} 
                        // disabled={!record.IsConnected}
                    >
                        Add User
                    </Button> */}
                    <Button onClick={() => handleStatus(record)} danger={record.IsConnected} color="#1231da">
                        {record.IsConnected ? "Disconnect" : "Connect"}
                    </Button>
                    {/* <a onClick={() => handleStatus(record)}>
                        {record.IsConnected ? "Disconnect" : "Connect"}
                    </a> */}
                </Space>
            ),
        },
    ];
    
    const handleStatus = (record) => {
        setLoading(true)
        sendJsonMessage({
            type: record.IsConnected ? RequestTypes.DisconnectDevice : RequestTypes.ConnectDevice,
            data: record
        });
    };

    const handleDelete = (record) => {
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.RemoveDevice,
            data: record,
        });
    };

    const addUser = device => {
        setOpen(true)
        setDevice(device)
    }

    const [open, setOpen] = useState(false)
    const [device, setDevice] = useState(null)

    const { setLoading } = useLoading()
    const submitUserFormRef = useRef()

    return (
        <>
            <Modal 
                title={<div className="d-flex justify-content-center">User Information</div>}
                open={open} 
                onOk={() => {
                    submitUserFormRef.current.click()
                }} 
                onCancel={() => setOpen(false)}
                style={{
                    width: "50%"
                }}
            >
                <UserInformationForm setOpen={setOpen} submitRef={submitUserFormRef} sendJsonMessage={sendJsonMessage} device={device}/>
            </Modal>
            <Table columns={columns} dataSource={source} rowKey={"Id"}/>
        </>
    );
}
