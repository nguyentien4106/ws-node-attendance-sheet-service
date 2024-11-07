How to run this code:
1. copy docker-compose.yml into your box
2. docker pull 
3. docker up
4. waiting for the app start

How to config Sheet:
init this appscript 

```
function removeDuplicatesAndSort() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  const data = sheet.getDataRange().getValues();
  const rowsToDelete = [];
  const valueIndexMap = new Map();

  // Iterate from the last row to the first row (reverse order)
  for (let i = data.length - 1; i >= 1; i--) { // Skip the header row
    const firstCellValue = data[i][0];
    const secondCellValue = data[i][1];

    if (valueIndexMap.has(firstCellValue)) {
      // If a duplicate row is found, mark it for deletion
      rowsToDelete.push(i + 1);
    } else {
      // Store the last occurrence of each unique first cell value
      valueIndexMap.set(firstCellValue, i + 1);

      // If the second cell contains "deleted," mark all rows with this value for deletion
      if (secondCellValue === "deleted") {
        // Mark the last occurrence for deletion
        rowsToDelete.push(i + 1);

        // Look upwards to find any previous rows with the same first cell value
        for (let j = i - 1; j >= 1; j--) {
          if (data[j][0] === firstCellValue) {
            rowsToDelete.push(j + 1);
          }
        }
      }
    }
  }

  // Delete rows marked for deletion from bottom to top to prevent shifting issues
  rowsToDelete.sort((a, b) => b - a);
  for (const rowIndex of rowsToDelete) {
    sheet.deleteRow(rowIndex);
  }

  // Sort the sheet by the first column in ascending order
  sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
       .sort({ column: 1, ascending: true });
}

```

config this code trigger on change by spreadsheet


remember add header and add permission into "mcc-sanabox@sanaboxmcc.iam.gserviceaccount.com"

