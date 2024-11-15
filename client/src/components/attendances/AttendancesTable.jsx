import { Button, Space, Table, Popconfirm, Modal } from "antd";
import React, { useRef, useState } from "react";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import AttendanceForm from "./AttendanceForm";
import dayjs from "dayjs";
import { DATE_FORMAT, DATE_SHOW_FORMAT, TIME_FORMAT } from "../../constants/common";
import utc from 'dayjs/plugin/utc'
import writeXlsxFile from "write-excel-file"

dayjs.extend(utc)

export default function AttendancesTable({ attendances, sendJsonMessage }) {
    const deviceNameFilters = [
        ...new Set(attendances?.map((item) => item.DeviceName)),
    ].map((item) => ({ text: item, value: item }));

    const userNameFilters = [
        ...new Set(attendances?.map((item) => item.UserName)),
    ].map((item) => ({ text: item, value: item }));

    console.log(attendances)
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
            title: "Ngày (DD/MM/YYYY)",
            dataIndex: "VerifyDate",
            key: "Date",
            sorter: (a, b) =>
                Date.parse(a.VerifyDate) - Date.parse(b.VerifyDate),
            render: (value) => dayjs(value).format(DATE_SHOW_FORMAT),
        },
        {
            title: "Giờ",
            dataIndex: "VerifyDate",
            key: "Time",
            render: (value) => {
                return dayjs(value).format(TIME_FORMAT)
            },
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
                        onCancel={() => { }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button danger type="primary">
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
            data: Object.assign(rc, { VerifyDate: dayjs(rc.VerifyDate).format(DATE_FORMAT + " " + TIME_FORMAT)}),
        });
    };

    const handleDelete = (rc) => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.DeleteLog,
            data: rc,
        });
    };
    const [editItem, setEditItem] = useState(null);
    const { setLoading } = useLoading();
    const submitRef = useRef();

    const exportExcel = async () => {
        const schema = [
            {
                column: 'Id',
                type: Number,
                value: att => att.Id
            },
            {
                column: 'ID Thiết bị',
                type: Number,
                value: att => att.DeviceId
            },
            {
                column: 'Tên thiết bị',
                type: String,
                value: att => att.DeviceName
            },
            {
                column: 'User Id',
                type: String,
                value: att => att.UserId
            },
            {
                column: 'Tên trong máy',
                type: String,
                value: att => att.UserName
            },
            {
                column: 'Tên hiển thị',
                type: String,
                value: att => att.Name
            },
            {
                column: 'Ngày (DD/MM/YYYY)',
                type: String,
                value: att => dayjs(new Date(att.VerifyDate)).format(DATE_SHOW_FORMAT)
            },
            {
                column: 'Giờ',
                type: String,
                value: att => dayjs(new Date(att.VerifyDate)).format(TIME_FORMAT)
            },
        ]
        await writeXlsxFile(attendances, {
            schema, // (optional) column widths, etc.
            fileName: `Attendances_Report.xlsx`
        })
    }
    return (
        <>
            <div
                style={{
                    marginBottom: 20,
                    cursor: "pointer",
                }}
                className="d-flex justify-content-end"
                onClick={() => {
                    exportExcel()
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

            {editItem && (
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
            )}
        </>
    );
}
