import { Button, Form, Input, message } from "antd";
import { getAPIUrl } from "../helper/common";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)

    const onFinish = (values) => {
        setLoading(true)
        fetch(`${getAPIUrl()}/login`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(values)
        })
            .then(res => res.json())
            .then(res => {
                setLoading(false)
                console.log('res', res)
                if (res.isSuccess) {
                    login(res.data.email)
                    message.success('Đăng nhập thành công!')
                    navigate("/")
                }
                else {
                    message.error(res.message || 'Đăng nhập thất bại')
                }
            })
            .catch(err => {
                setLoading(false)
                message.error('Có lỗi xảy ra. Vui lòng thử lại.')
            })
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
            <div className="w-full max-w-md">
                {/* Logo and Title Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-4 shadow-lg">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">SBOX SERVER</h1>
                    <p className="text-gray-600">Hệ thống quản lý chấm công</p>
                </div>

                {/* Login Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h2 className="text-2xl font-semibold text-gray-800 mb-6 text-center">Đăng nhập</h2>
                    
                    <Form
                        name="login"
                        layout="vertical"
                        onFinish={onFinish}
                        autoComplete="on"
                        size="large"
                    >
                        <Form.Item
                            label={<span className="font-medium text-gray-700">Email</span>}
                            name="email"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập email",
                                },
                                {
                                    type: 'email',
                                    message: 'Email không hợp lệ',
                                }
                            ]}
                        >
                            <Input 
                                placeholder="Nhập email của bạn"
                                className="rounded-lg"
                                prefix={
                                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                }
                            />
                        </Form.Item>

                        <Form.Item
                            label={<span className="font-medium text-gray-700">Mật khẩu</span>}
                            name="password"
                            rules={[
                                {
                                    required: true,
                                    message: "Vui lòng nhập mật khẩu",
                                },
                            ]}
                        >
                            <Input.Password 
                                placeholder="Nhập mật khẩu"
                                className="rounded-lg"
                                prefix={
                                    <svg className="w-5 h-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                }
                            />
                        </Form.Item>

                        <Form.Item className="mb-0">
                            <Button 
                                type="primary" 
                                htmlType="submit" 
                                block 
                                className="h-12 rounded-lg font-semibold text-base shadow-md hover:shadow-lg transition-all"
                                loading={loading}
                            >
                                {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                            </Button>
                        </Form.Item>
                    </Form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-200"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-4 bg-white text-gray-500">Hoặc</span>
                        </div>
                    </div>

                    {/* Additional Info */}
                    <div className="text-center text-sm text-gray-600">
                        <p>Bạn quên mật khẩu? 
                            <a href="#" className="text-primary font-medium ml-1 hover:underline">
                                Liên hệ quản trị viên
                            </a>
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-6 text-sm text-gray-600">
                    <p>© 2025 SBOX SERVER. All rights reserved.</p>
                </div>
            </div>
        </div>
    )
};
export default Login;
