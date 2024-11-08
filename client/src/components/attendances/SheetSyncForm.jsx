import React, { useState } from "react";
import { Button, DatePicker, Form, Input, Modal, Select } from "antd";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";

export default function SheetSyncForm({
    sendJsonMessage,
    submitRef,
    sheets
}) {
    const [form] = Form.useForm();
    const { setLoading } = useLoading();
    const documentOptions = [...new Set(sheets.map(item => item.DocumentId))].map(item => ({ label: item, value: item }))
    const [sheetNameOptions, setSheetNameOptions] = useState([])

    const onFinish = (values) => {
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.SyncDataFromSheet,
            data: values
        })
    };

    const onSheetChange = (val) => {
        setSheetNameOptions(sheets?.filter(item => item.DocumentId === val).map(item => ({ label: item.SheetName, value: item.SheetName })))
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
                onFinish={onFinish}
                autoComplete="off"
            >

                <Form.Item
                    label="Document"
                    name="DocumentId"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn Document",
                        },
                    ]}
                >
                    <Select
                        onChange={onSheetChange}
                        options={documentOptions}
                    ></Select>
                </Form.Item>

                <Form.Item
                    label="Sheet Name"
                    name="SheetName"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng chọn Sheet Name",
                        },
                    ]}
                >
                    <Select 
                        options={sheetNameOptions} 
                    ></Select>
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
