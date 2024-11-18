import { google } from "googleapis";
import fs from "fs";
import readline from "readline";
import { logger } from "../../config/logger.js";
import { Result } from "../../models/common.js";
import path, { dirname } from "path";

// Load client secrets from a file
// path.join(__dirname, "credentials.json")
const credentialsPath = path.join(process.cwd(), 'helper/gg/credentials.json');
const credentials = JSON.parse(fs.readFileSync(credentialsPath));

const { client_secret, client_id } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(
    client_id,
    client_secret,
    'urn:ietf:wg:oauth:2.0:oob'
);

const TOKEN_PATH = path.join(process.cwd(), 'helper/gg/token.json');

// Authenticate the user
function authorize() {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(TOKEN_PATH)) {
            logger.info("Authorized using token.json file.")
            const token = fs.readFileSync(TOKEN_PATH);
            oAuth2Client.setCredentials(JSON.parse(token));
            resolve(oAuth2Client);
        } else {
            logger.info("Does not exist token.js file, authorize using google")

            const authUrl = oAuth2Client.generateAuthUrl({
                access_type: "offline",
                scope: [
                    "https://www.googleapis.com/auth/script.projects",
                    "https://www.googleapis.com/auth/spreadsheets",
                ],
            });
            logger.info("Authorize this app by visiting this URL:", authUrl);
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

export async function createAppsScriptForSheet(parentId, sheetName) {
    const auth = await authorize();
    const script = google.script({ version: "v1", auth });

    // Create a new Apps Script project
    const requestBody = {
        title: "onChangeSheet",
        parentId: parentId,
    };

    let scriptId;

    try{
        const { data } = await script.projects.create({
            requestBody: requestBody
        });
        scriptId = data.scriptId
        logger.info("Created Apps Script project with ID: " + scriptId)
    }
    catch(err) {
        return Result.Fail(500, `Failed to create App Scripts. ${err}`)
    }

    // Add code to the Apps Script project
    try{
        const TEMPLATE_JS_PATH = path.join(process.cwd(), 'helper/gg/template.js');
        const scriptCode = fs.readFileSync(TEMPLATE_JS_PATH).toString();

        await script.projects.updateContent({
            scriptId,
            requestBody: {
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
                            timeZone: "Asia/Ho_Chi_Minh",
                            dependencies: {},
                            exceptionLogging: "STACKDRIVER",
                            runtimeVersion: "V8",
                        }),
                    },
                ],
            },
        });
        logger.info("Added code to the Apps Script project.")
    }
    catch(err){
        return Result.Fail(500, `Failed to add App Scripts into project. ${err}`)
    }

    return Result.Success()
}

