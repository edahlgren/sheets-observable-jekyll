import { isSpreadsheetUrl, parseSpreadsheetUrl } from '../google.js';

function element(id) {
  return document.getElementById(id);
}

// Submit spreadsheet url button
var spreadsheet_submit = element("submit-spreadsheet"),
    spreadsheet_input = element("spreadsheet-url");

var general_help = element("general-help"),
    url_issue = element("url-issue");

// Handle submitting the spreadsheet
spreadsheet_submit.onclick = function(event) {

  // Check for a spreadsheet url
  var url = spreadsheet_input.value;
  if (!isSpreadsheetUrl(url)) {
    return show_help();
  }

  // Parse the spreadsheet id from the url
  var id = parseSpreadsheetUrl(url);

  // Go to a page that will generate the report
  window.location.href = "report?id=" + id;
};

function show_help() {
  general_help.classList.add("hidden");
  url_issue.classList.remove("hidden");
}
