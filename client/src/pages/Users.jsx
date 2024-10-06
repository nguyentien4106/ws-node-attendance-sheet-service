import { Button, Modal, Select, Space, Table } from "antd";
import React, { useEffect, useRef, useState } from "react";
import useWebSocket from "react-use-websocket";
import { RequestTypes } from "../constants/requestType";
import { useLoading } from "../context/LoadingContext";
import UserInformationForm from "../components/users/UserInformationForm";
import UsersTable from "../components/users/UsersTable";
const WS_URL = "ws://127.0.0.1:3000";

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
        setDevices(response.data.filter((item) => item.IsConnected));
      }

      if (response.type === RequestTypes.GetUsers) {
        console.log(response.data.data.data);
        setUsers(response.data.data.data);
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
  const [deviceSelected, setDeviceSelected] = useState(null);
  const [users, setUsers] = useState([]);

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
  const [open, setOpen] = useState(false)
  const submitUserFormRef = useRef()

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Add User</Button>
      <div className="d-flex justify-content-between">
        <h2>Users</h2>
        <Space>
          <h6>Device : </h6>
          <Select
            style={{
              width: 200,
            }}
            onChange={(deviceIp) => setDeviceSelected(deviceIp)}
          >
            {devices?.map((item) => (
              <Select.Option key={item.Id} value={item.Ip}>
                {item.Ip}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </div>
      <UsersTable deviceIp={deviceSelected} users={users} sendJsonMessage={sendJsonMessage}></UsersTable>
      <Modal 
        onCancel={() => setOpen(false)}
        open={open}
        onOk={() => submitUserFormRef.current.click()}
      >
        <UserInformationForm devices={devices} submitRef={submitUserFormRef} sendJsonMessage={sendJsonMessage} device={null} setOpen={setOpen}></UserInformationForm>
      </Modal>
    </div>
  );
}
