import { Button, Space, Table, Popconfirm, Modal } from "antd";
import React, { useRef, useState } from "react";
import { RequestTypes } from "../../constants/requestType";
import { Excel } from "antd-table-saveas-excel";
import { renderDateTimeString } from "../../helper/timeHelper";
import { useLoading } from "../../context/LoadingContext";
import AttendanceForm from "./AttendanceForm";
import dayjs from "dayjs";
import { DATE_TIME_FORMAT } from "../../constants/common";

export default function AttendancesTable({ attendances, sendJsonMessage }) {
    const deviceNameFilters = [
        ...new Set(attendances.map((item) => item.DeviceName)),
    ].map((item) => ({ text: item, value: item }));

    const userNameFilters = [
        ...new Set(attendances.map((item) => item.UserName)),
    ].map((item) => ({ text: item, value: item }));

    const columns = [
        {
            title: "Id",
            dataIndex: "Id",
            key: "Id",
        },
        {
            title: "ID Thiết bị",
            dataIndex: "DeviceId",
            key: "DeviceId",
        },
        {
            title: "Tên thiết bị",
            dataIndex: "DeviceName",
            key: "DeviceName",
            filters: deviceNameFilters,
            onFilter: (value, record) => record.DeviceName?.startsWith(value),
            filterSearch: true,
        },
        {
            title: "UserId",
            dataIndex: "UserId",
            key: "UserId",
        },
        {
            title: "Tên trong máy",
            dataIndex: "UserName",
            key: "UserName",
            filters: userNameFilters,
            onFilter: (value, record) => record.UserName?.startsWith(value),
            filterSearch: true,
        },
        {
            title: "Tên hiển thị",
            dataIndex: "Name",
            key: "Name",
        },
        {
            title: "Ngày giờ",
            dataIndex: "VerifyDate",
            key: "VerifyDate",
            sorter: (a, b) =>
                Date.parse(a.VerifyDate) - Date.parse(b.VerifyDate),
            render: (value) => dayjs(value).format(DATE_TIME_FORMAT),
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
                        <img
                            width="32"
                            height="32"
                            src="https://img.icons8.com/color/48/cancel--v1.png"
                            alt="cancel--v1"
                        />
                        <Button type="primary" onClick={() => syncLog(rc)}>
                            Đồng bộ ngay
                        </Button>
                    </Space>
                ),
        },
        {
            title: "Action",
            key: "Action",
            render: (record) => (
                <Space>
                    <Button onClick={() => setEditItem(record)}>Sửa</Button>
                    <Popconfirm
                        title={`Record ID : ${record?.Id}`}
                        description="Bạn có muốn xóa record này?"
                        onConfirm={(e) => {
                            handleDelete(record);
                        }}
                        onCancel={() => {}}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            danger
                            type="primary"
                        >
                            Xoá
                        </Button>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const syncLog = (rc) => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.SyncLogData,
            data: rc,
        });
    };

    const handleDelete = (rc) => {
        console.log(rc)
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.DeleteLog,
            data: rc
        })
    }
    const [editItem, setEditItem] = useState(null);
    const { setLoading } = useLoading();
    const submitRef = useRef();

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
            <Table
                rowKey={"Id"}
                dataSource={attendances}
                columns={columns}
                pagination={{
                    pageSize: 100,
                    pageSizeOptions: [50, 100, 500],
                }}
            ></Table>

            <Modal
                open={editItem}
                onCancel={() => setEditItem(null)}
                title={
                    <div className="d-flex justify-content-center">
                        Thông tin chấm công
                    </div>
                }
                onOk={() => {
                    submitRef.current.click();
                    setEditItem(null);
                }}
            >
                <AttendanceForm
                    attendance={editItem}
                    sendJsonMessage={sendJsonMessage}
                    submitRef={submitRef}
                ></AttendanceForm>
            </Modal>
        </>
    );
}
