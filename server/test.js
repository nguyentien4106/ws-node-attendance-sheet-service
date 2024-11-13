import { google } from 'googleapis';
import fs from 'fs'
import readline from 'readline';

// Load client secrets from a file
const credentials = JSON.parse(fs.readFileSync('credentials.json'));

const { client_secret, client_id, redirect_uris } = credentials.installed;
const oAuth2Client = new google.auth.OAuth2(client_id, client_secret, redirect_uris[0]);

const TOKEN_PATH = 'token.json';

const parentId = "1HNds8-VenunJPtzfiUcx2fIf5-j72PF5UABLruM8jjY"
// Authenticate the user
function authorize() {
  return new Promise((resolve, reject) => {
    if (fs.existsSync(TOKEN_PATH)) {
      const token = fs.readFileSync(TOKEN_PATH);
      oAuth2Client.setCredentials(JSON.parse(token));
      resolve(oAuth2Client);
    } else {
      const authUrl = oAuth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: [
          'https://www.googleapis.com/auth/script.projects',
          'https://www.googleapis.com/auth/spreadsheets',
        ],
      });
      console.log('Authorize this app by visiting this URL:', authUrl);
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
      });
      rl.question('Enter the code from that page here: ', (code) => {
        rl.close();
        oAuth2Client.getToken(code, (err, token) => {
          if (err) return reject('Error retrieving access token');
          oAuth2Client.setCredentials(token);
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(token));
          resolve(oAuth2Client);
        });
      });
    }
  });
}

async function createAppsScriptForSheet() {
  const auth = await authorize();
  const script = google.script({ version: 'v1', auth });

  // Create a new Apps Script project
  const requestBody = {
    title: 'Script 1',
    parentId: parentId,
  }

  const { data } = await script.projects.create({
    requestBody: requestBody
  });

  const scriptId = data.scriptId;
  console.log('Created Apps Script project with ID:', scriptId);

  // Define Google Apps Script code to interact with the Google Sheet
  const scriptCode = `
    function removeDuplicatesAndSort() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA CHẤM CÔNG");
  const data = sheet.getDataRange().getValues();
  const rowsToDelete = [];
  const valueIndexMap = new Map();

  const length = data.length - 1;
  for (var i = length; i >= 1; i--) {
    const firstCellValue = data[i][0];
    const secondCellValue = data[i][1];

    if (valueIndexMap.has(firstCellValue)) {
      rowsToDelete.push(i + 1);
    } else {
      valueIndexMap.set(firstCellValue, i + 1);

      if (secondCellValue === "deleted") {
        rowsToDelete.push(i + 1);

      }
    }
  }

  rowsToDelete.sort((a, b) => b - a);
  for (const rowIndex of rowsToDelete) {
    sheet.deleteRow(rowIndex);
  }

  const lastRow = sheet.getLastRow() - 1;
  const lastColumn = sheet.getLastColumn();
  sheet.getRange(2, 1, lastRow, lastColumn)
       .sort({ column: 1, ascending: true });
}

  `;

  // Add code to the Apps Script project
  await script.projects.updateContent({
    scriptId,
    requestBody: {
      files: [
        {
          name: 'Code',
          type: 'SERVER_JS',
          source: scriptCode,
        },
        {
            name: 'appsscript',
            type: 'JSON',
            source: JSON.stringify({
                timeZone: 'America/New_York',
                dependencies: {},
                exceptionLogging: 'STACKDRIVER',
                webapp: {
                    access: 'ANYONE_ANONYMOUS',
                    executeAs: 'USER_DEPLOYING',
                },
            }),
        },
      ],
    },
  });

  console.log('Added code to the Apps Script project.');

//   // Deploy the Apps Script project
//   const { data: deploymentData } = await script.projects.deployments.create({
//     scriptId,
//     requestBody: {
//       versionNumber: 1,
//       manifestFileName: 'appsscript',
//       description: 'Initial Deployment',
//     },
//   });

//   console.log('Deployed Apps Script project:', deploymentData.deploymentId);
}

// Run the function
createAppsScriptForSheet().catch(console.error);
