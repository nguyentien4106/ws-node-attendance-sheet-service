import { GoogleSpreadsheet } from "google-spreadsheet";
import { JWT } from "google-auth-library";
import { Result } from "../models/common.js";
import { DATE_FORMAT, HEADER_ROW, TIME_FORMAT } from "../constants/common.js";
import { insertRawAttendances } from "./attendanceService.js";
import { handleSyncDataToSheet } from "../helper/dataHelper.js";
import dayjs from "dayjs";
import { createAppsScriptForSheet } from "../helper/gg/apiGoogleHelper.js";

// Initialize auth - see https://theoephraim.github.io/node-google-spreadsheet/#/guides/authentication
const serviceAccountAuth = new JWT({
    // env var values here are copied from service account credentials generated by google
    // see "Authentication" section in docs for more info
    email: "mcc-sanabox@sanaboxmcc.iam.gserviceaccount.com",
    key: "-----BEGIN PRIVATE KEY-----\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQCzJZ8q45BRzfWg\nrU+5f413yr7wpP4pyzsi1FDLtTf0QcgtjAYfa4Q6NzJ9IYTEzpnjxEXeSOQ7+NbD\nujVLUSJY6DpkGuZ+kgq2cwNb7G53t7sG6HUgcn1JXxtkQJ7RBf7gWwQ74OliREPS\nCf3AliMxzmkitba/+Gzu4c5DBWZNKNkA7o0wH6g2nsC0KRDdzgfjQ4hHo7b7VvJ0\nEvotV14pTASvBMt7j/q2Td48f1BC5VR4SI4zE6JJhpndc8PidpHeKRNa6d2gJZ0A\nSYUz+WrAY84E0xQGk3vpVggdQw3WuM6JzMdOHUgEZ7mvrH6Hw0uKP7/NJtenbsYp\nGeIulojjAgMBAAECggEABz6x3gNU+RkRKW+eNGNwyQWY942q2l9Jaslzqs+PMXXl\nldba5TNl+2VlSZjCQflNNO5hYE4fWM43DiYan8QxnHZL0HQGtxQ8IFdXZihZP43d\nkWJzmboM7Lf5bo7EdlyS/TzILOKkJLZGX6dYHpt3VXYl6f7whlzZcLjWEBvsSyfs\nID0J39wvrd/LFkhUrc0qI9K3krzp/jajYhCsCTATd/aIw9SeZmY65yzq1HwY48P6\nG6HOwLtd/d4nVhvwCIUTkq8a0M6E6k0960bqOMXRAhrQhkATEiQiEsKuM475shf1\n8hfih7WGzkp/6Yf1EmDzkdP9PSZAsKKTSjPxLKnhYQKBgQDgL2KuU4MlK4ZmzrZI\nuIyArFI1zpU2N7xZP1JyJgixrpneCdhei/RYOAUeyBfV/pcIZ/vR3oLsIJ39XaqP\nfEeSnBUuGAl3zLcBUxsToYD/kDRJSrcCIuSglTSCfqbE7TmzVvXwhlAjUuNSm8uX\n+eCwdleT+g79RyHB6GxB5Xf7IQKBgQDMkgG4bcu4DJFuEiEFvwaPfuTuX3IPJtOI\nuSet5lwFK+1DY2hBsbwwPKcdiX0+bT2SkESFQ9wa3+vRDluhqYXT2n66ot7Qld+K\n/zJYS7x8u3KHR8UsMHD7K6mHdsFtAMwL+wK83omPtfqm0CZND/e4kHK6VaKEffXe\nK2J4RA8ngwKBgQCzMu1sb3DrK0l5sE5g/rPAvv3P6Nu4xQCXTlh2yhQ1A14W8EO1\n/6VHRzBAlK0I70KHA6d08KoyWTgwqMiHfU4w0PbVK32V91tpgaapIHXe0sQYudJj\nsMST3/BjRx3DV+TBiAd7RcGVGtJ+2+34A1Mpes8yh7Wnm05Ok5zFZ8lqQQKBgAp1\nwL7EZnE/u0Psi2G21cgKjfweRz+9FX3dMckziSr+hwA2GgOZ6exxfX4GJLBHd6mB\n1O8XfC6nmnAzEr5eY6hkeKxkXY4+y5JY4CMhpD6gewetxMgwpeZB4kY57UP8kXJf\nYFF184S0ol9bL0orcdgvEp6yeD/cDPFSOJO7ryavAoGABnKWwzu9PDSHRBZzF1dx\n0Dk/nilGAB1ER9b0E37Wi2mpt1tdStyg27B7UzWN/J6YQbpumuRjs70PRDea3TQQ\nzv+VqsR832j1CzQeO0fTT7V7pZuy2mDZwT464Cr49QrRcYBVSvwV5T8L24TyXa76\nqUOryeRm29A7hiylV32D1so=\n-----END PRIVATE KEY-----\n",
    scopes: [
        "https://www.googleapis.com/auth/script.projects",
        "https://www.googleapis.com/auth/spreadsheets",
    ],
});

