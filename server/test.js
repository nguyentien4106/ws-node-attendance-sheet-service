import { initSheets } from "./services/dataService.js";
import { getSheets } from "./services/sheetService.js";

async function a(){
    const result = await initSheets([{ DocumentId: "1-3Ypl4pkDcgdAfgAJExOY25dTuPJBFeFA5kXM03g_ys", SheetName: "DATA CHẤM CÔNG"}])
    console.log(result)
}
a().catch(console.error)