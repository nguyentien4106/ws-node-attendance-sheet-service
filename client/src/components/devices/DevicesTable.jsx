import React from 'react';
import { Space, Table, Tag } from 'antd';


const columns = [
  {
    title: 'Id',
    dataIndex: 'Id',
    key: 'id',
    render: (text) => <a>{text}</a>,
  },
  {
    title: 'Ip',
    dataIndex: 'Ip',
    key: 'Ip',
  },
  {
    title: 'Port',
    dataIndex: 'Port',
    key: 'Port',
  },
  {
    title: 'CommKey',
    dataIndex: 'CommKey',
    key: 'CommKey',
  },
  {
    title: 'IsConnected',
    dataIndex: 'IsConnected',
    key: 'IsConnected',
  },
  {
    title: 'Action',
    key: 'action',
    render: (_, record) => (
      <Space size="middle">
        <a>Invite {record.name}</a>
        <a>Delete</a>
      </Space>
    ),
  },
];

export default function DevicesTable(props){
    console.log(props)
    return <Table columns={columns} dataSource={[]} />;
}