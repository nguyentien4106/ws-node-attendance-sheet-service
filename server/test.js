import { appendRow, initSheets } from "./services/sheetService.js";
import { getUID, insertNewUser } from "./services/userService.js";

// initSheets([
//     {
//         DocumentId: "1qPrnFffcnwIAkRHoyQnsuuAGkZaC1l3SSCn2KuZH3Zo",
//         SheetName: "Sheet1"
//     },
//     {
//         DocumentId: "1xdgwVu8Cbg19EYvwg8bwhrW0d-Q9ZNFv9AahfuhNpFE",
//         SheetName: "Sheet1"
//     }
// ]).then(res => {
//     appendRow(res, ["1", "2", "3", "3", "5"])
// })

getUID("192.168.1.201").then(res => {
    if(res.rowCount){
        console.log(res.rows[0].UID)
    }
})