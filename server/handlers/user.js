import { RequestTypes } from "../constants/requestType.js";
import { editUserDisplayName, getAllUsers, getUsersByDeviceId } from "../dbServices/userService.js";
import { Result } from "../models/common.js";
import { getResponse } from "../models/response.js";
import { addUser, deleteUser, syncUserData } from "../services/user.js";

export const userHandlers = (request, ws, deviceContainer) => {
    switch (request.type) {
        case RequestTypes.GetUsers:
            getAllUsers(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res.rows,
                    })
                );
            });

            break;


        case RequestTypes.AddUser:
            addUser(request.data, deviceContainer).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;


        case RequestTypes.DeleteUser:
            deleteUser(request.data, deviceContainer).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;

        case RequestTypes.GetAllUsers:
            getAllUsers().then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res.rows,
                    })
                );
            });
            break;

        case RequestTypes.SyncUserData:
            syncUserData(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res,
                    })
                );
            });
            break;

        case RequestTypes.GetUsersByDeviceId:
            getUsersByDeviceId(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res.rows,
                    })
                );
            });
            break;

        case RequestTypes.EditUser:
            editUserDisplayName(request.data).then((res) => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res.rowCount
                            ? Result.Success({ ...res.rows[0], DeviceName: request.data.DeviceName })
                            : Result.Fail(
                                500,
                                "Không thể cập nhật thông tin người dùng. Xin thử lại!"
                            ),
                    })
                );
            });
            break;

        case RequestTypes.PullUserData:
            deviceContainer.handlePullUserData(request.data).then(res => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res
                    })
                );
            })
            break;

        case RequestTypes.LoadDataFromMachine:
            deviceContainer.loadUsers(request.data).then(res => {
                ws.send(
                    getResponse({
                        type: request.type,
                        data: res
                    })
                );
            })
            break;
    }
}