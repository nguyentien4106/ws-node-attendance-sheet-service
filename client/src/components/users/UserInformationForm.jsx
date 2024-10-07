import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, Select, Space } from "antd";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import { UserRoles } from "../../constants/userRoles";
const layout = {
    labelCol: {
        span: 5,
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

const UserInformationForm = ({
    submitRef,
    sendJsonMessage,
    device,
    setOpen,
    devices,
}) => {
    const [form] = Form.useForm();
    const { setLoading } = useLoading();

    const onFinish = (values) => {
        setLoading(true);
        setOpen(false);
        console.log(values);
        sendJsonMessage({
            type: RequestTypes.AddUser,
            data: values,
        });
    };

    const onReset = () => {
        form.resetFields();
    };

    return (
        <Form
            {...layout}
            form={form}
            onFinish={onFinish}
            style={{
                maxWidth: 600,
            }}
            initialValues={{
                Devices: devices.map((item) => item.Ip),
            }}
        >
            <Form.Item
                name="uid"
                label="UID"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <InputNumber
                    max={3000}
                    min={0}
                    placeholder="UID of user in machine"
                />
            </Form.Item>
            <Form.Item
                name="userId"
                label="User Code"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input maxLength={9} placeholder="Employee Code" />
            </Form.Item>

            <Form.Item
                name="name"
                label="User's Name"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input maxLength={24} placeholder="Employee Name" />
            </Form.Item>

            <Form.Item
                name="password"
                label="Password"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input maxLength={24} placeholder="Employee Password" />
            </Form.Item>
            <Form.Item
                label="Role"
                name={"role"}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select>
                    {UserRoles.map((item) => (
                        <Select.Option
                            key={item.value}
                            value={item.value}
                            selected={item.selected}
                        >
                            {item.text}
                        </Select.Option>
                    ))}
                </Select>
            </Form.Item>
            <Form.Item
                label="Devices"
                name={"devices"}
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Select
                    mode="multiple"
                    allowClear
                    style={{
                        width: "100%",
                    }}
                    placeholder="Please select"
                    onChange={(val) => console.log(val)}
                    options={devices?.map((device) => ({
                        label: device.Name,
                        value: device.Ip,
                    }))}
                />
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
                    <Button htmlType="button" onClick={onReset}>
                        Reset
                    </Button>
                </Space>
            </Form.Item>
        </Form>
    );
};
export default UserInformationForm;
