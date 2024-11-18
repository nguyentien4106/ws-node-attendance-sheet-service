import { Button, Input, message, Modal, Popconfirm, Space } from "antd";
import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import { useLoading } from "../context/LoadingContext";
import { getHostUrl, getServerIp, setServerIp } from "../helper/common";
import Auth from "../layout/Auth";
import { Form } from "react-router-dom";
import dayjs from "dayjs";
import { DATE_SHOW_FORMAT, TIME_FORMAT } from "../constants/common";
import ChangePasswordForm from "../components/settings/ChangePasswordForm";
const WS_URL = getHostUrl();

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const { setLoading } = useLoading();
    const [ip, setIp] = useState(getServerIp());
    const [time, setTime] = useState(dayjs())
    const [email, setEmail] = useState("")
    const [info, setInfo] = useState("")

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

            if (response.type === RequestTypes.GetSettings) {
                setSettings(response.data.setting);
                setTime(response.data.time)
                setEmail(response.data.setting.Email)
                setInfo(response.data.info)
            }

            if (response.type === RequestTypes.UpdateEmail) {
                if (response.data.isSuccess) {
                    message.success("Cập nhật thành công");
                } else {
                    message.error(
                        "Cập nhật thất bại. " + response.data.message
                    );
                }
            }

            if (response.type === RequestTypes.SyncTime) {
                const successes = response.data.data.filter(
                    (item) => item.isSuccess
                );
                const failed = response.data.data.filter(
                    (item) => !item.isSuccess
                );
                if (successes.length) {
                    message.success(
                        `Cập nhật thành công thiết bị: ${successes
                            .map((item) => item.data)
                            .join(", ")}`
                    );
                }
                if (failed.length) {
                    message.error(
                        "Cập nhật thất bại thiết bị: " +
                        failed.map((item) => item.data).join(", ")
                    );
                }
            }

            if (response.type === RequestTypes.ChangePassword) {
                if (response.data.isSuccess) {
                    message.success("Cập nhật thành công");
                } else {
                    message.error(
                        "Cập nhật thất bại. " + response.data.message
                    );
                }
            }
        },
    });

    useEffect(() => {
        sendJsonMessage({
            type: RequestTypes.GetSettings,
        });
    }, []);

    const updateEmail = () => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.UpdateEmail,
            data: email,
        });
    };

    const syncTime = () => {
        setLoading(true);
        sendJsonMessage({
            type: RequestTypes.SyncTime,
        });
    };

    const [open, setOpen] = useState(false);

    const submitRef = useRef()
    return (
        <Auth>
            <div className="d-flex justify-content-start flex-column">
                <Space style={{ width: "70%" }}>
                    <label>Email nhận cảnh báo: </label>
                    <Input
                        width={500}
                        type="email"
                        value={email}
                        onChange={(val) => setEmail(val.target.value)}
                    ></Input>
                    <Popconfirm
                        title={`Cập nhật email.`}
                        description="Khi cập nhật email thành công. Tên đăng nhập mới là email được nhận cảnh báo."
                        onConfirm={(e) => {
                            updateEmail();
                        }}
                        onCancel={() => { }}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button >Cập nhật</Button>

                    </Popconfirm>
                </Space>
                <Space style={{ width: "70%", marginTop: 20 }}>
                    <label>Mật khẩu: </label>
                    <Button onClick={() => setOpen(true)}>Cập nhật</Button>
                </Space>
                <Space style={{ width: "70%", marginTop: 20 }}>
                    <label>IP máy chủ: </label>
                    <Input
                        width={500}
                        type="email"
                        value={ip}
                        onChange={(val) => setIp(val.target.value)}
                    ></Input>
                    <Button
                        onClick={() => {
                            setServerIp(ip);
                            message.success("Cài đặt IP máy chủ thành công.");
                        }}
                    >
                        Cập nhật
                    </Button>
                </Space>
                <Space style={{ width: "70%", marginTop: 20 }}>
                    <label>Thời gian trên máy chủ: </label>
                    <label>{dayjs(time).format(`${DATE_SHOW_FORMAT} ${TIME_FORMAT}`)}</label>
                </Space>
                <Space style={{ width: "70%", marginTop: 20 }}>
                    <label>Thời gian trên máy: </label>
                    <Button
                        onClick={() => {
                            syncTime();
                        }}
                    >
                        Đồng bộ thời gian
                    </Button>
                </Space>
                <Space style={{ width: "70%", marginTop: 20 }}>
                    <label>Thông tin: </label>
                    <label>{JSON.stringify(info)}</label>
                </Space>
                {
                    open && <Modal
                        open={open}
                        onCancel={() => setOpen(false)}
                        onOk={() => {
                            submitRef.current.click()
                            setOpen(false)
                        }}
                    >
                        <ChangePasswordForm sendJsonMessage={sendJsonMessage} submitRef={submitRef} email={settings?.Email}></ChangePasswordForm>
                    </Modal>
                }
            </div>
        </Auth>
    );
}
