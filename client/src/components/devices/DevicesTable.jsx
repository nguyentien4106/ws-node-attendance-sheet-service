import React, { useRef, useState } from "react";
import { Button, Space, Table, Tag, Popconfirm, Modal } from "antd";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import UserInformationForm from "../users/UserInformationForm";

export default function DevicesTable({ sendJsonMessage, source }) {
  const columns = [
    {
      title: "Id",
      dataIndex: "Id",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Tên thiết bị",
      dataIndex: "Name",
      key: "Name",
    },
    {
      title: "Ip thiết bị",
      dataIndex: "Ip",
      key: "Ip",
    },
    Table.EXPAND_COLUMN,
    {
      title: "Trạng thái",
      dataIndex: "IsConnected",
      key: "IsConnected",
      render: (value, record) =>
        value ? (
          <img
            width="48"
            height="48"
            src="https://img.icons8.com/color/48/checkmark--v1.png"
            alt="checkmark--v1"
          />
        ) : (
          <img
            width="32"
            height="32"
            src="https://img.icons8.com/dusk/64/disconnected--v2.png"
            alt="disconnected--v2"
          />
        ),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <Popconfirm
            title={`${record.Name} - ${record.Ip}`}
            description="Bạn có muốn xóa thiết bị này?"
            onConfirm={(e) => {
              console.log(e);
              handleDelete(record);
            }}
            onCancel={() => {}}
            okText="Yes"
            cancelText="No"
          >
            <Button danger type="primary" disabled={record.IsConnected}>
              Delete
            </Button>
          </Popconfirm>
          <Button
            onClick={() => handleStatus(record)}
            danger={record.IsConnected}
            color="#1231da"
          >
            {record.IsConnected ? "Ngắt kết nối" : "Kết nối"}
          </Button>
        </Space>
      ),
    },
  ];

  const handleStatus = (record) => {
    setLoading(true);
    sendJsonMessage({
      type: record.IsConnected
        ? RequestTypes.DisconnectDevice
        : RequestTypes.ConnectDevice,
      data: record,
    });
  };

  const handleDelete = (record) => {
    setLoading(true);
    sendJsonMessage({
      type: RequestTypes.RemoveDevice,
      data: record,
    });
  };

  const [open, setOpen] = useState(false);
  const [device, setDevice] = useState(null);

  const { setLoading } = useLoading();
  const submitUserFormRef = useRef();
  console.log(source)
  return (
    <>
      <Modal
        title={
          <div className="d-flex justify-content-center">User Information</div>
        }
        open={open}
        onOk={() => {
          submitUserFormRef.current.click();
        }}
        onCancel={() => setOpen(false)}
        style={{
          width: "50%",
        }}
      >
        <UserInformationForm
          setOpen={setOpen}
          submitRef={submitUserFormRef}
          sendJsonMessage={sendJsonMessage}
          device={device}
        />
      </Modal>
      <Table
        columns={columns}
        dataSource={source}
        rowKey={"Id"}
        expandable={{
          expandedRowRender: (record) => (
            <p
              style={{
                margin: 0,
              }}
            >
              {record.Sheets}
            </p>
          ),
          showExpandColumn: false,
          defaultExpandAllRows: true,
        }}
      />
    </>
  );
}
