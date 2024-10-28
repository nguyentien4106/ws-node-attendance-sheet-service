import { Button, Space, Table, Popconfirm, Modal } from "antd";
import React, { useState } from "react";
import { RequestTypes } from "../../constants/requestType";
import { Excel } from "antd-table-saveas-excel";
import { FileExcelOutlined } from "@ant-design/icons";
import { renderDateTimeString } from "../../helper/timeHelper";
import { useLoading } from "../../context/LoadingContext";
import AttendanceForm from "./AttendanceForm";

export default function AttendancesTable({ attendances, sendJsonMessage }) {
  const deviceNameFilters = [
    ...new Set(attendances.map((item) => item.DeviceName)),
  ].map((item) => ({ text: item, value: item }));

  const userNameFilters = [
    ...new Set(attendances.map((item) => item.UserName)),
  ].map((item) => ({ text: item, value: item }));

  const renderContent = (value, row, index) => {
    const obj = {
      children: value,
      props: {},
    };

    return obj;
  };

  const columns = [
    {
      title: "Id",
      dataIndex: "Id",
      key: "Id",
      render: renderContent,
    },
    {
      title: "Device Id",
      dataIndex: "DeviceId",
      key: "DeviceId",
      render: renderContent,
    },
    {
      title: "DeviceName",
      dataIndex: "DeviceName",
      key: "DeviceName",
      filters: deviceNameFilters,
      onFilter: (value, record) => record.DeviceName?.startsWith(value),
      filterSearch: true,
      render: renderContent,
    },
    {
      title: "UserId",
      dataIndex: "UserId",
      key: "UserId",
      render: renderContent,
    },
    {
      title: "UserName",
      dataIndex: "UserName",
      key: "UserName",
      filters: userNameFilters,
      onFilter: (value, record) => record.UserName?.startsWith(value),
      filterSearch: true,
      render: renderContent,
    },
    {
      title: "Name",
      dataIndex: "Name",
      key: "Name",
      render: renderContent,
    },
    {
      title: "Att Time",
      dataIndex: "VerifyDate",
      key: "VerifyDate",
      sorter: (a, b) => Date.parse(a.VerifyDate) - Date.parse(b.VerifyDate),
      render: (value) => renderDateTimeString(value),
    },
    {
      title: "Trạng thái đồng bộ",
      dataIndex: "Uploaded",
      key: "Uploaded",
      render: (value, rc) =>
        value ? (
          <img
            width="32"
            height="32"
            src="https://img.icons8.com/color/48/checkmark--v1.png"
            alt="checkmark--v1"
          />
        ) : (
          <Space>
            <img width="32" height="32" src="https://img.icons8.com/color/48/cancel--v1.png" alt="cancel--v1"/>
            <Button type="primary" onClick={() => syncLog(rc)}>
                Đồng bộ ngay
            </Button>
          </Space>
        ),
    },
    {
      title: "Action",
      key: "Action",
      render: (record) => {
        console.log(record)
        return <Button onClick={() => setEditItem(record)}>Sửa</Button>
      },
    },
  ];

  const syncLog = (rc) => {
    setLoading(true)
    sendJsonMessage({
        type: RequestTypes.SyncLogData,
        data: rc
    })
  }
  const [ editItem, setEditItem] = useState(null)
  const { setLoading } = useLoading()

  return (
    <>
      <div
        style={{
          marginBottom: 20,
          cursor: "pointer",
        }}
        className="d-flex justify-content-end"
        onClick={() => {
          const excel = new Excel();
          excel
            .addSheet("data")
            .addColumns(columns)
            .addDataSource(attendances, {
              str2Percent: true,
            })
            .setRowHeight(5, "cm")
            .saveAs("Attendances.xlsx");
        }}
      >
        <img
          width="16"
          height="16"
          src="https://img.icons8.com/color/48/ms-excel.png"
          alt="ms-excel"
        />
      </div>
      <Table rowKey={"Id"} dataSource={attendances} columns={columns} pagination={{
        pageSize: 100,
        pageSizeOptions: [50, 100, 500]
      }}></Table>

      <Modal
        open={editItem}
        onCancel={() => setEditItem(null)}
      >
        <AttendanceForm attendance={editItem}></AttendanceForm>
      </Modal>
    </>
  );
}
