
function createEndOfMonthTrigger() {
  ScriptApp.newTrigger('generateMonthlyReport')
    .timeBased()
    .onMonthDay(1)
    .atHour(0)
    .create();
}


function generateMonthlyReport() { 
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sourceSheet = ss.getActiveSheet();

  var lastRow = sourceSheet.getLastRow();

  if (lastRow <= 1) {
    SpreadsheetApp.getUi().alert('No data found!');
    return;
  }

  var data = sourceSheet.getRange(2, 1, lastRow - 1, 4).getValues();
  Logger.log(data)
  
  // calculate the full amount for each category
  var categoryTotals = {};

  for (var i = 0; i < data.length; i++) { 

    const category = data[i][1];
    const amount = Number(data[i][2]);

    categoryTotals[category] = (categoryTotals[category] || 0 ) + amount;

  }

  Logger.log(categoryTotals)

  // Create new report sheet

  const teamName = ss.getName();
  var year = new Date().getFullYear();
  // month count starts from 0 that is why we add 1 here
  var monthStr = new Date().getMonth() + 1;

  // Generating the report's name
  var reportSheetName = `${teamName}_${year}_${monthStr}`;
  // create new tab in the sheet with the name "teamname_yyyy_MM"
  var reportSheet = ss.insertSheet(reportSheetName);


  // Populating the report headers

    reportSheet.getRange(1, 1).setValue('Monthly Expense Report');
    reportSheet.getRange(1, 1).setFontSize(16).setFontWeight('bold');

    reportSheet.getRange(2, 1, 1, 2).setValues([['Category', 'Expenses']]);
    reportSheet.getRange(2, 1, 1, 2).setFontWeight('bold');

    let index = 3;
    for (let key in categoryTotals) {
      reportSheet.getRange(index, 1, 1, 2).setValues([[key, categoryTotals[key]]]);
      index++;
    }
  

  SpreadsheetApp.flush();

  const recipientEmail = "yacine1287@gmail.com";
  const subject = `Your Report Sheet - ${reportSheetName}`;
  const body = "Hello,\n\nPlease find attached your report sheet.\n\nBest regards.";

  // Export the active sheet as Excel (.xlsx)
  const exportUrl = ss.getUrl().replace(/edit$/, '') +
    'export?exportFormat=xlsx&format=xlsx' +
    '&gid=' + reportSheet.getSheetId();

  const token = ScriptApp.getOAuthToken();
  const response = UrlFetchApp.fetch(exportUrl, {
    headers: { Authorization: 'Bearer ' + token }
  });

  // Convert to blob for attachement to the email
  const blob = response.getBlob().setName(reportSheetName + ".xlsx");

  MailApp.sendEmail({
    to: recipientEmail,
    subject: subject,
    body: body,
    attachments: [blob]
  });

  // === CALENDAR INVITE PART ===
  const calendar = CalendarApp.getDefaultCalendar();
 
  const startTime = new Date();
  startTime.setDate(startTime.getDate() + 1);

  const dayOfWeek = startTime.getDay();
  // avoiding weekends
  if (dayOfWeek === 6) { // Saturday
    startTime.setDate(startTime.getDate() + 2);
  } else if (dayOfWeek === 0) { // Sunday
    startTime.setDate(startTime.getDate() + 1);
  }

  // Set the time to 10:00 AM
  startTime.setHours(10, 0, 0, 0);
  // making the meeting lasts one hour
  const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // +1 hour

  calendar.createEvent(
    "Monthly Finance Review Meeting",
    startTime,
    endTime,
    {
      guests: recipientEmail,
      sendInvites: true,
      description: `Discussion of the monthly finance report - ${reportSheetName}.\nReport was emailed today.`
    }
  );

    // === NOTIFICATION EMAIL ===
  const noteSubject = "Finance Review Meeting Scheduled";

  const noteBody =
    "Hello Finance Team,\n\n" +
    "The monthly finance review meeting has been scheduled.\n" +
    "📅 Date: " + startTime.toDateString() + "\n" +
    "🕒 Time: " + startTime.toLocaleTimeString() + "\n\n" +
    "The calendar invite has been sent to your Google Calendar.\n\n" +
    "Best regards,\nFinance Automation";

  MailApp.sendEmail({
    to: recipientEmail,
    subject: noteSubject,
    body: noteBody
  });

}