export const isSheetsValid = async (sheets) => {
    const result = [];
    let success = true;

    // Function to check a sheet's validity
    const validateSheet = async (sheet) => {
        try {
            const doc = new GoogleSpreadsheet(sheet.DocumentId, serviceAccountAuth);
            await doc.loadInfo();
            result.push(Result.Success(sheet));
        } catch (err) {
            console.error(err);
            const errorMessage = err.status === 404 
                ? `Document - ${sheet.DocumentId}: Không tìm thấy`
                : `Document - ${sheet.DocumentId}: ${err.message}`
            result.push(Result.Fail(err.code, errorMessage, sheets));
            success = false;
        }
    };

    // Validate all sheets
    await Promise.all(sheets.map(validateSheet));

    // If any validation failed, return failure result
    if (!success) {
        const messages = result.filter(item => !item.isSuccess).map(item => item.message).join(", ")
        return Result.Fail(500, messages, result);
    }

    // Create scripts for all valid sheets
    await Promise.all(
        sheets.map(async (sheet) => {
            try {
                await createAppsScriptForSheet(sheet.DocumentId, sheet.SheetName);
            } catch (err) {
                console.error("Failed to create script for sheet:", sheet.DocumentId);
            }
        })
    );

    return Result.Success(result);
};


export const initSheet = async (documentId, sheetName) => {
    try {
        const doc = new GoogleSpreadsheet(documentId, serviceAccountAuth);

        await doc.loadInfo(); // loads document properties and worksheets

        if (!(sheetName in doc.sheetsByTitle)) {
            return Result.Success(await doc.addSheet({ title: sheetName }));
        }

        return Result.Success(doc.sheetsByTitle[sheetName]);
    } catch (err) {
        console.error(err);
        return Result.Fail(err.code, err.message, { documentId, sheetName });
    }
};

export const initSheets = async (sheets, headers, isAddScript = false) => {
    const sheetServices = [];
    for (const sheet of sheets) {
        try {
            const doc = new GoogleSpreadsheet(
                sheet.DocumentId,
                serviceAccountAuth
            );

            await doc.loadInfo(); // loads document properties and worksheets
            if (!(sheet.SheetName in doc.sheetsByTitle)) {
                const newSheet = await doc.addSheet({ title: sheet.SheetName });
                newSheet.setHeaderRow(headers ?? HEADER_ROW, 1);
            }
            const sheetService = doc.sheetsByTitle[sheet.SheetName];
            sheetService.setHeaderRow(headers ?? HEADER_ROW, 1);
            sheetServices.push(sheetService);

        } catch (err) {
            console.error(`Sheet ${sheet.DocumentId} error:`, err.message);

            Result.Fail(
                500,
                `Document ${sheet.DocumentId} lỗi: ${err.message}`
            );
        }
    }

    return Result.Success(sheetServices);
};

export const appendRow = async (sheetServices, rows) => {
    for (const sheet of sheetServices) {
        const success = await sheet.addRows(rows);
    }
};

export const syncDataFromSheet = async (sheet) => {
    const doc = new GoogleSpreadsheet(sheet.DocumentId, serviceAccountAuth);
    await doc.loadInfo(); // loads document properties and worksheets

    if (!(sheet.SheetName in doc.sheetsByTitle)) {
        return Result.Fail(
            500,
            `Không tìm thấy ${sheet.SheetName} trong Document: ${sheet.DocumentId}`
        );
    }
    const service = doc.sheetsByTitle[sheet.SheetName];
    const rows = await service.getRows();
    const data = rows.map((row) => [
        +row.get(HEADER_ROW[1]),
        row.get(HEADER_ROW[2]),
        row.get(HEADER_ROW[3]),
        row.get(HEADER_ROW[4]),
        row.get(HEADER_ROW[5]),
        `${row.get(HEADER_ROW[6])} ${row.get(HEADER_ROW[7])}`,
        true,
    ]);
    const attendances = await insertRawAttendances(data);

    const rowsData = attendances.map((item) => [
        item.Id,
        item.DeviceId,
        item.DeviceName,
        item.UserId,
        item.UserName,
        item.Name,
        dayjs(item.VerifyDate).format(DATE_FORMAT),
        dayjs(item.VerifyDate).format(TIME_FORMAT),
    ]);

    const result = await handleSyncDataToSheet(rowsData, null, true);

    return Result.Success(result);
};
