import React from "react";
import qr from "../assets/qr.jpg";
import { Space } from "antd";
import { Link } from "react-router-dom";
import "./home.css";
import model from "../assets/model.jpg";
import tem from "../assets/tem.png";
export default function Home() {
	return (
		<div class="container montserrat-700">
			<div className="d-flex gap-5 justify-content-between align-items-center">
				<Space direction="vertical">
					<h1>BOX SERVER</h1>
					<p style={{ fontSize: 16 }}>Giải pháp quản trị máy chấm công online đa thiết bị</p>
				</Space>
				<img src={model} style={{ height: "500px" }}></img>
			</div>

			<div className="d-flex justify-content-between info">
                <img src={tem}></img>
				
				<ul>
					<li style={{ textAlign: "center", listStyleType: "none" }}>
						<h5>CÔNG TY TNHH SANA POS</h5>
					</li>
					<li>Địa chỉ: 191A Hà Huy Tập - Thanh Khê - Đà Nẵng</li>
					<li>
						Hotline: 0358 968 315{" "}
						<a href="https://zalo.me/0358968315" target="_blank">
							<img
								width="30"
								height="30"
								src="https://img.icons8.com/ios/50/zalo.png"
								alt="zalo"
								title="Zalo Anh Linh"
							/>
						</a>
					</li>

					<li>
						Web:{" "}
						<a href="https://sana.vn" target="_blank">
							<u>www.sana.vn</u>
						</a>
					</li>
					<li>
						<Space size={30} align="center" wrap>
							<li>
								Thơ: 0392 106 260{" "}
								<a href="https://zalo.me/0392106260" target="_blank">
									<img
										width="30"
										height="30"
										src="https://img.icons8.com/ios/50/zalo.png"
										alt="zalo"
									/>
								</a>
							</li>
							<li>
								Quốc: 0347 591 171{" "}
								<a href="https://zalo.me/0347591171" target="_blank">
									<img
										width="30"
										height="30"
										src="https://img.icons8.com/ios/50/zalo.png"
										alt="zalo"
									/>
								</a>
							</li>
						</Space>
					</li>
				</ul>
			</div>
		</div>
	);
}
