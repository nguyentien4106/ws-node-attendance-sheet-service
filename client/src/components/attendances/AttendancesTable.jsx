import { Button, Space, Table, Popconfirm, Modal } from "antd";
import React, { useRef, useState } from "react";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import AttendanceForm from "./AttendanceForm";
import dayjs from "dayjs";
import { DATE_FORMAT, DATE_SHOW_FORMAT, TIME_FORMAT } from "../../constants/common";
import writeXlsxFile from "write-excel-file"

export default function AttendancesTable({ attendances, sendJsonMessage, pagination, setPagination, filters, setFilters, totalRow, usersFilter, params }) {
    const employeeCodeFilter = [... new Set(usersFilter?.map(item => item.EmployeeCode))].map(item => ({ text: item, value: item }))
    const nameInDeviceFilter = [... new Set(usersFilter?.map(item => item.Name))].map(item => ({ text: item, value: item }))

    const columns = [
        {
            title: "Id",
            dataIndex: "Id",
            key: "Id",
            fixed: 'left',
            width: 60,
        },
        {
            title: "DeviceId",
            dataIndex: "DeviceId",
            key: "DeviceId",
            fixed: 'left',
            width: 80,
        },
        {
            title: "Thiết bị",
            dataIndex: "DeviceName",
            key: "DeviceName",
            filterSearch: true,
            width: 150,
        },
        {
            title: "User ID",
            dataIndex: "UserId",
            key: "UserId",
            width: 100,
        },
        {
            title: "Mã nhân viên",
            dataIndex: "EmployeeCode",
            key: "EmployeeCode",
            filters: employeeCodeFilter,
            onFilter: (value, record) => record.EmployeeCode === (value),
            filterSearch: true,
            width: 120,
        },
        {
            title: "Tên trong máy",
            dataIndex: "UserName",
            key: "UserName",
            filters: nameInDeviceFilter,
            onFilter: (value, record) => record.UserName === value,
            filterSearch: true,
            width: 150,
        },
        {
            title: "Tên nhân viên",
            dataIndex: "Name",
            key: "Name",
            width: 150,
        },
        {
            title: "Ngày (DD/MM/YYYY)",
            dataIndex: "VerifyDate",
            key: "Date",
            sorter: (a, b) =>
                Date.parse(a.VerifyDate) - Date.parse(b.VerifyDate),
            render: (value) => dayjs(value).format(DATE_SHOW_FORMAT),
            width: 130,
        },
        {
            title: "Giờ",
            dataIndex: "VerifyDate",
            key: "Time",
            render: (value) => {
                return dayjs(value).format(TIME_FORMAT)
            },
            width: 100,
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
                    <Space direction="vertical" size="small" className="w-full">
                        <img
                            width="32"
                            height="32"
                            src="https://img.icons8.com/color/48/cancel--v1.png"
                            alt="cancel--v1"
                        />
                        <Button type="primary" onClick={() => syncLog(rc)} size="small" block>
                            Đồng bộ ngay
                        </Button>
                    </Space>
            ),
            fixed: 'right',
            width: 150,

        },
        {
            title: "Thêm thủ công",
            dataIndex: "Manual",
            key: "Manual",
            fixed: 'right',
            width: 120,
            render: (value, rc) =>
                value ? (
                    <img
                        width="32"
                        height="32"
                        src="https://img.icons8.com/color/48/checkmark--v1.png"
                        alt="checkmark--v1"
                    />
                ) : (
                    ""
            ),
            filters: [{ text: "Yes", value: true}, { text: "No", value: false }],
            onFilter: (value, record) => record.Manual === value
        },
        {
            title: "Action",
            key: "Action",
            render: (record) => (
                <Space size="small" direction="vertical" className="w-full">
                    <Button onClick={() => setEditItem(record)} size="small" block>Sửa</Button>
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
                        <Button danger type="primary" size="small" block>
                            Xoá
                        </Button>
                    </Popconfirm>
                </Space>
            ),
            fixed: 'right',
            width: 100,

        },
    ];

    const [editItem, setEditItem] = useState(null);
    const { setLoading } = useLoading();
    const submitRef = useRef();
   
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

    const exportExcel = async () => {
        setLoading(true)
        const excelParams = JSON.parse(JSON.stringify(params))
        excelParams.tableParams.pagination = null;
        sendJsonMessage({
            type: RequestTypes.ExportExcel,
            data: excelParams
        })
    }

    return (
        <>
            <div className="flex justify-end mb-4">
                <Button
                    onClick={() => exportExcel()}
                    icon={
                        <img
                            width="20"
                            height="20"
                            src="https://img.icons8.com/color/48/ms-excel.png"
                            alt="ms-excel"
                            className="inline-block"
                        />
                    }
                    className="flex items-center gap-2"
                >
                    <span className="hidden sm:inline">Export Excel</span>
                </Button>
            </div>
            <Table
                rowKey={"Id"}
                dataSource={attendances}
                columns={columns}
                pagination={{ 
                    ...pagination, 
                    total: totalRow,
                    showSizeChanger: true,
                    showTotal: (total, range) => `${range[0]}-${range[1]} of ${total} items`,
                    responsive: true,
                }}
                onChange={handleTableChange}
                loading={false}
                scroll={{ 
                    x: 1500,
                    y: window.innerHeight - 400 
                }}
                size="middle"
                className="responsive-table"
            />

            {editItem && (
                <Modal
                    open={editItem}
                    onCancel={() => setEditItem(null)}
                    title={
                        <div className="text-center">
                            Thông tin chấm công
                        </div>
                    }
                    onOk={() => {
                        submitRef.current.click();
                        setEditItem(null);
                    }}
                    centered
                    width="90%"
                    style={{ maxWidth: 600 }}
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
