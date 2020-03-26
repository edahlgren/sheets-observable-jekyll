import { parseSpreadsheetUrl } from '../google.js';

// Submit spreadsheet url button
var spreadsheet_submit = document.getElementById("submit-spreadsheet"),
    spreadsheet_input = document.getElementById("spreadsheet-url");

var general_help = document.getElementById("general-help"),
    url_issue = document.getElementById("url-issue");

var allowed_spreadsheet_urls = new Set();
var examples = document.getElementsByClassName("spreadsheet-example");

// Setup buttons and urls for each example
for (var i = 0; i < examples.length; i++) {
  var example = examples.item(i);
  allowed_spreadsheet_urls.add(example.dataset.url);

  var choose = example.querySelector(".spreadsheet-example-choose");
  choose.onclick = function(event) {
    spreadsheet_input.value = example.dataset.url;
  };
}

// Handle submitting the spreadsheet
spreadsheet_submit.onclick = function(event) {
  // Check for an allowed spreadsheet url
  var url = spreadsheet_input.value;
  if (!allowed_spreadsheet_urls.has(url)) {
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
