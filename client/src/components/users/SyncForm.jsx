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

const SyncData = 2;

const SyncForm = ({
  submitRef,
  sendJsonMessage,
  setOpen,
  devices,
  users,
  open,
}) => {
  const [form] = Form.useForm();
  const { setLoading } = useLoading();
  const onFinish = (values) => {
    setLoading(true);
    const data =
      open === SyncData
        ? {
            type: RequestTypes.SyncUserData,
            data: {
              sheet: values,
              users: users,
            },
          }
        : {
            type: RequestTypes.PullUserData,
            data: values,
          };
    sendJsonMessage(data);
    setOpen(0);
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
        Devices: devices,
      }}
    >
      <Form.Item
        name="SheetName"
        label="SheetName"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      <Form.Item
        name="DocumentId"
        label="Document Id"
        rules={[
          {
            required: true,
          },
        ]}
      >
        <Input />
      </Form.Item>

      {open !== SyncData && (
        <Form.Item
          name="Device"
          label="Thiết bị"
          rules={[
            {
              required: true,
            },
          ]}
        >
          <Select
            options={devices?.map((item) => ({
              label: item.Name,
              value: item.Ip,
            }))}
          />
        </Form.Item>
      )}

      <Form.Item {...tailLayout}>
        <Space>
          <Button type="primary" htmlType="submit" hidden ref={submitRef}>
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
export default SyncForm;
