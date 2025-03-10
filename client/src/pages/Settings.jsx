import { Button, Input, message, Modal, Popconfirm, Space } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import { useLoading } from "../context/LoadingContext";
import { getHostUrl, getServerIp, isAuth, setServerIp } from "../helper/common";
import Auth from "../layout/Auth";
import dayjs from "dayjs";
import { DATE_SHOW_FORMAT, TIME_FORMAT } from "../constants/common";
import ChangePasswordForm from "../components/settings/ChangePasswordForm";
import UsageComponent from "../components/settings/UsageComponent";
const WS_URL = getHostUrl();

export default function Settings() {
    const [settings, setSettings] = useState(null);
    const { setLoading } = useLoading();
    const [ip, setIp] = useState(getServerIp());
    const [time, setTime] = useState(dayjs())
    const [email, setEmail] = useState("")
    const [info, setInfo] = useState("")
    const [open, setOpen] = useState(false);
    const [usage, setUsage] = useState(null)

    const submitRef = useRef()

    const { sendJsonMessage } = useWebSocket(WS_URL, {
        onError: (err) => {
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

            if (response.type === "GetSystem") {
                console.log(response.data)
                setUsage(response.data)
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

    const getSystem = useCallback(() => {
        sendJsonMessage({
            type: "GetSystem"
        })
    }, [])
    
    useEffect(() => {
        const interval = setInterval(() => setTime(dayjs(time).add(1, "seconds")), 1000);
        getSystem()
        return () => {
          clearInterval(interval);
        };
      }, [time]);

    useEffect(() => {
        if(!isAuth){
            return;
        }
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

    const formatObject = (obj) => {
        return (
            <>
                <label>{}</label>
            </>
        )
    }


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
                <UsageComponent usage={usage}></UsageComponent>
                {
                    open && <Modal
                        open={open}
                        onCancel={() => setOpen(false)}
                        onOk={() => {
                            submitRef.current.click()
                        }}
                    >
                        <ChangePasswordForm 
                            sendJsonMessage={sendJsonMessage} 
                            submitRef={submitRef} 
                            email={settings?.Email}
                            setOpen={setOpen}
                        >
                        </ChangePasswordForm>
                    </Modal>
                }
            </div>
        </Auth>
    );
}
