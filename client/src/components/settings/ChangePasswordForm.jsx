import React from 'react';
import { Button, Form, Input, Space } from 'antd';
import { RequestTypes } from '../../constants/requestType';
import { useLoading } from '../../context/LoadingContext';
import { isAdmin } from '../../helper/common';
const ChangePasswordForm = ({ submitRef, sendJsonMessage, email }) => {
    const [form] = Form.useForm();
    const { setLoading } = useLoading()

    const onFinish = (values) => {
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.ChangePassword,
            data: Object.assign(values, { email, isAdmin: isAdmin })
        })
    }

    return (
        <Form
            form={form}
            name="dependencies"
            autoComplete="off"
            style={{
                maxWidth: 600,
            }}
            layout="vertical"
            onFinish={onFinish}
            initialValues={{
                email: email
            }}
        >
            <Form.Item
                label="Tài khoản"
                name="email"

            >
                <Input disabled />

            </Form.Item>
            {
                !isAdmin && <Form.Item
                    label="Mật khẩu hiện tại"
                    name="currentPassword"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng nhập mật khẩu hiện tại."
                        },
                    ]}
                >
                    <Input.Password />

                </Form.Item>
            }
            <Form.Item
                label="Mật khẩu mới"
                name="password"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập mật khẩu mới."

                    },
                ]}
            >
                <Input.Password />
            </Form.Item>

            {/* Field */}
            <Form.Item
                label="Xác nhận mật khẩu mới"
                name="password2"
                dependencies={['password']}
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập xác nhận mật khẩu."
                    },
                    ({ getFieldValue }) => ({
                        validator(_, value) {
                            if (!value || getFieldValue('password') === value) {
                                return Promise.resolve();
                            }
                            return Promise.reject(new Error('Mật khẩu mới bạn nhập không trùng khớp'));
                        },
                    }),
                ]}
            >
                <Input.Password />

            </Form.Item>
            <Form.Item>
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
export default ChangePasswordForm;