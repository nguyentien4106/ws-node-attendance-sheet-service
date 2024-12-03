import React, { useEffect } from "react";
import { Button, Checkbox, DatePicker, Form, Input, Modal, Select } from "antd";
import { RequestTypes } from "../../constants/requestType";
import dayjs from "dayjs";
import { useLoading } from "../../context/LoadingContext";

export default function AttendanceForm({
    attendance,
    sendJsonMessage,
    submitRef,
    devices,
    users,
    setOpen
}) {
    const [form] = Form.useForm();
    const { setLoading } = useLoading();
    const isEdit = attendance;

    const onFinish = (values) => {
        setLoading(true);
        const params = isEdit
            ? {
                type: RequestTypes.UpdateLog,
                data: {
                    logId: values.Id,
                    date: dayjs(values.VerifyDate).format(),
                },
              }
            : {
                type: RequestTypes.AddLog,
                data: {
                    DeviceId: values.DeviceName,
                    UserId: values.UserName.trim(),
                    DateTime: dayjs(values.VerifyDate).format(),
                }
            };

        sendJsonMessage(params);
        setOpen(false)
    };

    const onDeviceChange = (val) => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.GetUsersByDeviceId,
            data: val,
        });
    };

    return (
        <div>
            <Form
                name="edit-attendance"
                form={form}
                labelCol={{
                    span: 6,
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
                <Form.Item label="Id" name="Id">
                    <Input disabled />
                </Form.Item>

                <Form.Item
                    label="Trên thiết bị"
                    name="DeviceName"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn thiết bị",
                        },
                    ]}
                >
                    <Select
                        disabled={isEdit}
                        onChange={onDeviceChange}
                        options={devices?.slice(1)}
                    ></Select>
                </Form.Item>

                <Form.Item
                    label="Tên trong máy"
                    name="UserName"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn người chấm công",
                        },
                    ]}
                >
                    <Select options={users} disabled={isEdit}></Select>
                </Form.Item>

                {isEdit && (
                    <Form.Item
                        label="Tên nhân viên"
                        name="Name"
                        rules={[
                            {
                                required: true,
                                message: "Vui lòng chọn thiết bị",
                            },
                        ]}
                    >
                        <Input disabled={isEdit} />
                    </Form.Item>
                )}
                <Form.Item
                    label="Ngày giờ"
                    name="VerifyDate"
                    getValueFromEvent={(onChange) => dayjs(onChange)}
                    getValueProps={(i) => ({ value: dayjs(i) })}
                >
                    <DatePicker showTime></DatePicker>
                </Form.Item>
                <Form.Item
                    wrapperCol={{
                        offset: 9,
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
