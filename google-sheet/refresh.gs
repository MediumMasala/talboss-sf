// Tal Boss SF Resumes: refresh the list every 15 minutes.
// Cell A1 holds =IMPORTDATA("<feed url>&r="&$Z$1). Changing Z1 changes the URL, so Google fetches
// fresh data instead of serving its hourly cache.

function refresh() {
  SpreadsheetApp.getActiveSpreadsheet().getSheets()[0].getRange('Z1').setValue(Date.now());
}

// Run once: pick "setup" in the function menu above, press Run, and allow access.
function setup() {
  ScriptApp.getProjectTriggers().forEach(function (t) { ScriptApp.deleteTrigger(t); });
  ScriptApp.newTrigger('refresh').timeBased().everyMinutes(15).create();
  refresh();
}
