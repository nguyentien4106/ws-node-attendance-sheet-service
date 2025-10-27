import { Button, Input, message, Modal, Popconfirm, Space } from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import { useLoading } from "../context/LoadingContext";
import { getHostUrl, getServerIp, isAuth, setServerIp } from "../helper/common";
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
                console.log('settings', response.data)
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
        <div className="w-full max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Cài đặt</h2>
                
                <div className="space-y-6">
                    {/* Email Setting */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col gap-3">
                            <label className="font-medium text-gray-700">Email nhận cảnh báo:</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    className="flex-1"
                                    type="email"
                                    value={email}
                                    onChange={(val) => setEmail(val.target.value)}
                                    placeholder="Nhập email"
                                />
                                <Popconfirm
                                    title="Cập nhật email"
                                    description="Khi cập nhật email thành công. Tên đăng nhập mới là email được nhận cảnh báo."
                                    onConfirm={(e) => {
                                        updateEmail();
                                    }}
                                    onCancel={() => { }}
                                    okText="Yes"
                                    cancelText="No"
                                >
                                    <Button className="w-full sm:w-auto">Cập nhật</Button>
                                </Popconfirm>
                            </div>
                        </div>
                    </div>

                    {/* Password Setting */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <label className="font-medium text-gray-700">Mật khẩu:</label>
                            <Button onClick={() => setOpen(true)} className="w-full sm:w-auto">
                                Cập nhật
                            </Button>
                        </div>
                    </div>

                    {/* Server IP Setting */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col gap-3">
                            <label className="font-medium text-gray-700">IP máy chủ:</label>
                            <div className="flex flex-col sm:flex-row gap-2">
                                <Input
                                    className="flex-1"
                                    type="text"
                                    value={ip}
                                    onChange={(val) => setIp(val.target.value)}
                                    placeholder="Nhập IP máy chủ"
                                />
                                <Button
                                    onClick={() => {
                                        setServerIp(ip);
                                        message.success("Cài đặt IP máy chủ thành công.");
                                    }}
                                    className="w-full sm:w-auto"
                                >
                                    Cập nhật
                                </Button>
                            </div>
                        </div>
                    </div>

                    {/* Server Time Display */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                            <label className="font-medium text-gray-700 whitespace-nowrap">Thời gian trên máy chủ:</label>
                            <span className="text-gray-900 font-mono text-sm sm:text-base">
                                {dayjs(time).format(`${DATE_SHOW_FORMAT} ${TIME_FORMAT}`)}
                            </span>
                        </div>
                    </div>

                    {/* Sync Time Setting */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                            <label className="font-medium text-gray-700">Thời gian trên máy:</label>
                            <Button
                                onClick={() => {
                                    syncTime();
                                }}
                                className="w-full sm:w-auto"
                            >
                                Đồng bộ thời gian
                            </Button>
                        </div>
                    </div>

                    {/* Info Display */}
                    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                        <div className="flex flex-col gap-2">
                            <label className="font-medium text-gray-700">Thông tin:</label>
                            <div className="bg-gray-50 p-3 rounded border border-gray-200 overflow-x-auto">
                                <pre className="text-xs sm:text-sm text-gray-900 whitespace-pre-wrap break-all">
                                    {JSON.stringify(info, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Usage Component */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                        <UsageComponent usage={usage} />
                    </div>
                </div>

                {/* Password Change Modal */}
                {
                    open && <Modal
                        open={open}
                        onCancel={() => setOpen(false)}
                        onOk={() => {
                            submitRef.current.click()
                        }}
                        centered
                        width="90%"
                        style={{ maxWidth: 500 }}
                        title="Thay đổi mật khẩu"
                    >
                        <ChangePasswordForm 
                            sendJsonMessage={sendJsonMessage} 
                            submitRef={submitRef} 
                            email={settings?.Email}
                            setOpen={setOpen}
                        />
                    </Modal>
                }
            </div>
    );
}
