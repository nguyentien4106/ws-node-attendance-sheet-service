import { Button, Space, Table, Popconfirm, Modal } from "antd";
import React, { useEffect, useRef, useState } from "react";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import AttendanceForm from "./AttendanceForm";
import dayjs from "dayjs";
import { DATE_FORMAT, DATE_SHOW_FORMAT, TIME_FORMAT } from "../../constants/common";
import writeXlsxFile from "write-excel-file"

export default function AttendancesTable({ attendances, sendJsonMessage, pagination, setPagination, filters, setFilters, totalRow }) {
    const nameFilter = [
        ...new Set(attendances?.map((item) => item.Name)),
    ].map((item) => ({ text: item, value: item }));

    const columns = [
        {
            title: "Id",
            dataIndex: "Id",
            key: "Id",
            fixed: 'left'
        },
        {
            title: "Thiết bị",
            dataIndex: "DeviceName",
            key: "DeviceName",
            filterSearch: true,
        },
        {
            title: "User ID",
            dataIndex: "UserId",
            key: "UserId",
        },
        {
            title: "Mã nhân viên",
            dataIndex: "EmployeeCode",
            key: "EmployeeCode",
            
        },
        {
            title: "Tên trong máy",
            dataIndex: "UserName",
            key: "UserName",
        },
        {
            title: "Tên nhân viên",
            dataIndex: "Name",
            key: "Name",
            filters: nameFilter,
            onFilter: (value, record) => record.Name === (value),
            filterSearch: true,
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
            fixed: 'right'

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
            fixed: 'right'

        },
    ];

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
                column: 'Mã nhân viên',
                type: String,
                value: att => att.EmployeeCode
            },
            {
                column: 'Tên trong máy',
                type: String,
                value: att => att.UserName
            },
            {
                column: 'Tên nhân viên',
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

    const handleTableChange = (pag, ft) => {
        if(JSON.stringify(pag) !== JSON.stringify(pagination)){
            setPagination(prev => ({ ...prev, current: pag.current, pageSize: pag.pageSize }));
        }

        if(JSON.stringify(filters) !== JSON.stringify(ft)){
            setFilters(ft)
        }
    };
    
    const syncLog = (rc) => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.SyncLogData,
            data: Object.assign(rc, { VerifyDate: dayjs(rc.VerifyDate).format(DATE_FORMAT + " " + TIME_FORMAT) }),
        });
    };

    const handleDelete = (rc) => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.DeleteLog,
            data: rc,
        });
    };

    return (
        <>
            <div
                className="d-flex justify-content-end"
            >
                <img
                    onClick={() => {
                        exportExcel()
                    }}
                    width="32"
                    height="32"
                    src="https://img.icons8.com/color/48/ms-excel.png"
                    alt="ms-excel"
                    style={{
                        cursor: "pointer",
                        marginBottom: 20,
                    }}
                />
            </div>
            <Table
                rowKey={"Id"}
                dataSource={attendances}
                columns={columns}
                pagination={{ ...pagination, total: totalRow }}
                onChange={handleTableChange}
                loading={false}
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
