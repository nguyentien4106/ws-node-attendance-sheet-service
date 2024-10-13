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
                name="userId"
                label="Mã nhân viên"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input maxLength={9} placeholder="Mã nhân viên" />
            </Form.Item>

            <Form.Item
                name="name"
                label="Tên trong máy"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input maxLength={24} placeholder="Tên nhân viên" />
            </Form.Item>
            <Form.Item
                name="displayName"
                label="Tên hiển thị"
                rules={[
                    {
                        required: true,
                    },
                ]}
                tooltip="Tên này dùng để hiện thị khi chấm công."
            >
                <Input maxLength={24} placeholder="Tên hiển thị" />
            </Form.Item>
            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                    {
                        required: true,
                    },
                ]}
            >
                <Input maxLength={24} placeholder="Mật khẩu người dùng" />
            </Form.Item>
            <Form.Item
                label="Quyền"
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
                label="Thiết bị"
                name={"devices"}
                rules={[
                    {
                        required: true,
                    },
                ]}
                tooltip="Chỉ hiển thị những thiết bị đã được kết nối. Vui lòng kết nối thiết bị trước khi thêm nhân viên cho thiết bị đó."
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
