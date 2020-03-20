(function () {
  'use strict';

  const url_header = 'https://docs.google.com/spreadsheets/d/';

  function spreadsheet_url(id) {
    return url_header + id;
  } // DOM ----------------------------------------


  function element(id) {
    return document.getElementById(id);
  } // Top submit new spreadsheet bar


  var spreadsheet_submit = element("submit-spreadsheet"),
      spreadsheet_input = element("spreadsheet-url"); // Processing steps

  var step_access = element("processing-step-access"),
      step_fields = element("processing-step-fields"),
      step_choose = element("processing-step-choose"),
      step_load = element("processing-step-load"),
      step_render = element("processing-step-render"); // Sign in message

  var authorize_message = element("authorize-container"),
      signin_button = element("signin"); // Not your spreadsheet message

  var access_message = element("access-issue"); // Issue on Google's end

  var google_issue_step1 = element("google-issue-step-1"),
      google_issue_step2 = element("google-issue-step-2"),
      google_issue_step4 = element("google-issue-step-4"); // No sheet that ends in ".fields"

  var fields_sheet_message = element("no-fields-sheet-issue"); // Initialize top bar ------------------------

  function query_var(variable) {
    var query = window.location.search.substring(1);
    var vars = query.split('&');

    for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');

      if (decodeURIComponent(pair[0]) == variable) {
        return decodeURIComponent(pair[1]);
      }
    }

    return "";
  }

  function match_query_with_input() {
    var id = query_var("id");

    if (id.length == 0) {
      return;
    }

    spreadsheet_input.value = spreadsheet_url(id);
  }

  match_query_with_input(); // Step 2: Finding structure
  // Step 3: Choosing visualizations
  // Step 4: Loading data_table
  // Step 5: Rendering
})();