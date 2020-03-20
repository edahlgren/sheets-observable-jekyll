(function () {
  'use strict';

  const url_header = 'https://docs.google.com/spreadsheets/d/';

  let re1 = /https\:\/\/docs\.google\.com\/spreadsheets\/d\/[\w\d]+\/.*/,
      re2 = /https\:\/\/docs\.google\.com\/spreadsheets\/d\/[\w\d]+/;

  function is_spreadsheet_url(url) {
    return (re1.test(url) || re2.test(url));
  }

  function spreadsheet_id(url) {
    var start = url_header.length,
        end = url.indexOf('/', start);

    if (end < 0)
      return url.substring(start);

    return url.substring(start, end);
  }

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
    if (!is_spreadsheet_url(url)) {
      return show_help();
    }

    // Parse the spreadsheet id from the url
    var id = spreadsheet_id(url);

    // Go to a page that will generate the report
    window.location.href = "report?id=" + id;
  };

  function show_help() {
    general_help.classList.add("hidden");
    url_issue.classList.remove("hidden");
  }

}());
