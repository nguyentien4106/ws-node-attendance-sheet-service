import React from "react";
import { Button, Checkbox, Form, Input, message } from "antd";
import { getAPIUrl } from "../helper/common";
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate()
    const onFinish = (values) => {
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
            console.log(res.data)
            if(res.isSuccess){
                sessionStorage.setItem("auth", res.data.email)
                navigate(window.location.pathname)
                window.location.reload()
            }
            else{
                message.error(res.message)
            }
        })
    };

    return (
        <Form
            name="basic"
            labelCol={{
                span: 8,
            }}
            wrapperCol={{
                span: 16,
            }}
            style={{
                maxWidth: 1000,
                width: "30%"
            }}
            onFinish={onFinish}
            autoComplete="on"
        >
            <Form.Item
                label="Username"
                name="email"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập email",
                    },
                ]}
            >
                <Input />
            </Form.Item>
    
            <Form.Item
                label="Password"
                name="password"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng nhập mật khẩu",
                    },
                ]}
            >
                <Input.Password />
            </Form.Item>
    
            <Form.Item label={""} name={"a"}>
                <Button type="primary" htmlType="submit" style={{ marginLeft: "80px"}}>
                    Submit
                </Button>
            </Form.Item>
        </Form>
    )
};
export default Login;
