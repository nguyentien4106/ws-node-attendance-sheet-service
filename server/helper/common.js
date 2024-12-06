import fs from "fs";
import path from "path";
import { getSheets } from "../dbServices/sheetService.js";
import { appendRow, initSheets } from "../dbServices/dataService.js";
import dayjs from "dayjs";
import { DATE_FORMAT, TIME_FORMAT } from "../constants/common.js";

export const getAppScriptFile = sheet => {
    const TEMPLATE_JS_PATH = path.join(process.cwd(), 'helper/template.js');
    return {
        content: fs.readFileSync(TEMPLATE_JS_PATH).toString().replaceAll("#SHEET_NAME", sheet.SheetName),
        name: sheet.DocumentId
    };
}

export const notifyToSheets = async (ip, deviceName, message) => {
    const sheets = await getSheets();
    const sheetServices = await initSheets(
        sheets.rows.map((item) => ({
            SheetName: "THÔNG BÁO",
            DocumentId: item.DocumentId,
        })),
        ["ID", "IP", "Tên thiết bị", "Lỗi", "Ngày", "Giờ"]
    );

    await appendRow(
        sheetServices
            .filter((item) => item.isSuccess)
            .map((item) => item.data),
        [
            [
                dayjs().unix(),
                ip,
                deviceName,
                message,
                dayjs().format(DATE_FORMAT),
                dayjs().format(TIME_FORMAT),
            ],
        ]
    );
};