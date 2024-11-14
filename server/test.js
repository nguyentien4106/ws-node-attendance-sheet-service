import { google } from "googleapis";
import fs from "fs";
import readline from "readline";
import { initSheets } from "./services/dataService.js";
import path from "path";
import { logger } from "./config/logger.js";
// Load client secrets from a file
const credentials = JSON.parse(fs.readFileSync("credentials.json"));

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    redirect_uris[0]
);

const TOKEN_PATH = "token.json";

// Authenticate the user
function authorize() {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(TOKEN_PATH)) {
            const token = fs.readFileSync(TOKEN_PATH);
            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        } else {
            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: "offline",
                scope: [
                    "https://www.googleapis.com/auth/script.projects",
                    "https://www.googleapis.com/auth/spreadsheets",
                ],
            });
            console.log("Authorize this app by visiting this URL:", authUrl);
            const rl = readline.createInterface({
                input: process.stdin,
                output: process.stdout,
            });
            rl.question("Enter the code from that page here: ", (code) => {
                rl.close();
                oAuth2Client.getToken(code, (err, token) => {
                    if (err) return reject("Error retrieving access token");
                    oAuth2Client.setCredentials(token);
                    fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
                    resolve(oAuth2Client);
                });
            });
        }
    });
}

async function createAppsScriptForSheet(parentId, sheetName) {
    const auth = await authorize();
    const script = google.script({ version: "v1", auth });

    // Create a new Apps Script project
    const requestBody = {
        title: "onChangeSheet",
        parentId: parentId,
    };

    console.log('requestBody', requestBody)
    let scriptId;

    try {
        const { data } = await script.projects.create({
            requestBody: requestBody
        });
        scriptId = data.scriptId
    }
    catch (err) {
        console.log(err)
        return
    }


    // Add code to the Apps Script project
    try {
        const TEMPLATE_JS_PATH = path.join(process.cwd(), 'template.js');
        const scriptCode = fs.readFileSync(TEMPLATE_JS_PATH).toString().replace('#SHEET_NAME#', sheetName);

        const updateContentRequestBody = {
            files: [
                {
                    name: "Code",
                    type: "SERVER_JS",
                    source: scriptCode,
                },
                {
                    name: "appsscript",
                    type: "JSON",
                    source: JSON.stringify({
                        timeZone: "America/New_York",
                        dependencies: {},
                        exceptionLogging: "STACKDRIVER",
                        webapp: {
                            access: "ANYONE_ANONYMOUS",
                            executeAs: "USER_DEPLOYING",
                        },
                    }),
                },
            ],
        };
        console.log('script id', {
            scriptId: scriptId,
            requestBody: updateContentRequestBody
        })
        await script.projects.updateContent({
            scriptId: scriptId,
            requestBody: updateContentRequestBody
        });

        logger.info("Added code to the Apps Script project.")
    }
    catch (err) {
        console.log(err)
    }

}



createAppsScriptForSheet('1E_v3eTVBFMxaAf_Z3ZTZp9-rNdjDDrO3DVcw8jxWDf0', 'Sheet1').catch(console.error)