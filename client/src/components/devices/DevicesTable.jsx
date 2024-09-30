import React from "react";
import { Space, Table, Tag } from "antd";
import { RequestTypes } from "../../constants/requestType";

export default function DevicesTable({ sendJsonMessage, source }) {
  const columns = [
    {
      title: "Id",
      dataIndex: "Id",
      key: "id",
      render: (text) => <a>{text}</a>,
    },
    {
      title: "Ip",
      dataIndex: "Ip",
      key: "Ip",
    },
    {
      title: "Port",
      dataIndex: "Port",
      key: "Port",
    },
    {
      title: "CommKey",
      dataIndex: "CommKey",
      key: "CommKey",
    },
    {
      title: "IsConnected",
      dataIndex: "IsConnected",
      key: "IsConnected",
      render: (value, record) => (value ? "Connected" : "Disconnected"),
    },
    {
      title: "Action",
      key: "action",
      render: (_, record) => (
        <Space size="middle">
          <a onClick={() => handleStatus(record)}>
            {record.IsConnected ? "Disconnect" : "Connect"}
          </a>
        </Space>
      ),
    },
  ];

  const handleStatus = (record) => {
    console.log(record);
    if(record.IsConnected){
      sendJsonMessage({
        type: RequestTypes.ConnectDevice,
        
      })
    }
    else {
      sendJsonMessage({
        type: RequestTypes.ConnectDevice,
        data: record
      })
    }
  };
  return <Table columns={columns} dataSource={source} />;
}
