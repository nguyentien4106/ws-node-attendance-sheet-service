import {
	Button,
	message,
	Modal,
	Popconfirm,
	Select,
	Space,
	Table,
	Tooltip,
} from "antd";
import React, { useCallback, useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import { useLoading } from "../context/LoadingContext";
import UserInformationForm from "../components/users/UserInformationForm";
import UsersTable from "../components/users/UsersTable";
import SyncForm from "../components/users/SyncForm";
import { getHostUrl, isAuth } from "../helper/common";
import Auth from "../layout/Auth";
const WS_URL = getHostUrl();

const OPEN_TYPE = {
	Close: 0,
	AddUser: 1,
	SyncData: 2,
	EditUser: 3,
	PullData: 4,
	LoadDataFromMachine: 5,
};

export default function Users() {
	const { sendJsonMessage } = useWebSocket(WS_URL, {
		onError: (err) => {
			message.error(
				"Kết nối tới máy chủ không thành công. Vui lòng kiểm tra lại IP máy chủ: Cài đặt -> IP máy chủ. "
			);
		},
		onMessage: useCallback((event) => handleWebSocketMessage(event), []),
	});

	const handleWebSocketMessage = (event) => {
		const response = JSON.parse(event.data);
		const { type, data } = response;
		setLoading(false);
		// Helper function for success and error messages
		const handleMessages = (items, isSuccess = true) => (
			<Space direction="vertical">
				{items.map((item) => (
					<p key={item.message}>{item.message}</p>
				))}
			</Space>
		);

		// Process success and error items
		const processItems = (items, callback) => {
			const successes = Array.isArray(items) ? items?.filter((item) => item.isSuccess) : [];
			const failed = Array.isArray(items) ? items?.filter((item) => !item.isSuccess) : [];

			if (successes?.length) {
				message.success(handleMessages(successes));
				if (callback) {
					callback(successes);
				}
			}
			if (failed?.length) {
				message.error(handleMessages(failed));
			}
		};

		switch (type) {
			case RequestTypes.GetDevices: {
				const options = data.map((item) => ({
					label: item.Name,
					value: item.Ip,
				}));
				options.unshift({
					label: "All",
					value: "All",
					isSelectOption: true,
				});
				setOptions(options);
				setDevices(data);
				break;
			}

			case RequestTypes.GetUsers:
				setUsers(data);
				break;

			case RequestTypes.DeleteUser:
				if (data.isSuccess) {
					message.success("Xóa User thành công");
					setUsers((prev) => prev.filter((item) => item.UID !== data.data.UID));
				} else {
					message.error(data.message);
				}
				break;

			case RequestTypes.SyncUserData:
				if (data.isSuccess) {
					message.success("Đã tải dữ liệu User lên Sheet.");
				} else {
					message.error(data.message);
				}
				break;

			case RequestTypes.AddUser:
				processItems(data, (successes) => {
					setUsers((prev) => [
						...successes.map((item) => item.data.user),
						...prev,
					]);
				});
				break;

			case RequestTypes.EditUser:
				if (data.isSuccess) {
					message.success("Cập nhật thông tin người dùng thành công.");
					setUsers((prev) =>
						prev.map((item) => (item.Id === data.data.Id ? data.data : item))
					);
				} else {
					message.error(data.message);
				}
				break;

			case RequestTypes.PullUserData:
				processItems(data, (successes) => {
					setUsers((prev) => [
						...successes.map((item) => item.data.user),
						...prev,
					]);
				});
				break;

			case RequestTypes.GetSheets:
				setSheets(data.data);
				break;

			case RequestTypes.LoadDataFromMachine:
                processItems(data)

				const { resultAdd, updateUsers, removeUsers } = data.data;
				if (!resultAdd.length && !updateUsers.length && !removeUsers.length) {
					message.success(
						"Thành công! Không phát hiện người dùng nào được cập nhật thông tin."
					);
					return;
				}

				if (resultAdd.length) {
                    const newUsers = resultAdd?.flat()
					message.success(
						`Thành công! Đã thêm ${newUsers.length} người dùng mới.`
					);
					setUsers((prev) => [...newUsers, ...prev]);
				}

				if (updateUsers.length) {
					updateUsers.map((item) => {
						message.success(
							`Đã cập nhật thông tin cho UID: ${item.UID} có tên ${item.Name}`
						);
					});

					setUsers((prev) => {
						return prev.map((item) => {
							const userUpdate = updateUsers.find(
								(u) => u.UID == item.UID && u.DeviceIp == item.DeviceIp
							);
							return userUpdate ? Object.assign(item, userUpdate) : item;
						});
					});
				}

				if (removeUsers.length) {
					removeUsers.map((item) => {
						message.success(`Đã xóa người dùng UID: ${item.UID} trong thiết bị: ${item.DeviceIp}`);
					});

					setUsers((prev) => {
						return prev.map((item) => {
							return removeUsers.filter(
								(u) => u.UID != item.UID && u.DeviceIp != item.DeviceIp
							);
						});
					});
				}

				break;

			default:
				console.warn(`Unhandled response type: ${type}`);
		}
	};

	const { setLoading } = useLoading();
	const [devices, setDevices] = useState([]);
	const [deviceSelected, setDeviceSelected] = useState("All");
	const [users, setUsers] = useState([]);
	const [options, setOptions] = useState([{ label: "All", value: "All" }]);
	const [open, setOpen] = useState(OPEN_TYPE.Close);
	const submitUserFormRef = useRef();
	const [sheets, setSheets] = useState([]);

	useEffect(() => {
		if (!isAuth) {
			return;
		}
		setLoading(true);
		sendJsonMessage({
			type: RequestTypes.GetDevices,
		});
		sendJsonMessage({
			type: RequestTypes.GetSheets,
		});
	}, []);

	useEffect(() => {
		if (!deviceSelected || !isAuth) {
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
						<Button onClick={() => setOpen(OPEN_TYPE.AddUser)} type="primary">
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
						<Tooltip
							title="Chức năng này giúp bạn lấy dữ liệu user từ một trang Sheet và thêm vào máy chấm công."
							color="#108ee9"
						>
							<Button onClick={() => setOpen(OPEN_TYPE.LoadDataFromMachine)}>
								Tải dữ liệu từ máy
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
							{open == OPEN_TYPE.AddUser ? "Thông tin" : "Thông tin"}
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
							sheets={sheets}
						></SyncForm>
					)}
				</Modal>
			</div>
		</Auth>
	);
}
