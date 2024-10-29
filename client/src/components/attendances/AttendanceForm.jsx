import React, { useEffect } from "react";
import { Button, Checkbox, DatePicker, Form, Input, Select } from "antd";
import { RequestTypes } from "../../constants/requestType";
import dayjs from "dayjs";
import { useLoading } from "../../context/LoadingContext";

export default function AttendanceForm({ attendance, sendJsonMessage, submitRef }) {
    const [form] = Form.useForm();
    const { setLoading } = useLoading()

    const onFinish = (values) => {
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.UpdateLog,
            data: {
                logId: values.Id,
                date: dayjs(values.VerifyDate).format()
            }
        })
    };

    return (
        <div>
            <Form
                name="edit-attendance"
                form={form}
                labelCol={{
                    span: 5,
                }}
                wrapperCol={{
                    span: 16,
                }}
                style={{
                    maxWidth: 1000,
                }}
                initialValues={attendance}
                onFinish={onFinish}
                autoComplete="off"
            >
                <Form.Item
                    label="Id"
                    name="Id"
                >
                    <Input disabled/>
                </Form.Item>

                <Form.Item
                    label="Trên thiết bị"
                    name="DeviceName"
                >
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label="Tên trong máy"
                    name="UserName"
                >
                    <Input disabled/>
                </Form.Item>

                <Form.Item
                    label="Tên hiển thị"
                    name="Name"
                >
                    <Input disabled/>
                </Form.Item>
                <Form.Item
                    label="Ngày giờ"
                    name="VerifyDate"
                    rules={[
                        {
                            required: true,
                            message: "Please input your username!",
                        },
                    ]}
                    getValueFromEvent={(onChange) => dayjs(onChange)}
                    getValueProps={(i) => ({value: dayjs(i)})}
                >
                    <DatePicker showTime></DatePicker>
                </Form.Item>
                <Form.Item
                    wrapperCol={{
                        offset: 8,
                        span: 16,
                    }}

                    hidden
                >
                    <Button type="primary" htmlType="submit" ref={submitRef}>
                        Submit
                    </Button>
                </Form.Item>
            </Form>
        </div>
    );
}
