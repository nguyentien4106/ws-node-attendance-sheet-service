import { Button, message, Modal, Popconfirm, Select, Space, Table, Tooltip } from "antd";
import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import { useLoading } from "../context/LoadingContext";
import UserInformationForm from "../components/users/UserInformationForm";
import UsersTable from "../components/users/UsersTable";
import SyncForm from "../components/users/SyncForm";
import { getHostUrl } from "../helper/common";
import Auth from "../layout/Auth";
const WS_URL = getHostUrl();

const OPEN_TYPE = {
    Close: 0,
    AddUser: 1,
    SyncData: 2,
    EditUser: 3,
    PullData: 4
};

export default function Users() {
    const { sendJsonMessage } = useWebSocket(WS_URL, {
        onOpen: () => {
            console.log("WebSocket connection established.");
        },
        onClose: () => {
            console.log("on closed");
        },
        onError: (err) => {
            console.log(err);
            message.error(
                "Kết nối tới máy chủ không thành công. Vui lòng kiểm tra lại IP máy chủ: Cài đặt -> IP máy chủ. "
            );
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
                setOptions(options);
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

            if (response.type === RequestTypes.PullUserData) {
                console.log(response)
                if (response.data.isSuccess) {
                    message.success("Đã tải dữ liệu User lên Sheet.");
                } else {
                    message.error(response.data.message);
                }
            }

            if (response.type === RequestTypes.AddUser) {
                const successes = response.data.filter(
                    (item) => item.isSuccess
                );
                const failed = response.data.filter(
                    (item) => !item.isSuccess
                );

                if (successes.length) {
                    message.success(
                        <Space direction="vertical">
                            {successes.map((item) => (
                                <p key={item.message}>{item.message}</p>
                            ))}
                        </Space>
                    );

                    setUsers(prev => [...prev, ...successes.map(item => item.data.user)])
                }
                if (failed.length) {
                    message.error(
                        <Space direction="vertical">
                            {failed.map((item) => (
                                <p key={item.message}>{item.message}</p>
                            ))}
                        </Space>
                    );
                }
            }

            if (response.type === RequestTypes.EditUser) {
                console.log(response.data);
                if (response.data.isSuccess) {
                    message.success(
                        "Cập nhật thông tin người dùng thành công."
                    );
                    setUsers((prev) =>
                        prev.map((item) =>
                            item.Id === response.data.data.Id
                                ? response.data.data
                                : item
                        )
                    );
                } else {
                    message.error(response.data.message);
                }
            }

            if (response.type === RequestTypes.PullUserData) {
                console.log(response.data);
                const successes = response.data.filter(
                    (item) => item.isSuccess
                );
                const failed = response.data.filter(
                    (item) => !item.isSuccess
                );

                if (successes.length) {
                    message.success(
                        <Space direction="vertical">
                            {successes.map((item) => (
                                <p key={item.message}>{item.message}</p>
                            ))}
                        </Space>,
                        10000
                    );
                }
                if (failed.length) {
                    message.error(
                        <Space direction="vertical">
                            {failed.map((item) => (
                                <p key={item.message}>{item.message}</p>
                            ))}
                        </Space>,
                        10000
                    );
                }
            }
        },
    });

    const { setLoading } = useLoading();
    const [devices, setDevices] = useState([]);
    const [deviceSelected, setDeviceSelected] = useState("All");
    const [users, setUsers] = useState([]);
    const [options, setOptions] = useState([{ label: "All", value: "All" }]);
    const [open, setOpen] = useState(OPEN_TYPE.Close);
    const submitUserFormRef = useRef();

    useEffect(() => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.GetDevices,
        });
    }, []);

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

    return (
        <Auth>
            <div>
                <div className="d-flex justify-content-between">
                    <h2>Người dùng</h2>
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
                        <Tooltip
                            title="Chức năng này giúp bạn đẩy dữ liệu có trong máy chấm công lên Sheet"
                            color="#108ee9"
                        >
                            <Button onClick={() => setOpen(OPEN_TYPE.SyncData)}>
                                Đồng bộ lên Sheet
                            </Button>
                        </Tooltip>
                        <Tooltip
                            title="Chức năng này giúp bạn lấy dữ liệu user từ một trang Sheet và thêm vào máy chấm công."
                            color="#108ee9"
                        >
                            <Button onClick={() => setOpen(OPEN_TYPE.PullData)}>
                                Đồng bộ từ Sheet
                            </Button>
                        </Tooltip>
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
                            {open == OPEN_TYPE.AddUser
                                ? "Thông tin User"
                                : "Thông tin Sheet"}
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
                            open={open}
                        ></SyncForm>
                    )}
                </Modal>
            </div>
        </Auth>
    );
}
