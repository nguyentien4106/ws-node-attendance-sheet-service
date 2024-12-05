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
            filters: employeeCodeFilter,
            onFilter: (value, record) => record.EmployeeCode === (value),
            filterSearch: true,
        },
        {
            title: "Tên trong máy",
            dataIndex: "UserName",
            key: "UserName",
            filters: nameInDeviceFilter,
            onFilter: (value, record) => record.UserName === value,
            filterSearch: true,
        },
        {
            title: "Tên nhân viên",
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
            fixed: 'right'

        },
        {
            title: "Thêm thủ công",
            dataIndex: "Manual",
            key: "Manual",
            fixed: 'right',
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
        setLoading(true)
        const excelParams = JSON.parse(JSON.stringify(params))
        excelParams.tableParams.pagination = null;
        sendJsonMessage({
            type: RequestTypes.ExportExcel,
            data: excelParams
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
