import React, { useEffect, useRef, useState } from "react";
import {
    Button,
    Space,
    Table,
    Popconfirm,
    Modal,
    Tooltip,
    message,
    DatePicker,
} from "antd";
import { RequestTypes } from "../../constants/requestType";
import { useLoading } from "../../context/LoadingContext";
import UserInformationForm from "../users/UserInformationForm";
import dayjs from "dayjs";
import { DATE_FORMAT, TIME_FORMAT } from "../../constants/common";
import { DELETE_ATTENDANCES_TEXT, SYNC_ALL_ATTENDANCES_TEXT, SYNC_ATTENDANCES_BY_TIMES_TEXT } from "../../constants/text";

const { RangePicker } = DatePicker;

const OPEN_TYPES = {
    CLOSE: 0,
    USER_FORM: 1,
    SYNC_DATA_FORM: 2,
};

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
            width: 500
        },
        {
            title: "Ip thiết bị",
            dataIndex: "Ip",
            key: "Ip",
        },
        {
            title: "Số Serial",
            dataIndex: "SN",
            key: "SN",
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
            title: "Hành động",
            key: "action",
            render: (_, record) => (
                <Space size="middle">
                    <Popconfirm
                        title={`${record?.Name} - ${record?.Ip}`}
                        description="Bạn có muốn xóa thiết bị này?"
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
                            disabled={record?.IsConnected}
                        >
                            Xoá
                        </Button>
                    </Popconfirm>
                    <Button
                        onClick={() => handleStatus(record)}
                        danger={record?.IsConnected}
                        color="#1231da"
                    >
                        {record?.IsConnected ? "Ngắt kết nối" : "Kết nối"}
                    </Button>
                    <Tooltip
                        title="Đồng bộ dữ liệu chấm công từ máy chấm công lên hệ thống."
                        color="#108ee9"
                    >
                        <Popconfirm
                            title={<p>Đồng bộ dữ liệu từ thiết bị: <u><i>{record.Name}</i></u></p>}
                            description={<p style={{ maxWidth: 500 }}>{SYNC_ALL_ATTENDANCES_TEXT}</p>}
                            onConfirm={(e) => {
                                handleSyncData(record);
                            }}
                            onCancel={() => {}}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button 
                                disabled={!record?.IsConnected}
                            >
                                Đồng bộ toàn bộ dữ liệu
                            </Button>
                        </Popconfirm>
                    </Tooltip>

                    <Tooltip
                        title={SYNC_ATTENDANCES_BY_TIMES_TEXT}
                        color="#108ee9"
                    >
                        <Button
                            disabled={!record?.IsConnected}
                            onClick={() => {
                                setOpen(OPEN_TYPES.SYNC_DATA_FORM)
                                setDevice(record)
                            }}
                        >
                            Đồng bộ dữ liệu theo thời gian
                        </Button>
                    </Tooltip>
                    <Tooltip
                        title="Toàn bộ dữ liệu trong máy chấm công sẽ bị xóa sau khi dùng chức năng này."
                        color="#108ee9"
                    >
                       <Popconfirm
                            title={<p>Xóa toàn bộ dữ liệu trong thiết bị: <u><i>{record.Name}</i></u></p>}
                            description={<p style={{ maxWidth: 500}}>{DELETE_ATTENDANCES_TEXT}</p>}
                            onConfirm={(e) => {
                                handleClearDataAttendance(record);
                            }}
                            onCancel={() => {}}
                            okText="Yes"
                            cancelText="No"
                        >
                            <Button 
                                disabled={!record?.IsConnected}
                            >
                                Xóa toàn bộ dữ liệu chấm công
                            </Button>
                        </Popconfirm>
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleClearDataAttendance = (record) => {
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.DeviceClearAttendances,
            data: record,
        });
    }

    const handleSyncData = (record) => {
        message.info(
            "Yêu cầu đồng bộ đã được gửi đi. Vui lòng chờ cho tới khi có thông báo mới."
        );
        setLoading(true)
        sendJsonMessage({
            type: RequestTypes.SyncData,
            data: {
                Ip: record.Ip,
                type: "All",
                value: record
            },
        });
    };

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

    const [open, setOpen] = useState(OPEN_TYPES.CLOSE);
    const { setLoading } = useLoading();
    const defaultRange = [dayjs().add(-1, 'day'), dayjs()]
    const [range, setRange] = useState(defaultRange)
    const [device, setDevice] = useState(null)
    const submitUserFormRef = useRef();

    return (
        <>
            <Modal
                title={
                    <div className="d-flex justify-content-center">
                        {open === OPEN_TYPES.USER_FORM
                            ? "Thông tin người dùng"
                            : "Khoảng thời gian cần đồng bộ"}
                    </div>
                }
                open={open}
                onOk={() => {
                    setLoading(true)

                    if (open === OPEN_TYPES.USER_FORM) {
                        submitUserFormRef.current.click();
                        return;
                    }

                    if (open === OPEN_TYPES.SYNC_DATA_FORM) {
                        setOpen(OPEN_TYPES.CLOSE)
                        sendJsonMessage({
                            type: RequestTypes.SyncData,
                            data: {
                                Ip: device.Ip,
                                type: "ByTime",
                                fromDate: range[0].format(DATE_FORMAT + " " + TIME_FORMAT),
                                toDate: range[1].format(DATE_FORMAT + " " + TIME_FORMAT)
                            },
                        })
                        return;
                    }
                }}
                onCancel={() => setOpen(OPEN_TYPES.CLOSE)}
                style={{
                    width: "50%",
                }}
            >
                {open && open === OPEN_TYPES.USER_FORM ? (
                    <UserInformationForm
                        setOpen={setOpen}
                        submitRef={submitUserFormRef}
                        sendJsonMessage={sendJsonMessage}
                    />
                ) : (
                    <Space className="d-flex justify-content-center p-10">
                        <RangePicker
                            defaultValue={defaultRange}
                            showTime
                            
                            maxDate={dayjs()}
                            onChange={(val) => {
                                setRange(val)
                            }}
                            
                        ></RangePicker>
                    </Space>
                )}
            </Modal>
            <Table
                columns={columns}
                dataSource={source}
                rowKey={"Id"}
                expandable={{
                    expandedRowRender: (record) => (
                        <table>
                            <thead>
                                <tr>
                                    <th>Sheet Name</th>
                                    <th>Document Id</th>
                                </tr>
                            </thead>
                            <tbody>
                                {record?.Sheets?.map((sheet) => (
                                    <tr
                                        key={`${sheet.DocumentId} ${sheet.SheetName}`}
                                    >
                                        <td>{sheet.SheetName}</td>
                                        <td>{sheet.DocumentId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ),
                    showExpandColumn: false,
                    defaultExpandAllRows: true,
                }}
                scroll={{ x: 700 }}
            />
        </>
    );
}
