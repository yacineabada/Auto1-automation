function onOpen(e) {
  Logger.log("Initializing the sheet...");
  initialize();
  Logger.log("Sheet initialized...");
}

function onEdit(e) {

  var sheet = e.source.getActiveSheet();
  var currentRow = e.range.getRow();

  // Skip header row
  if (currentRow <= headerRow) return;
  
  var inputRange = e.range;
  var currentColumn = e.range.getColumn();
  
  // Get the current input value
  const value = e.value;

  Logger.log('Checking untreated errors');
  const currentError = getUntreatedErrors(sheet, currentRow);
  if(currentError && currentRow !== currentError.row) {
    Logger.log(currentError)
    Logger.log('Untreated error found')
    inputRange.clearContent();
    sheet.setActiveRange(sheet.getRange(currentError.row, currentError.column))
    showToast(`Please, correct the column ${currentError.label} at row ${currentError.row} before filling another column or row...`)
    return;
  } else {
    Logger.log('No Untreated error found')
  }

  Logger.log('Checking for missing required columns in previous rows...');
  if(verifyMissingInputsInPreviousRows(sheet, inputRange, currentRow)) {
    Logger.log("Aborting the current edit.");
    return;
  }
  Logger.log('No missing input found.');
  
  // Set the target Row as the current one, the target is the row we're supposed to fill. 
  var targetRow = currentRow;

  // Search for the right row to fill, which is supposed to be the next empty row.
  // With this, we avoid having blank rows between entries
  // For example : if I fill the 2nd row and then decide to fill the 6th row, this will automatically set it back to the 3rd row
  while(isEmptyRow(columns, sheet, targetRow - 1)) {
    targetRow--;
  }
  
  // If we find out that the current row that we were filling is not the one we were supposed to,
  // Move the entry to the target row, which is the one we are supposed to fill.
  if(targetRow != currentRow) {
    // Clear the selected cell's value because we're not supposed to write there
    inputRange.clearContent();
    // Change the input cell into the correct one
    inputRange = sheet.getRange(targetRow, currentColumn);
    // Insert the value inside that cell
    inputRange.setValue(value);
    // Select that cell
    sheet.setActiveRange(inputRange);
  }
  
  Logger.log("Verifying the input constraints")
  validateInput(sheet, inputRange, value);
}

function validateInput(sheet, inputRange, value) {
  const columnIndex = inputRange.getColumn();
  const column = columns[columnIndex];
  // We'll use the try/catch in order to avoid using true/false return value
  // With true/false we will have to check each column type and set a custom error message,
  // With the try/catch we can get retrieve the error message via the thrown object directly
  try {
    if(!isEmpty(value) && column.check) {
      column.check(value);
    }

    inputRange.setBackground(null);
  } catch(error) {
    sheet.setActiveRange(sheet.getRange(inputRange.getRow(), inputRange.getColumn()));
    inputRange.setBackground('red');
    showToast("An input is invalid", error.message)
  }
}

function getUntreatedErrors(sheet, currentRow) {
  var verificationRow = headerRow + 1;
  while(!isEmptyRow(columns, sheet, verificationRow)) {
    if(verificationRow === currentRow) {
      break;
    }

    for(const key of Object.keys(columns)) {
      const range = sheet.getRange(verificationRow, key);      
      const column = columns[key];
      try {
        const value = range.getValue();
        if(!isEmpty(value) && column.check) {
          column.check(value);
        }
      } catch(error) {
        Logger.log(error);
        return {
          row: range.getRow(),
          column: range.getColumn(),
          ...error
        }
      }
    }

    verificationRow++;
  }

  return null;
}

function verifyMissingInputsInPreviousRows(sheet, inputRange, currentRow) {
  var verificationRow = headerRow + 1;
  while(!isEmptyRow(columns, sheet, verificationRow)) {
    const missingFields = getMissingFields(sheet, verificationRow);
    if(missingFields.length > 0) {
      if(verificationRow === currentRow) {
        break;
      }

      Logger.log(`Missing columns were found : ${JSON.stringify(missingFields)}`)
      Logger.log(`Clearing current input...`)
      inputRange.clearContent();
      sheet.setActiveRange(sheet.getRange(verificationRow, missingFields[0].column));
      for(const missingField of missingFields) {
        sheet.getRange(verificationRow, missingField.column).setBackground("red")
      }
      
      showToast(`Please, make sure to fill all the required inputs (${missingFields.map(field => field.label).join(', ')}) before filling another column or row...`)
      return true;
    }
    verificationRow++;
  }

  return false;
}

function validateRow(sheet, row) {
  var missingFields = getMissingFields(sheet, row);
  
  if (missingFields.length > 0) {
    
    var ui = SpreadsheetApp.getUi();
   /* ui.alert(
      '⚠️ Row ' + row + ' is incomplete!',
      'Missing fields: ' + missingFields.join(', ') + '\n\nPlease complete it before continuing.',
      ui.ButtonSet.OK
    );
    */
    // Highlight incomplete row in red
    sheet.getRange(row, 1, 1, 4).setBackground('#ffcccc');
    
    // Move cursor back to incomplete row
   // sheet.setActiveRange(sheet.getRange(row, 1));
  }
}

function getMissingFields(sheet, row) {
  const missingFields = [];
  for(const key of Object.keys(columns)){
    const data = sheet.getRange(row,key).getValue()
    const column = columns[key];
    Logger.log(data);
    if(column.required && isEmpty(data)) missingFields.push({
      row,
      column: parseInt(key),
      label: column.label,
      message:`${column.label} is missing`
    })
  }

  return missingFields
}






