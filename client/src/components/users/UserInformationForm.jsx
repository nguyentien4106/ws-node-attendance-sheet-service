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

const regex = /^[\x00-\x7F]*$/;

function isValidInput(input) {
    return regex.test(input);
}

const UserInformationForm = ({
    submitRef,
    sendJsonMessage,
    setOpen,
    devices,
}) => {
    const [form] = Form.useForm();
    const { setLoading } = useLoading();
    const [deviceSelected, setDeviceSelected] = useState([])

    const onFinish = (values) => {
        setLoading(true);
        setOpen(false);
        sendJsonMessage({
            type: RequestTypes.AddUser,
            data: {...values, devices: deviceSelected.map(device => ({ ip: device.value, name: device.label }))},
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
                Devices: devices?.map((item) => item.Ip),
            }}
        >
            <Form.Item
                name="userId"
                label="Mã nhân viên"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập thông tin."
                    },
                ]}
            >
                <Input maxLength={9} placeholder="Mã nhân viên" />
            </Form.Item>

            <Form.Item
                name="name"
                label="Tên trong máy"
                tooltip="Lưu ý: trường này không được viết có dấu."
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập thông tin."

                    },
                    ({ }) => ({
                        validator(_, value) {
                            if(value.split(" ").every(isValidInput)){
                                return Promise.resolve()
                            }

                            return Promise.reject(new Error('Bạn chỉ có thể nhập tiếng anh không dấu và không chứa bất kỳ ký tự đặc biệt nào.'));
                        },
                    }),
                ]}
            >
                <Input maxLength={24} placeholder="Tên trong máy không được viết có dấu" />
            </Form.Item>
            <Form.Item
                name="displayName"
                label="Tên nhân viên"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập thông tin."

                    },
                ]}
                tooltip="Tên này dùng để hiện thị khi chấm công."
            >
                <Input maxLength={24} placeholder="Tên nhân viên" />
            </Form.Item>
            <Form.Item
                name="password"
                label="Mật khẩu"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập thông tin."

                    },
                ]}
            >
                <Input maxLength={24} placeholder="Mật khẩu người dùng" />
            </Form.Item>
            <Form.Item
                name="cardno"
                label="Mã thẻ từ"
                rules={[
                    {
                        message: "Vui lòng nhập thông tin."
                    },
                ]}

            >
                <Input 
                    type="number"
                    placeholder="Mã thẻ từ" 
                />
            </Form.Item>
            <Form.Item
                label="Quyền"
                name={"role"}
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập thông tin."

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
                        message: "Vui lòng nhập thông tin."

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
                    options={devices?.map((device) => ({
                        label: device.Name,
                        value: device.Ip,
                    }))}
                    onChange={(_, device) => setDeviceSelected(device)}
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
