import { parseSpreadsheetUrl, makeSpreadsheetUrl, getGoogleApi } from '../google.js';

// DOM ----------------------------------------

function element(id) {
  return document.getElementById(id);
}

// Top submit new spreadsheet bar
var spreadsheet_submit = element("submit-spreadsheet"),
    spreadsheet_input = element("spreadsheet-url");

// Processing steps
var step_access = element("processing-step-access"),
    step_fields = element("processing-step-fields"),
    step_choose = element("processing-step-choose"),
    step_load = element("processing-step-load"),
    step_render = element("processing-step-render");

// Sign in message
var authorize_message = element("authorize-container"),
    signin_button = element("signin");

// Not your spreadsheet message
var access_message = element("access-issue");

// Issue on Google's end
var google_issue_step1 = element("google-issue-step-1"),
    google_issue_step2 = element("google-issue-step-2"),
    google_issue_step4 = element("google-issue-step-4");

// No sheet that ends in ".fields"
var fields_sheet_message = element("no-fields-sheet-issue");

// Initialize top bar ------------------------

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
  spreadsheet_input.value = makeSpreadsheetUrl(id);
}

match_query_with_input();

// Define the processing steps ---------------

function make_auth(on_signin) {
  return {
    signin: [{
      element: signin_button,
      afterAuth: on_signin
    }]
  };
}

const ACCESS_SPREADSHEET_BEFORE_AUTH = 0,
      ACCESS_SPREADSHEET_AFTER_AUTH = 1;

async function process(id, step) {
  var auth = null,
      metadata = null,
      fields = null,
      data = null;

  // Make auth config (signin / signout buttons)
  auth = make_auth({
    afterAuth: function() {
      authorize_message.classList.add("hidden");
      process(id, ACCESS_SPREADSHEET_AFTER_AUTH);
    }
  });

  // Step 1: Accessing the spreadsheet
  step_access.classList.remove("inactive");

  try {
    metadata = await access_spreadsheet(auth, id);
  } catch (error) {
    if (error == errors.GOOGLE_SPREADSHEET_UNAUTHORIZED) {
      if (step == ACCESS_SPREADSHEET_BEFORE_AUTH) {
        authorize_message.classList.remove("hidden");
        return;
      }
      access_message.classList.remove("hidden");
      return;
    }
    google_issue_step1.classList.remove("hidden");
    return;
  }


  // Step 2: Choose a sheet & parse its fields
  step_fields.classList.remove("inactive");

  var sheet = choose_single_sheet(metadata.sheets);
  if (!sheet) {
    fields_sheet_message.classList.remove("hidden");
    return;
  }
  try {
    fields = await get_data(auth, id, sheet + ".fields");
  } catch (error) {
    google_issue_step2.classList.remove("hidden");
    return;
  }


}

function access_spreadsheet(auth, id) {
  return new Promise(function(resolve, reject) {
    getGoogleApi(auth).then(function(api) {
      api.getSpreadsheetMetadata(id).then(function(response) {
        resolve(response.result);
      }).catch(reject);
    }).catch(reject);
  });
}

function get_data(auth, id, sheet) {
  return new Promise(function(resolve, reject) {
    getGoogleApi(auth).then(function(api) {
      api.getSpreadsheetValues(id, sheet).then(function(response) {
        resolve(response.result.values);
      }).catch(reject);
    }).catch(reject);
  });
}

// Step 2: Finding structure

// Step 3: Choosing visualizations

// Step 4: Loading data_table

// Step 5: Rendering
