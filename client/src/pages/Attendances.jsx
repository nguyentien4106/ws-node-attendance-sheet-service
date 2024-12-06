import React, { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { useLoading } from "../context/LoadingContext";
import { RequestTypes } from "../constants/requestType";
import AttendancesTable from "../components/attendances/AttendancesTable";
import { Button, DatePicker, message, Modal, Select, Space } from "antd";
import dayjs from "dayjs";
import { DATE_FORMAT, DATE_SHOW_FORMAT, TIME_FORMAT } from "../constants/common";
import AttendanceForm from "../components/attendances/AttendanceForm";
import { getHostUrl, isAuth } from "../helper/common";
import Auth from "../layout/Auth";
import writeXlsxFile from "write-excel-file"

const { RangePicker } = DatePicker;
const WS_URL = getHostUrl();

const OPEN_TYPES = {
    CLOSE: 0,
    ADD: 1,
    SYNC: 2,
};

const defaultPagination = {
    current: 1,
    pageSize: 10,
    pageSizeOptions: [10, 50, 100],
}

const schema = [
    { column: "Id", type: Number, value: (att) => att.Id },
    { column: "Tên thiết bị", type: String, value: (att) => att.DeviceName },
    { column: "User Id", type: String, value: (att) => att.UserId },
    { column: "Mã nhân viên", type: String, value: (att) => att.EmployeeCode },
    { column: "Tên trong máy", type: String, value: (att) => att.UserName },
    { column: "Tên nhân viên", type: String, value: (att) => att.Name },
    { column: "Ngày (DD/MM/YYYY)", type: String, value: (att) => dayjs(new Date(att.VerifyDate)).format(DATE_SHOW_FORMAT) },
    { column: "Giờ", type: String, value: (att) => dayjs(new Date(att.VerifyDate)).format(TIME_FORMAT) },
    { column: "Thêm thủ công", type: String, value: (att) => (att.Manual ? "X" : "") },
];

export default function Attendances() {
    const { setLoading } = useLoading();
    const [attendances, setAttendances] = useState([]);
    const [devices, setDevices] = useState([]);
    const [users, setUsers] = useState([]);
    const [open, setOpen] = useState(OPEN_TYPES.CLOSE);
    const submitRef = useRef();
    const [pagination, setPagination] = useState(defaultPagination);
    const [filters, setFilters] = useState({ EmployeeCode: null, UserName: null, Manual: null })
    const [totalRow, setTotalRow] = useState(0)
    const [usersFilter, setUsersFilter] = useState([])
    const [params, setParams] = useState({
        deviceId: "All",
        fromDate: dayjs().add(-3, "M").format(DATE_FORMAT),
        toDate: dayjs().add(1, "days").format(DATE_FORMAT),
        tableParams: {
            pagination,
            filters,
        },
    });

    const { sendJsonMessage } = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connection established.");
        },
        onClose: () => {
            console.log("on closed");
        },
        onError: (err) => {
            message.error('Kết nối tới máy chủ không thành công. Vui lòng kiểm tra lại IP máy chủ: Cài đặt -> IP máy chủ. ')
        },
        onMessage: useCallback(event => handleWebSocketMessage(event), []),
    });

    const handleWebSocketMessage = (event) => {
        const response = JSON.parse(event.data);
        setLoading(false);
        const data = response.data;

        switch (response.type) {
            case RequestTypes.GetAttendances:
                setAttendances(Array.isArray(data) ? data : []);
                setTotalRow(data.length ? +data[0]?.count : 0);
                break;

            case RequestTypes.GetDevices:
                const options = response.data?.map((item) => ({
                    label: item.Name,
                    value: item.Id,
                }));
                options.unshift({
                    label: "All",
                    value: "All",
                    isSelectOption: true,
                });
                setDevices(options);
                break;

            case RequestTypes.SyncLogData:
                if (data.isSuccess) {
                    setAttendances((prev) =>
                        prev.map((item) =>
                            item.Id === data.data.Id
                                ? Object.assign(item, { Uploaded: true })
                                : item
                        )
                    );
                    message.success("Đồng bộ thành công.");
                } else {
                    message.error(data.message);
                }
                break;

            case RequestTypes.UpdateLog:
                if (data.isSuccess) {
                    message.success("Update thành công.");
                    setAttendances((prev) =>
                        prev.map((item) =>
                            item.Id === data.data.logId
                                ? Object.assign(item, {
                                    VerifyDate: data.data.date,
                                    Uploaded: false,
                                })
                                : item
                        )
                    );
                } else {
                    message.error(data.message);
                }
                break;

            case RequestTypes.DeleteLog:
                if (data.isSuccess) {
                    message.success("Xoá dữ liệu chấm công thành công.");
                    setAttendances((prev) =>
                        prev.filter((item) => item.Id !== data.data.Id)
                    );
                } else {
                    message.error(data.message);
                }
                break;

            case RequestTypes.GetUsersByDeviceId:
                setUsers(
                    data?.map((user) => ({
                        label: `${user.DisplayName} - (${user.Name}) `,
                        value: user.UserId,
                    }))
                );
                setUsersFilter(data);
                break;

            case RequestTypes.AddLog:
                if (data.isSuccess) {
                    message.success("Đã thêm một dữ liệu chấm công mới.");
                    setAttendances((prev) => {
                        prev.unshift(data.data[0]);
                        return prev;
                    });
                }
                break;

            case RequestTypes.ExportExcel:
                writeXlsxFile(data, {
                    schema,
                    fileName: `Attendances_Report.xlsx`,
                }).then((res) => {
                    console.log(res);
                });
                break;

            default:
                console.warn(`Unhandled response type: ${response.type}`);
                break;
        }

    };

    const fetchDevicesAndUsers = useCallback(() => {
        sendJsonMessage({ type: RequestTypes.GetDevices });
        sendJsonMessage({ type: RequestTypes.GetUsersByDeviceId, data: null });
    }, []);

    const fetchAttendances = useCallback(() => {
        sendJsonMessage({
            type: RequestTypes.GetAttendances,
            data: Object.assign(params, { tableParams: { filters, pagination } }),
        });
    }, [filters, pagination])

    useEffect(() => {
        if (isAuth) {
            fetchDevicesAndUsers();
        }
    }, [isAuth, fetchDevicesAndUsers])

    useEffect(() => {
        if (isAuth) {
            fetchAttendances()
        }

    }, [filters, fetchAttendances])

    useEffect(() => {
        if (isAuth) {
            fetchAttendances()
        }

    }, [pagination, fetchAttendances])

    const submit = () => {
        if (!isAuth) {
            return
        }

        if (!params.fromDate || !params.toDate) {
            message.error("Vui lòng chọn khoảng thời gian");
            return;
        }
        sendJsonMessage({
            type: RequestTypes.GetAttendances,
            data: params,
        });
    };

    const handleDateRangeChange = (value) => {
        if (!value) {
            return;
        }

        updateParams({
            fromDate: value[0]?.format(DATE_FORMAT),
            toDate: value[1]?.format(DATE_FORMAT),
        });
    };

    const updateParams = (updates) => setParams((prev) => ({ ...prev, ...updates }));

    return (
        <Auth>
            <Space size={30}>
                <Space>
                    <label>Khoảng: </label>
                    <RangePicker
                        defaultValue={[
                            dayjs(params.fromDate, DATE_FORMAT),
                            dayjs(params.toDate, DATE_FORMAT),
                        ]}
                        format={DATE_FORMAT}
                        onChange={handleDateRangeChange}
                    />
                </Space>
                <Space>
                    <label>Thiết bị: </label>
                    <Select
                        options={devices}
                        style={{ width: 200 }}
                        defaultValue={"All"}
                        onChange={(value) => updateParams({ deviceId: value })}
                    ></Select>
                </Space>
                <Button onClick={() => submit()} type="primary">
                    Submit
                </Button>
                <Button onClick={() => setOpen(OPEN_TYPES.ADD)}>
                    Chấm công thủ công
                </Button>
            </Space>
            <AttendancesTable
                attendances={attendances}
                sendJsonMessage={sendJsonMessage}
                setPagination={setPagination}
                pagination={pagination}
                filters={filters}
                setFilters={setFilters}
                totalRow={totalRow}
                usersFilter={usersFilter}
                params={params}
            ></AttendancesTable>
            <Modal
                open={open}
                onCancel={() => setOpen(OPEN_TYPES.CLOSE)}
                onOk={() => {
                    submitRef.current.click();
                    setOpen(OPEN_TYPES.CLOSE)
                }}
            >
                {open === OPEN_TYPES.ADD && (
                    <AttendanceForm
                        devices={devices}
                        users={users}
                        sendJsonMessage={sendJsonMessage}
                        submitRef={submitRef}
                    ></AttendanceForm>
                )}
            </Modal>
        </Auth>
    );
}
