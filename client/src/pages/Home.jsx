import React from "react";
import qr from '../assets/qr.jpg'
export default function Home() {
    return (
        <div>
            <h1>SANA POS</h1>
            <h3 style={{ color: "blue" }}>Giải pháp quản trị máy chấm công</h3> 
            <h4>Mọi chi tiết xin liên hệ</h4>
            <h4>Anh Linh: 0358.968.315</h4>
            <h4>Anh Quốc: 0347591171</h4>
            <img src={qr} width={"300px"}></img>
        </div>
    );
}
