function removeDuplicatesAndSort() {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("DATA CHẤM CÔNG");
    const data = sheet.getDataRange().getValues();
    const rowsToDelete = [];
    const valueIndexMap = new Map();
  
    // Iterate from the last row to the first row (reverse order)
    const ilength = data.length - 1;
    for (var i = ilength; i >= 1; i--) { // Skip the header row
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
    // rowsToDelete.sort((a, b) => b - a);
    // Function to sort in descending order
    function descendingSort(a, b) {
        return b - a;
    }

    // Delete rows marked for deletion from bottom to top to prevent shifting issues
    rowsToDelete.sort(descendingSort);
    
    const rowsToDeleteLength = rowsToDelete.length;
    for(var i = 0; i < rowsToDeleteLength; i++){
        sheet.deleteRow(rowsToDelete[i]);
    }
  
    // Sort the sheet by the first column in ascending order
    sheet.getRange(2, 1, sheet.getLastRow() - 1, sheet.getLastColumn())
         .sort({ column: 1, ascending: true });
  
    sheet.getRange(2, 7, sheet.getLastRow() - 1).setNumberFormat("DD/MM/YYYY");

    // Add or refresh the 'onChange' trigger
    const triggers = ScriptApp.getProjectTriggers();
    for (var i = 0; i < triggers.length; i++) {
        if (triggers[i].getHandlerFunction() === 'removeDuplicatesAndSort') {
        ScriptApp.deleteTrigger(triggers[i]); // Remove any existing trigger to avoid duplication
        }
    }
  
    ScriptApp.newTrigger('removeDuplicatesAndSort')
      .forSpreadsheet(SpreadsheetApp.getActiveSpreadsheet())
      .onChange()
      .create();
}
  