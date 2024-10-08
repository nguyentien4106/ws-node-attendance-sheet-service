import React, { useEffect, useRef, useState } from "react";
import DevicesTable from "../components/devices/DevicesTable";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import {
    Button,
    Card,
    Form,
    Input,
    message,
    Modal,
    Space,
    Typography,
} from "antd";
import { useLoading } from "../context/LoadingContext";
import { CloseOutlined } from "@ant-design/icons";
import { notification } from "antd";
import DeviceForm from "../components/devices/DeviceForm";

const WS_URL = "ws://127.0.0.1:3000";
export default function Devices() {
    const [devices, setDevices] = useState([]);
    const [open, setOpen] = useState(false);
    const { setLoading } = useLoading();
    const [msg] = message.useMessage();
    const submitRef = useRef();

    const { sendJsonMessage } = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connection established.");
        },
        onClose: () => {
            console.log("on closed");
        },
        onMessage: (event) => {
            const response = JSON.parse(event.data);
            setLoading(false)
            if (response.type === RequestTypes.GetDevices) {
                setDevices(response.data);
            }

            if (response.type === RequestTypes.ConnectDevice) {
                const data = response.data;
                console.log("ConnectDevice result", data);
                
                if(data.code === 200){
                    setDevices(prev => prev.map(item => item.Id === data.data.Id ? Object.assign(item, { IsConnected: true }) : item))
                }
                else {
                    const { syscall, code } = data.message.err.err
                    message.error(`${syscall} ${code}! Please check the information again.`)
                }
            }

            if (response.type === RequestTypes.DisconnectDevice) {
                const data = response.data;
                console.log("Disconnect result", data);
                if(data.code === 200){
                    setDevices(prev => prev.map(item => item.Id === data.data.Id ? Object.assign(item, { IsConnected: false }) : item))
                }
                else {
                    const { syscall, code } = data.message.err.err
                    message.error(`${syscall} ${code}! Please check the information again.`)
                }
            }

            if (response.type === RequestTypes.GetUsers) {
                const result = response.data;
                console.log("GetUsers result", result);
            }

            if(response.type === RequestTypes.AddDevice){
                const data = response.data;
                if(data.code === 200){
                    setDevices(prev => [...prev, data.data])

                }
                else {
                    message.error(data.message)

                }
                console.log("AddDevice result", data);
            }

            if(response.type === RequestTypes.RemoveDevice){
                const data = response.data;
                console.log("RemoveDevice result", data);
                if(data.code === 200){
                    setDevices(prev => prev.filter(item => item.Id !== data.data.Id ))
                }
                else {
                    message.error(data.message)
                }
            }

            if(response.type === RequestTypes.AddUser){
                const data = response.data;
                console.log("AddUser result", data);

                if(data.code === 200){
                    message.success("Added User successfully to deivce " + data.data.Ip)
                }
                else {
                    console.log()
                    // message.error(data.message)
                }
            }
        },
    });

    useEffect(() => {
        sendJsonMessage({
            type: RequestTypes.GetDevices,
        });
    }, []);

    const addDevice = device => {
        setOpen(false)
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.AddDevice,
            data: device
        });
    }

    return (
        <div>
            <div className="d-flex justify-content-end mb-3">
                <Button onClick={() => setOpen(true)} type="primary">Add New Device</Button>
            </div>
            <DevicesTable source={devices} sendJsonMessage={sendJsonMessage} />
            <Modal
                title={
                    <div className="d-flex justify-content-center">
                        Device Information
                    </div>
                }
                centered
                open={open}
                okText={"Add New Device"}
                onOk={() => submitRef.current.click()}
                onCancel={() => setOpen(false)}
                width={"50%"}
            >
                {/* <Form
                    labelCol={{
                        span: 5,
                    }}
                    wrapperCol={{
                        span: 16,
                    }}
                    initialValues={{
                        Ip: "192.168.1.201",
                        Port: 4370,
                        Sheets: [{ SheetName: "Sheet1", DocumentId: "" }],
                    }}
                    onFinish={addDevice}
                    onFinishFailed={(values) => console.log(values)}
                    autoComplete="off"
                >
                    <Form.Item
                        label="IP"
                        name="Ip"
                        rules={[
                            {
                                required: true,
                                message: "Please input your IP!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Name"
                        name="Name"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Name!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.Item
                        label="Port"
                        name="Port"
                        rules={[
                            {
                                required: true,
                                message: "Please input your Port!",
                            },
                        ]}
                    >
                        <Input />
                    </Form.Item>

                    <Form.List name="Sheets">
                        {(fields, { add, remove }) => (
                            <div className="d-flex flex-column justify-content-center">
                                {fields.map((field) => (
                                    <Form.Item label="Sheet">
                                        <Space key={""}>
                                            <Form.Item
                                                noStyle
                                                name={[field.name, "SheetName"]}
                                            >
                                                <Input placeholder="Sheet1" />
                                            </Form.Item>
                                            <Form.Item
                                                noStyle
                                                name={[
                                                    field.name,
                                                    "DocumentId",
                                                ]}
                                                rules={[
                                                    {
                                                        required: true,
                                                        message:
                                                            "Please input your Document Id!",
                                                    },
                                                ]}
                                            >
                                                <Input placeholder="Document Id" />
                                            </Form.Item>
                                            <CloseOutlined
                                                onClick={() => {
                                                    if (fields.length > 1) {
                                                        remove(field.name);
                                                    } else {
                                                        msg.error("errro");
                                                    }
                                                }}
                                            />
                                        </Space>
                                    </Form.Item>
                                ))}

                                <Form.Item
                                    wrapperCol={{
                                        offset: 5,
                                        span: 16,
                                    }}
                                >
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        style={{
                                            width: 200,
                                        }}
                                        className="d-flex justify-content-center"
                                    >
                                        + Add Sheet
                                    </Button>
                                </Form.Item>
                            </div>
                        )}
                    </Form.List>

                    <Form.Item
                        wrapperCol={{
                            offset: 8,
                            span: 16,
                        }}
                    >
                        <Button
                            type="primary"
                            htmlType="submit"
                            ref={submitRef}
                            hidden
                        >
                            Submit
                        </Button>
                    </Form.Item>
                </Form> */}
                <DeviceForm setLoading={setLoading} setOpen={setOpen} sendJsonMessage={sendJsonMessage} submitRef={submitRef}></DeviceForm>
            </Modal>
        </div>
    );
}
