import fs from "fs";
import path from "path";

export const getAppScriptFile = sheet => {
    const TEMPLATE_JS_PATH = path.join(process.cwd(), 'helper/template.js');
    return {
        content: fs.readFileSync(TEMPLATE_JS_PATH).toString().replaceAll("#SHEET_NAME", sheet.SheetName),
        name: sheet.DocumentId
    };
}