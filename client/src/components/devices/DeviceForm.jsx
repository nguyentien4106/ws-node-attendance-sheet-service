import { Button, Form, Input, Space } from "antd";
import React from "react";
import { CloseOutlined } from "@ant-design/icons";
import { RequestTypes } from "../../constants/requestType";

export default function DeviceForm({ setOpen, sendJsonMessage, setLoading, submitRef }) {

    const addDevice = device => {
        setOpen(false)
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.AddDevice,
            data: device
        });
    }

    return (
        <Form
            labelCol={{
                span: 5,
            }}
            wrapperCol={{
                span: 16,
            }}
            initialValues={{
                Ip: "192.168.1.201",
                Port: 4370,
                Sheets: [{ SheetName: "DATA CHẤM CÔNG", DocumentId: "" }],
            }}
            onFinish={addDevice}
            autoComplete="off"
        >
            <Form.Item
                label="IP"
                name="Ip"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập IP",
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item
                label="Tên thiết bị"
                name="Name"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập tên thiết bị",
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
                        message: "Vui lòng nhập Port!",
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.List name="Sheets">
                {(fields, { add, remove }) => (
                    <div className="d-flex flex-column justify-content-center">
                        {fields.map((field, idx) => (
                            <Form.Item label="Sheet" key={`${field} - ${idx}`}>
                                <Space key={`${field.key} ${idx}`}>
                                    <Form.Item
                                        noStyle
                                        name={[field.name, "SheetName"]}
                                    >
                                        <Input placeholder="DATA CHẤM CÔNG" />
                                    </Form.Item>
                                    <Form.Item
                                        noStyle
                                        name={[field.name, "DocumentId"]}
                                        rules={[
                                            {
                                                required: true,
                                                message:
                                                    "Vui lòng nhập Document Id",
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
                                                msg.error("error");
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
                                + Thêm sheet
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
                <Button type="primary" htmlType="submit" ref={submitRef} hidden>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    );
}
