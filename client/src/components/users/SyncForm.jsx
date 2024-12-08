import React, { useEffect, useState } from "react";
import { Button, Form, Input, InputNumber, List, message, Select, Space } from "antd";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import { UserRoles } from "../../constants/userRoles";
import { copyToClipboard } from "../../helper/common";
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

const SyncData = 2;
const PullData = 4;
const LoadDataFromMachine = 5

const SyncForm = ({
    submitRef,
    sendJsonMessage,
    setOpen,
    devices,
    users,
    open,
    sheets,
}) => {
    const [form] = Form.useForm();
    const { setLoading } = useLoading();
    const [documentOptions, setDocumentOptions] = useState([]);
    const isPullUserFromSheet = open == PullData

    const onFinish = (values) => {
        setLoading(true);
        const device = devices.find(item => item.Id == values.Device)
        const getType = () => {
            if(open === SyncData){
                return RequestTypes.SyncUserData
            }

            return open === LoadDataFromMachine ? RequestTypes.LoadDataFromMachine : RequestTypes.PullUserData
        }
        sendJsonMessage({
            type: getType(),
            data: {
                Device: device.Ip ?? "",
                DocumentId: values.DocumentId,
                DeviceName: device.Name ?? ""
            },
        });
        setOpen(0);
    };

    const onReset = () => {
        form.resetFields();
    };

    const onChangeDevice = (val) => {
        setDocumentOptions(
            [
                ...new Set(
                    sheets
                        ?.filter((item) => item.DeviceId == val)
                        .map((item) => item.DocumentId)
                ),
            ].map((item) => ({ label: item, value: item }))
        );
    };

    return (
        <Form
            {...layout}
            form={form}
            onFinish={onFinish}
            style={{
                maxWidth: 1200,
                width: "100%",
            }}
            initialValues={{
                Devices: devices,
            }}
        >
            <Form.Item
                name="Device"
                label="Thiết bị"
                rules={[
                    {
                        required: true,
                        message: "Vui lòng điền thông tin."
                    },
                ]}
            >
                <Select
                    options={devices?.map((item) => ({
                        label: item.Name,
                        value: item.Id,
                    }))}
                    onChange={onChangeDevice}
                />
            </Form.Item>
            {isPullUserFromSheet && (
                <Form.Item
                    name="DocumentId"
                    label="Document Id"
                    rules={[
                        {
                            required: true,
                            message: "Vui lòng điền thông tin."
                        },
                    ]}
                >
                    <Select options={documentOptions} />
                </Form.Item>
            )}

            {
                isPullUserFromSheet && <List
                    size="small"
                    header={<h5 className="d-flex justify-content-center">Danh sách quyền</h5>}
                    footer={null}
                    bordered
                    dataSource={UserRoles}
                    renderItem={(item) => (
                        <List.Item>
                            <div className="d-flex gap-2">
                                {item.text}
                                <img
                                    onClick={async () => {
                                        await copyToClipboard(item.text)
                                        // navigator.clipboard.writeText(item.text)
                                        message.success(`Đã copy '${item.text}' vào bộ nhớ tạm.`)
                                    }}
                                    style={{ cursor: "pointer" }}
                                    width="16" height="16"
                                    src="https://img.icons8.com/ios/50/copy.png"
                                    alt={`Sao chép '${item.text}' vào bộ nhớ tạm`}
                                    title={`Sao chép '${item.text}' vào bộ nhớ tạm`}
                                />
                            </div>
                        </List.Item>
                    )}
                />
            }
            <Form.Item {...tailLayout}>
                <Space>
                    <Button type="primary" htmlType="submit" hidden ref={submitRef}>
                        Submit
                    </Button>
                </Space>
            </Form.Item>

        </Form>
    );
};
export default SyncForm;
