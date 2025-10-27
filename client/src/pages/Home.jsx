import { Card, Row, Col, Divider } from "antd";
import "./home.css";
import model from "../assets/model.jpg";
import tem from "../assets/tem.png";

// Icon components
const PhoneIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
  </svg>
);

const LocationIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const SupportIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

export default function Home() {
	return (
		<div className="home-container">
			{/* Hero Section */}
			<div className="hero-section">
				<Row gutter={[32, 32]} align="middle" className="hero-content">
					<Col xs={24} md={12} lg={14}>
						<div className="hero-text">
							<h1 className="hero-title">
								SBOX SERVER
							</h1>
							<p className="hero-subtitle">
								Giải pháp quản trị máy chấm công online đa thiết bị
							</p>
							<div className="hero-features">
								<div className="feature-item">
									<div className="feature-icon">✓</div>
									<span>Quản lý đa thiết bị</span>
								</div>
								<div className="feature-item">
									<div className="feature-icon">✓</div>
									<span>Theo dõi thời gian thực</span>
								</div>
								<div className="feature-item">
									<div className="feature-icon">✓</div>
									<span>Báo cáo chi tiết</span>
								</div>
							</div>
						</div>
					</Col>
					<Col xs={24} md={12} lg={10}>
						<div className="hero-image-container">
							<img src={model} alt="SBOX Device" className="hero-image" />
						</div>
					</Col>
				</Row>
			</div>

			{/* Company Info Section */}
			<div className="company-info-section">
				<Card className="company-card" bordered={false}>
					<Row gutter={[24, 24]}>
						<Col xs={24} md={8} className="flex justify-center items-center">
							<div className="company-logo-container">
								<img src={tem} alt="SANA POS Logo" className="company-logo" />
							</div>
						</Col>
						<Col xs={24} md={16}>
							<div className="company-details">
								<h2 className="company-name">CÔNG TY TNHH SANA POS</h2>
								<Divider className="my-4" />
								
								<div className="contact-info">
									<div className="contact-item">
										<LocationIcon />
										<span>191A Hà Huy Tập - Thanh Khê - Đà Nẵng</span>
									</div>
									
									<div className="contact-item">
										<PhoneIcon />
										<span>Hotline: </span>
										<a href="tel:0358968315" className="contact-link">0358 968 315</a>
										<a href="https://zalo.me/0358968315" target="_blank" rel="noopener noreferrer" className="zalo-link">
											<img
												width="24"
												height="24"
												src="https://img.icons8.com/ios/50/zalo.png"
												alt="zalo"
												title="Zalo Anh Linh"
											/>
										</a>
									</div>
									
									<div className="contact-item">
										<GlobeIcon />
										<span>Website: </span>
										<a href="https://sana.vn" target="_blank" rel="noopener noreferrer" className="contact-link">
											www.sana.vn
										</a>
									</div>

									<Divider className="my-3" />
									
									<div className="support-section">
										<h3 className="support-title">
											<SupportIcon /> Hỗ trợ kỹ thuật
										</h3>
										<Row gutter={[16, 16]}>
											<Col xs={24} sm={12}>
												<div className="support-item">
													<span className="support-name">Thơ:</span>
													<a href="tel:0392106260" className="contact-link">0392 106 260</a>
													<a href="https://zalo.me/0392106260" target="_blank" rel="noopener noreferrer" className="zalo-link">
														<img
															width="24"
															height="24"
															src="https://img.icons8.com/ios/50/zalo.png"
															alt="zalo"
														/>
													</a>
												</div>
											</Col>
											<Col xs={24} sm={12}>
												<div className="support-item">
													<span className="support-name">Quốc:</span>
													<a href="tel:0347591171" className="contact-link">0347 591 171</a>
													<a href="https://zalo.me/0347591171" target="_blank" rel="noopener noreferrer" className="zalo-link">
														<img
															width="24"
															height="24"
															src="https://img.icons8.com/ios/50/zalo.png"
															alt="zalo"
														/>
													</a>
												</div>
											</Col>
										</Row>
									</div>
								</div>
							</div>
						</Col>
					</Row>
				</Card>
			</div>
		</div>
	);
}
