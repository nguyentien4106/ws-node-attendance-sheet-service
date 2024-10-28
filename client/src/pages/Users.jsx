import { Button, message, Modal, Popconfirm, Select, Space, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import { useLoading } from "../context/LoadingContext";
import UserInformationForm from "../components/users/UserInformationForm";
import UsersTable from "../components/users/UsersTable";
import SyncForm from "../components/users/SyncForm";
const WS_URL = import.meta.env.VITE_WS_URL ?? "ws://127.0.0.1:3000";

const OPEN_TYPE = {
    Close: 0,
    AddUser: 1,
    SyncData: 2,
    EditUser: 3
};

export default function Users() {
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
            if (response.type === RequestTypes.GetDevices) {
                const options = response.data.map((item) => ({
                    label: item.Name,
                    value: item.Ip,
                }));
                options.unshift({
                    label: "All",
                    value: "All",
                    isSelectOption: true,
                });
                setOptions(options)
                setDevices(response.data);
            }

            if (response.type === RequestTypes.GetUsers) {
                setUsers(response.data);
            }

            if (response.type === RequestTypes.DeleteUser) {
                if (response.data.isSuccess) {
                    message.success("Xóa User thành công");
                    setUsers((prev) =>
                        prev.filter(
                            (item) => item.UID !== response.data.data.uid
                        )
                    );
                } else {
                    message.error(response.data.message);
                }
            }

            if (response.type === RequestTypes.SyncUserData) {
                if (response.data.isSuccess) {
                    message.success("Đã tải dữ liệu User lên Sheet.");
                } else {
                    message.error(response.data.message);
                }
            }
        },
    });

    useEffect(() => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.GetDevices,
        });
    }, []);

    const { setLoading } = useLoading();
    const [devices, setDevices] = useState([]);
    const [deviceSelected, setDeviceSelected] = useState("All");
    const [users, setUsers] = useState([]);
    const [options, setOptions] = useState([{ label: "All", value: "All" }])

    useEffect(() => {
        if (!deviceSelected) {
            return;
        }

        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.GetUsers,
            data: deviceSelected,
        });
    }, [deviceSelected]);

    const [open, setOpen] = useState(OPEN_TYPE.Close);
    const submitUserFormRef = useRef();

    return (
        <div>
            <div className="d-flex justify-content-between">
                <h2>Users</h2>
                <Space>
                    <h6>Thiết bị : </h6>
                    <Select
                        style={{
                            width: 200,
                        }}
                        onChange={(deviceIp) => setDeviceSelected(deviceIp)}
                        options={options}
                        defaultValue={deviceSelected}
                    ></Select>
                    <Button
                        onClick={() => setOpen(OPEN_TYPE.AddUser)}
                        type="primary"
                    >
                        Thêm người dùng
                    </Button>
                    <Button onClick={() => setOpen(OPEN_TYPE.SyncData)}>
                        Đồng bộ
                    </Button>
                </Space>
            </div>
            <UsersTable
                deviceIp={deviceSelected}
                users={users}
                sendJsonMessage={sendJsonMessage}
                setOpen={setOpen}
            ></UsersTable>
            <Modal
                onCancel={() => setOpen(OPEN_TYPE.Close)}
                open={!!open}
                onOk={() => submitUserFormRef.current.click()}
                title={
                    <div className="d-flex justify-content-center mb-3">
                        {OPEN_TYPE.AddUser ? "Thông tin User" : "Thông tin Sheet"}
                    </div>
                }
            >
                {open === OPEN_TYPE.AddUser ? (
                    <UserInformationForm
                        devices={devices}
                        submitRef={submitUserFormRef}
                        sendJsonMessage={sendJsonMessage}
                        device={null}
                        setOpen={setOpen}
                    ></UserInformationForm>
                ) : (
                    <SyncForm
                        devices={devices}
                        submitRef={submitUserFormRef}
                        sendJsonMessage={sendJsonMessage}
                        device={null}
                        setOpen={setOpen}
                        users={users}
                    ></SyncForm>
                )}
            </Modal>
        </div>
    );
}
