import { EMPLOYEE_DATA, USER_HEADER_ROW } from "../constants/common.js";
import { getRole, UserRoles } from "../constants/userRoles.js";
import { appendRow, initSheets } from "../dbServices/dataService.js";
import { getSheetsByDeviceIp } from "../dbServices/sheetService.js";
import { getAllUsers } from "../dbServices/userService.js";
import { Result } from "../models/common.js";

export const addUser = (user, container) => {
    return container.addUser(user);
};

export const deleteUser = (data, container) => {
    return container.deleteUser(data);
};

export const syncUserData = async (data) => {
    try {
        const users = (await getAllUsers(data?.Device)).rows
        const sheetRows = (await getSheetsByDeviceIp(data?.Device)).rows

        const services = await initSheets(sheetRows.map(item => ({ DocumentId: item.DocumentId, SheetName: EMPLOYEE_DATA })), USER_HEADER_ROW);

        const getUserInDbById = id => {
            return users.find(item => item.Id === id);
        }

        for (const service of services) {
            if (!service.isSuccess) {
                continue
            }

            await service.data.clearRows()

            const newRows = users.map(item => [
                item.Id,
                item.UID,
                item.EmployeeCode,
                getRole(item.Role),
                item.DeviceIp,
                item.DeviceName,
                item.Name,
                item.DisplayName,
                item.Password,
                item.CardNo
            ]);

            await appendRow([service.data], newRows);
        }

        return Result.Success(data);
    } catch (err) {
        return Result.Fail(500, err.message, data);
    }
};