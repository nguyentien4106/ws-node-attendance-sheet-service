import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { useLoading } from "../context/LoadingContext";
import { RequestTypes } from "../constants/requestType";
import AttendancesTable from "../components/attendances/AttendancesTable";
import { Button, DatePicker, message, Modal, Select, Space } from "antd";
import dayjs from "dayjs";
import { DATE_FORMAT, TIME_FORMAT } from "../constants/common";
import AttendanceForm from "../components/attendances/AttendanceForm";
import { getHostUrl, isAuth } from "../helper/common";
import Auth from "../layout/Auth";

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

export default function Attendances() {
    const { setLoading } = useLoading();
    const [attendances, setAttendances] = useState([]);
    const [dateRange, setDateRange] = useState([dayjs().add(-3, "M"), dayjs().add(1, "days")]);
    const [devices, setDevices] = useState([]);
    const [users, setUsers] = useState([]);
    const [deviceId, setDeviceId] = useState("All");
    const [open, setOpen] = useState(OPEN_TYPES.CLOSE);
    const submitRef = useRef();
    const [pagination, setPagination] = useState(defaultPagination);
    const [filters, setFilters] = useState({ Name: [] })
    const [totalRow, setTotalRow] = useState(0)
    const [usersFilter, setUsersFilter] = useState([])
    const [params, setParams] = useState({
        deviceId: deviceId,
        fromDate: dateRange??[0]?.format(DATE_FORMAT),
        toDate: dateRange??[1]?.format(DATE_FORMAT),
        tableParams: {
            pagination
        }
    })

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
        onMessage: (event) => {
            const response = JSON.parse(event.data);
            setLoading(false);
            const data = response.data;
            if (response.type === RequestTypes.GetAttendances) {
                console.log(data)
                setAttendances(Array.isArray(data) ? data : []);
                setTotalRow(data.length ? +data[0]?.count : 0 )
            }

            if (response.type === RequestTypes.GetDevices) {
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
            }

            if (response.type === RequestTypes.SyncLogData) {
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
            }

            if (response.type === RequestTypes.UpdateLog) {
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
            }

            if (response.type === RequestTypes.DeleteLog) {
                if (data.isSuccess) {
                    message.success("Xoá dữ liệu chấm công thành công.");
                    setAttendances((prev) =>
                        prev.filter((item) => item.Id !== data.data.Id)
                    );
                } else {
                    message.error(data.message);
                }
            }

            if (response.type === RequestTypes.GetUsersByDeviceId) {
                setUsers(
                    data?.map((user) => ({
                        label: `${user.DisplayName} - (${user.Name}) `,
                        value: user.UserId,
                    }))
                );

                setUsersFilter(data)
            }

            if (response.type === RequestTypes.AddLog) {
                if (data.isSuccess) {
                    message.success("Đã thêm một dữ liệu chấm công mới.")
                    console.log(data.data[0])
                    setAttendances(prev => {
                        prev.unshift(data.data[0])
                        return prev
                    })
                }
            }

            if(response.type === RequestTypes.GetUsers){
            }
        },
    });

    useEffect(() => {
        if (!isAuth || !dateRange) {
            return;
        }

        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.GetAttendances,
            data: params,
        });

        sendJsonMessage({
            type: RequestTypes.GetDevices,
        });

        sendJsonMessage({
            type: RequestTypes.GetUsersByDeviceId,
            data: null
        })
    }, []);

    useEffect(() => {
        if (!isAuth || !dateRange) {
            return
        }

        setParams(prev => Object.assign(prev, {
            fromDate: dateRange[0].format(DATE_FORMAT),
            toDate: dateRange[1].format(DATE_FORMAT),
            tableParams: {
                pagination,
                filters
            }
        }))
    }, [dateRange])

    useEffect(() => {
        if (!isAuth || !dateRange) {
            return
        }

        setParams(prev => {
            const newParams = Object.assign(prev, {
                tableParams: {
                    pagination: pagination,
                    filters: filters
                }
            })
            sendJsonMessage({
                type: RequestTypes.GetAttendances,
                data: newParams,
            });

            return newParams
        })
        
    }, [filters, pagination])

    useEffect(() => {
        if (!isAuth || !dateRange) {
            return
        }
        setParams(prev => ({ ...prev, deviceId: deviceId }))
        sendJsonMessage({
            type: RequestTypes.GetUsersByDeviceId,
            data: deviceId
        })
    }, [deviceId])

    const submit = () => {
        if (!isAuth || !dateRange) {
            return
        }
        sendJsonMessage({
            type: RequestTypes.GetAttendances,
            data: params,
        });
    };

    return (
        <Auth>
            <Space size={30}>
                <Space>
                    <label>Khoảng: </label>
                    <RangePicker
                        defaultValue={dateRange}
                        format={DATE_FORMAT}
                        onChange={(value) => setDateRange(value)}
                    />
                </Space>
                <Space>
                    <label>Thiết bị: </label>
                    <Select
                        options={devices}
                        style={{ width: 200 }}
                        defaultValue={"All"}
                        onChange={(val) => setDeviceId(val)}
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
