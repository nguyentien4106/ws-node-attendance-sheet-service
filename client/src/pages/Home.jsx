import React from "react";
import qr from '../assets/qr.jpg'
import { Space } from "antd";
import { Link } from "react-router-dom";

export default function Home() {
    return (
        <div style={{ position: "relative" }}>
            <h1>SANA POS</h1>
            <h3 style={{ color: "blue" }}>Giải pháp quản trị máy chấm công</h3>

            <img src={qr} width={"300px"} style={{ marginTop: 150 }}></img>
            <Link style={{ position: "absolute", bottom: 0, right: 0 }} to={"https://forms.gle/1xcTUmU6nHUdvPtL7"} target="_blank">Góp ý và phản hồi lỗi</Link>
            <div className="d-flex mt-5 justify-content-between" style={{ width: "50%" }}>
                {/* <h4>Mọi chi tiết xin liên hệ</h4> */}
                <Space direction="vertical">
                    <h4>Anh Linh: 0358.968.315</h4>
                    <h4>Anh Quốc: 0347.591.171</h4>
                </Space>
            </div>
        </div>
    );
}
