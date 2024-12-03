function processSheet() {
    // Mở sheet hiện tại
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("#SHEET_NAME");
    const data = sheet.getDataRange().getValues(); // Lấy toàn bộ dữ liệu
    const lastRow = data.length; // Số dòng cuối cùng
    const lastRowData = data[lastRow - 1]; // Dòng cuối cùng
  
    // Kiểm tra giá trị ô thứ 2 dòng cuối cùng
    const secondColValue = lastRowData[1]; 
  
    if (secondColValue === "CLEAR") {
      clearSheet(sheet, data);
    } else if (secondColValue === "DELETED") {
      deleteMatchingRows(sheet, data);
    }
  
    // Loại bỏ các dòng bị trùng lặp
    removeDuplicates(sheet);
  }
  
  function clearSheet(sheet, data) {
    const rowsToKeep = [data[0]]; // Luôn giữ lại dòng tiêu đề (header)
  
    
    // Duyệt qua từng dòng
    for (let i = 1; i < data.length - 1; i++) {
      const row = data[i];
      const firstCol = row[0]; // Cột đầu tiên
      const eighthCol = row[8]; // Cột thứ 8
  
      // Giữ lại dòng nếu cột đầu tiên trống hoặc cột thứ 8 có giá trị "X"
      if (!firstCol || eighthCol === "X") {
        rowsToKeep.push(row);
      }
    }
  
    // Xóa toàn bộ sheet
    sheet.clear();
  
    // Ghi lại các dòng cần giữ
    sheet.getRange(1, 1, rowsToKeep.length, rowsToKeep[0].length).setValues(rowsToKeep);
  }
  
  function deleteMatchingRows(sheet, data) {
    const rowsToDelete = new Set();
  
    // Duyệt qua từng dòng và tìm cặp giá trị trùng khớp
    for (let i = 0; i < data.length; i++) {
      const valueToFind = data[i][0]; // Cột đầu tiên
      if (valueToFind) {
        for (let j = i + 1; j < data.length; j++) {
          if (data[j][0] === valueToFind) {
            rowsToDelete.add(i);
            rowsToDelete.add(j);
          }
        }
      }
    }
  
    // Loại bỏ các dòng
    const remainingRows = data.filter((_, index) => !rowsToDelete.has(index));
  
    // Xóa toàn bộ sheet
    sheet.clear();
  
    // Ghi lại dữ liệu sau khi loại bỏ
    sheet.getRange(1, 1, remainingRows.length, remainingRows[0].length).setValues(remainingRows);
  }
  
  function removeDuplicates(sheet) {
    const data = sheet.getDataRange().getValues();
    const header = data[0]; // Lấy dòng tiêu đề
    const rows = data.slice(1); // Lấy dữ liệu (bỏ dòng tiêu đề)
  
    const latestRows = new Map();
  
    // Duyệt qua từng dòng
    rows.forEach(row => {
      const rowKey = row[0]; // Giá trị ở cột đầu tiên
      if (rowKey) {
        // Ghi đè giá trị cũ nếu trùng (Map luôn giữ giá trị cuối cùng)
        latestRows.set(rowKey, row);
      }
    });
  
    // Chuyển Map thành mảng dữ liệu (giữ thứ tự như Map)
    const uniqueData = [header, ...Array.from(latestRows.values())];
  
    // Xóa toàn bộ sheet
    sheet.clear();
  
    // Ghi lại dữ liệu đã loại bỏ trùng lặp
    sheet.getRange(1, 1, uniqueData.length, uniqueData[0].length).setValues(uniqueData);
  }
  
  