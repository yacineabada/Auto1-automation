const sheetName = "Auto1"

// The row that contains the header (default: first row of the sheet)
const headerRow = 1;

// Columns configuration :
// The key are gonna represent the columns, it can be set using numbers or letters example (A, B, C, ....)
const columns = {
  1: {
    label: 'Date',
    type: 'date',
    check: function (value) {
      // Throws an exception in order to have a custom object when testing the validity of the input
      if (value instanceof Date) {
        if(isNaN(value)) {
          throw {
            label: this.label,
            message: "The date format is not valid"
          }
        }
      } else if(!isValidDateString(value)) {
        throw {
          label: this.label,
          message: "The date format is not valid"
        }
      }

      return true;
    },
    required: true
  },
  2: {
    label: 'Category',
    type: 'string',
    required: true
  },
  3: {
    label: 'Amount',
    type: 'number',
    check: function(value) {
      if(isNaN(value)) {
        throw {
          label: this.label,
          message: "The amount must be a number"
        } 
      }

      if(value < 0) {
        throw {
          label: this.label,
          message: "The amount must be positive"
        } 
      }
    },
    format: (value) => {
      return parseFloat(value)
    },
    required: true
  },
  4: {
    label: 'Description',
    type: 'string',
    required: false
  }
}

function initialize() {
  // Get the configured spreadsheet
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
  
  // Check if the spreadsheet is empty
  // If not, skips the initialization
  if (sheet.getLastRow() !== 0 || sheet.getLastColumn() !== 0) {
    return;
  }

  // Get the configured columns
  Logger.log("Setting the headers from configured columns")
  const columnKeys = Object.keys(columns);
  // Get the header labels
  const headers = columnKeys.map(key => columns[key].label)
  // Create the header labels in the configured range 
  const headerRange = sheet.getRange(headerRow, columnKeys[0], 1, headers.length);
  headerRange.setValues([headers]);
  // Add some style to set it appart
  Logger.log("Setting the style of the header")
  headerRange.setFontWeight('bold');
  headerRange.setBackground('#d9ead3');
  headerRange.setHorizontalAlignment('center');
}