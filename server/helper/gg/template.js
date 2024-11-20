function removeDuplicatesAndSort() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const specificSheet = spreadsheet.getSheetByName("#SHEET_NAME");
  const sheets = spreadsheet.getSheets();

  // Rule for #SHEET_NAME
  if (specificSheet) {
      processSheet(specificSheet, true); // Process old rule and "deleted"
  }

  // Rule for all sheets: only process "deleted"
  sheets.forEach(sheet => {
      if (sheet.getName() !== "#SHEET_NAME") {
          processSheet(sheet, false); // Only process "deleted"
      }
  });

  // Add or refresh the 'onChange' trigger
  const triggers = ScriptApp.getProjectTriggers();
  for (var i = 0; i < triggers.length; i++) {
      if (triggers[i].getHandlerFunction() === 'removeDuplicatesAndSort') {
          ScriptApp.deleteTrigger(triggers[i]); // Remove any existing trigger to avoid duplication
      }
  }

  ScriptApp.newTrigger('removeDuplicatesAndSort')
      .forSpreadsheet(spreadsheet)
      .onChange()
      .create();
}

function processSheet(sheet, includeDuplicatesRule) {
  const data = sheet.getDataRange().getValues();
  const rowsToDelete = [];
  const valueIndexMap = new Map();

  // Iterate from the last row to the first row (reverse order)
  const ilength = data.length - 1;
  for (var i = ilength; i >= 1; i--) { // Skip the header row
      const firstCellValue = data[i][0];
      const secondCellValue = data[i][1];

      if (includeDuplicatesRule && valueIndexMap.has(firstCellValue)) {
          // If a duplicate row is found, mark it for deletion
          rowsToDelete.push(i + 1);
      } else {
          if (includeDuplicatesRule) {
              // Store the last occurrence of each unique first cell value
              valueIndexMap.set(firstCellValue, i + 1);
          }

          // If the second cell contains "deleted," mark all rows with this value for deletion
          if (secondCellValue === "deleted") {
              // Mark the last occurrence for deletion
              rowsToDelete.push(i + 1);

              // Look upwards to find any previous rows with the same first cell value
              const jlength = i - 1;
              for (var j = jlength; j >= 1; j--) {
                  if (data[j][0] === firstCellValue) {
                      rowsToDelete.push(j + 1);
                  }
              }
          }
      }
  }

  // Delete rows marked for deletion from bottom to top to prevent shifting issues
  rowsToDelete.sort((a, b) => b - a);
  const rowsToDeleteLength = rowsToDelete.length;
  for (var i = 0; i < rowsToDeleteLength; i++) {
      sheet.deleteRow(rowsToDelete[i]);
  }

  if(sheet.getLastRow() <= 1){
    return;
  }
  
  // Sort the sheet by the first column in ascending order (only for the specific sheet)
  if (includeDuplicatesRule && sheet.getLastRow() > 1) { // Ensure there's data to sort
      sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
          .sort({ column: 1, ascending: true });
  }

  // Format column 7 as "DD/MM/YYYY"
  if (sheet.getLastColumn() >= 7) {
      sheet.getRange(2, 7, sheet.getLastRow() - 1).setNumberFormat("DD/MM/YYYY");
  }
}
