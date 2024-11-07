import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { useLoading } from "../context/LoadingContext";
import { RequestTypes } from "../constants/requestType";
import AttendancesTable from "../components/attendances/AttendancesTable";
import { Button, DatePicker, message, Modal, Select, Space } from "antd";
import dayjs from "dayjs";
import { DATE_FORMAT } from "../constants/common";
import AttendanceForm from "../components/attendances/AttendanceForm";

const { RangePicker } = DatePicker;
const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://127.0.0.1:3000";

export default function Attendances() {
    const { sendJsonMessage } = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connection established.");
        },
        onClose: () => {
            console.log("on closed");
        },
        onMessage: (event) => {
            const response = JSON.parse(event.data);
            setLoading(false);
            const data = response.data;
            if (response.type === RequestTypes.GetAttendances) {
                setAttendances(response.data);
            }

            if (response.type === RequestTypes.GetDevices) {
                const options = response.data.map((item) => ({
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
                setUsers(data.map(user => ({ label: `${user.DisplayName} - (${user.Name}) `, value: user.UserId })))
            }

            if(response.type === RequestTypes.AddLog){
                if(data.isSuccess){
                    message.success("Thêm dữ liệu thành công.")
                    setAttendances(prev => [...prev, data.data[0]])
                }
                else {
                    message.error(data.message)
                }
            }
        },
    });

    useEffect(() => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.GetAttendances,
            data: {
                deviceId: deviceId,
                fromDate: dateRange[0].toDate(),
                toDate: dateRange[1].toDate(),
            },
        });

        sendJsonMessage({
            type: RequestTypes.GetDevices,
        });
    }, []);

    const submit = () => {
        sendJsonMessage({
            type: RequestTypes.GetAttendances,
            data: {
                deviceId: deviceId,
                fromDate: dateRange[0].format(DATE_FORMAT),
                toDate: dateRange[1].format(DATE_FORMAT),
            },
        });
    };

    const { setLoading } = useLoading();
    const [attendances, setAttendances] = useState([]);
    const [dateRange, setDateRange] = useState([dayjs().add(-3, "M"), dayjs()]);
    const [devices, setDevices] = useState([]);
    const [users, setUsers] = useState([]);
    const [deviceId, setDeviceId] = useState("All");
    const [open, setOpen] = useState(false);
    const submitRef = useRef()

    return (
        <div>
            <Space size={30}>
                <Space>
                    <label>Date Range: </label>
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
                <Button onClick={() => setOpen(true)}>Thêm thủ công</Button>
            </Space>
            <AttendancesTable
                attendances={attendances}
                sendJsonMessage={sendJsonMessage}
                devices={devices}
            ></AttendancesTable>
            {open && (
                <Modal
                    open={open}
                    onCancel={() => setOpen(false)}
                    onOk={() => {
                        setOpen(false)
                        submitRef.current.click()
                    }}
                >
                    <AttendanceForm
                        devices={devices}
                        users={users}
                        sendJsonMessage={sendJsonMessage}
                        submitRef={submitRef}
                    ></AttendanceForm>
                </Modal>
            )}
        </div>
    );
}
