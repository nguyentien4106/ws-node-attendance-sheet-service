export const attendanceHandlers = (request, ws, deviceContainer) => {
     // switch (request.type) {
        //     case request.type.startsWith("Device."):
        //         console.log('handle devices')
        //         break;

        //     case RequestTypes.AddDevice:
        //         addDevice(request.data, deviceContainer).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.RemoveDevice:
        //         removeDevice(request.data, deviceContainer).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.ConnectDevice:
        //         connectDevice(request.data, deviceContainer)
        //             .then((res) => {
        //                 ws.send(
        //                     getResponse({
        //                         type: request.type,
        //                         data: res,
        //                     })
        //                 );
        //             })
        //             .catch((err) => { });
        //         break;

        //     case RequestTypes.DisconnectDevice:
        //         disconnectDevice(request.data, deviceContainer)
        //             .then((res) => {
        //                 ws.send(
        //                     getResponse({
        //                         type: request.type,
        //                         data: res,
        //                     })
        //                 );
        //             })
        //             .catch((err) => { });
        //         break;

        //     case RequestTypes.GetUsers:
        //         getAllUsers(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res.rows,
        //                 })
        //             );
        //         });

        //         break;

        //     case RequestTypes.GetDevices:
        //         DeviceService.getAllDevices().then((res) => {
        //             const { rows } = res;
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: rows,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.AddUser:
        //         addUser(request.data, deviceContainer).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.GetAttendances:
        //         getAttendances(request.data)
        //             .then((res) => {
        //                 ws.send(
        //                     getResponse({
        //                         type: request.type,
        //                         data: res.rows,
        //                     })
        //                 );
        //             })
        //             .catch((err) => {
        //                 ws.send(
        //                     getResponse({
        //                         type: request.type,
        //                         data: err,
        //                     })
        //                 );
        //             });
        //         break;

        //     case RequestTypes.DeleteUser:
        //         deleteUser(request.data, deviceContainer).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.GetAllUsers:
        //         getAllUsers().then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res.rows,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.SyncData:
        //         syncData(request.data, deviceContainer, ws);

        //         break;

        //     case "GetDevicesSheets":
        //         DeviceService.getAllDevicesWithSheets().then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.SyncUserData:
        //         syncUserData(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.SyncLogData:
        //         syncLogData(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.UpdateEmail:
        //         updateEmail(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.GetSettings:
        //         deviceContainer.getInfo().then(info => {
        //             getSettings().then((res) => {
        //                 ws.send(
        //                     getResponse({
        //                         type: request.type,
        //                         data: {
        //                             setting: res.rowCount ? res.rows[0] : { Id: 0, Email: "" },
        //                             time: dayjs().format(),
        //                             info: info
        //                         },
        //                     })
        //                 );
        //             });
        //         })

        //         break;

        //     case RequestTypes.GetUsersByDeviceId:
        //         getUsersByDeviceId(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res.rows,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.UpdateLog:
        //         updateAttendance(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.DeleteLog:
        //         deleteAttendance(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res,
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.AddLog:
        //         insertAttendance(
        //             {
        //                 userId: request.data.UserId,
        //                 attTime: request.data.DateTime
        //             },
        //             request.data.DeviceId,
        //             false
        //         ).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res.rowCount
        //                         ? Result.Success(res.rows)
        //                         : Result.Fail(500, "Thêm không thành công! Vui lòng thử lại"),
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.GetSheets:
        //         getSheets().then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: Result.Success(res.rows),
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.SyncDataFromSheet:
        //         syncDataFromSheet(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: Result.Success(res.rows),
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.EditUser:
        //         editUserDisplayName(request.data).then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res.rowCount
        //                         ? Result.Success({ ...res.rows[0], DeviceName: request.data.DeviceName })
        //                         : Result.Fail(
        //                             500,
        //                             "Không thể cập nhật thông tin người dùng. Xin thử lại!"
        //                         ),
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.SyncTime:
        //         deviceContainer.syncTime().then((res) => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: Result.Success(res),
        //                 })
        //             );
        //         });
        //         break;

        //     case RequestTypes.ChangePassword:
        //         changePassword(request.data).then(res => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res.rowCount ? Result.Success(res.rows) : Result.Fail(500, "Không thể cập nhật mật khẩu vui lòng thử lại."),
        //                 })
        //             );
        //         })
        //         break;

        //     case RequestTypes.PullUserData:
        //         deviceContainer.handlePullUserData(request.data).then(res => {
        //             ws.send(
        //                 getResponse({
        //                     type: request.type,
        //                     data: res
        //                 })
        //             );
        //         })
        //         break;
        // }
}