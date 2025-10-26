function isValidDateString(dateString) {
  // Match DD/MM/YYYY
  const regex = /^(\d{2})\/(\d{2})\/(\d{4})$/;
  const match = dateString.match(regex);
  if (!match) return false;

  const day = parseInt(match[1], 10);
  const month = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);

  // Basic range checks
  if (month < 1 || month > 12 || day < 1 || year < 1) return false;

  // Days in each month
  const daysInMonth = new Date(year, month, 0).getDate();
  return day <= daysInMonth;
}

function isEmptyRow(fields, sheet, row){
 for(const key of Object.keys(fields)){
    var data = sheet.getRange(row,key).getValue()
    if(!isEmpty(data)) return false
  }

  return true
}

function isEmpty(data){
  if(!data) return true;
  if(data instanceof Date) return isNaN(data.getTime()); 
  return  `${data}`.replace(" ", "").length == 0
}

function showToast(title, message, timer=5) {
  SpreadsheetApp.getActiveSpreadsheet().toast(title, message, timer);
}