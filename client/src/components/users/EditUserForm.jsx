import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Select, Space } from "antd";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import { UserRoles } from "../../constants/userRoles";
const layout = {
    labelCol: {
        span: 6,
    },
    wrapperCol: {
        span: 16,
    },
};
const tailLayout = {
    wrapperCol: {
        offset: 8,
        span: 16,
    },
};

const EditUserForm = ({
    user,
    submitRef,
    sendJsonMessage
}) => {
    const [form] = Form.useForm();
    const { setLoading } = useLoading();

    const onFinish = (values) => {
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.EditUser,
            data: Object.assign(values, { DeviceIp: user.DeviceIp })
        })      
    };

    return (
        <Form
            {...layout}
            form={form}
            onFinish={onFinish}
            style={{
                maxWidth: 600,
            }}
            initialValues={user}
            
        >
            <Form.Item
                name="Id"
                label="Id"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input disabled/>
            </Form.Item>
            <Form.Item
                name="DeviceName"
                label="Tên thiết bị"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input disabled/>
            </Form.Item>
            <Form.Item
                name="Name"
                label="Tên trong máy"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input disabled/>
            </Form.Item>
            <Form.Item
                name="EmployeeCode"
                label="Mã nhân viên"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input />
            </Form.Item>
            <Form.Item
                name="DisplayName"
                label="Tên nhân viên"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input />
            </Form.Item>

            <Form.Item {...tailLayout}>
                <Space>
                    <Button
                        type="primary"
                        htmlType="submit"
                        hidden
                        ref={submitRef}
                    >
                        Submit
                    </Button>
 
                </Space>
            </Form.Item>
        </Form>
    );
};
export default EditUserForm;
