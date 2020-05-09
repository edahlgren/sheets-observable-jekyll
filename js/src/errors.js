const ERROR_CANT_GET_GOOGLE_FILE = 0,
      ERROR_GOOGLE_RESOURCE_DOESNT_EXIST = 1,
      ERROR_CANT_GET_APP_FILE = 2,
      ERROR_APP_RESOURCE_DOESNT_EXIST = 3,
      ERROR_GOOGLE_SERVER_ISSUE = 4,
      ERROR_GOOGLE_CLIENT_INIT = 5,
      ERROR_GOOGLE_CLIENT_MISCONFIGURED = 6,
      ERROR_SPREADSHEET_UNAUTHORIZED = 7,
      ERROR_NO_SPREADSHEET = 8,
      ERROR_SPREADSHEET_API_GET = 9,
      ERROR_SPREADSHEET_VALUES_API_GET = 10,
      ERROR_BAD_SPREADSHEET_RANGE = 11,
      ERROR_NO_VISUALIZATIONS = 12,
      ERROR_PREPARING_VISUALIZATION_INPUT = 13,
      ERROR_RENDERING_VISUALIZATION = 14,
      ERROR_FORMATTING_VISUALIZATION = 15,
      ERROR_WITH_PLOT_URL = 16,
      ERROR_PLOT_URL_DOESNT_MATCH_DATA = 17;

const ISSUE_GOOGLE_FILE = 0,
      ISSUE_GOOGLE_SETUP = 1,
      ISSUE_GOOGLE_API = 2,
      ISSUE_APP_FILE = 3,
      ISSUE_APP_SETUP = 4,
      ISSUE_SPREADSHEET_ACCESS = 5,
      ISSUE_SPREADSHEET_DOESNT_EXIST = 6,
      ISSUE_NO_SHEET = 7,
      ISSUE_NO_FIELDS_SHEET = 8,
      ISSUE_BAD_FIELDS_SHEET = 9,
      ISSUE_FIELDS_SHEET_SYNC = 10,
      ISSUE_NO_VISUALIZATIONS = 11,
      ISSUE_URL_NO_SPREADSHEET_ID = 12,
      ISSUE_URL_NO_SPREADSHEET_SHEET = 13,
      ISSUE_URL_NO_VISUALIZATION = 14,
      ISSUE_URL_VISUALIZATION_NOT_SUPPORTED = 15,
      ISSUE_URL_PLOT_GENERAL = 16,
      ISSUE_URL_PLOT_DOESNT_MATCH_DATA = 17,
      ISSUE_NO_TEST_DATA = 18;

function errorToString(error_code) {
  switch (error_code) {
  case ERROR_CANT_GET_GOOGLE_FILE:
    return "Can't get Google file";
  case ERROR_GOOGLE_RESOURCE_DOESNT_EXIST:
    return "Google resource doesn't exit";
  case ERROR_CANT_GET_APP_FILE:
    return "Can't get App file";
  case ERROR_APP_RESOURCE_DOESNT_EXIST:
    return "App resource doesn't exit";
  case ERROR_GOOGLE_SERVER_ISSUE:
    return "Google API server issue";
  case ERROR_GOOGLE_CLIENT_INIT:
    return "Problem using the Google API client";
  case ERROR_GOOGLE_CLIENT_MISCONFIGURED:
      return "The Google API client was misconfigured";
  case ERROR_SPREADSHEET_UNAUTHORIZED:
    return "Unauthorized access to spreadsheet";
  case ERROR_NO_SPREADSHEET:
    return "Spreadsheet doesn't exist";
  case ERROR_SPREADSHEET_API_GET:
    return "Issue making API request sheets.spreadsheets.get";
  case ERROR_SPREADSHEET_VALUES_API_GET:
    return "Issue making API request sheets.spreadsheets.values.get";
  case ERROR_BAD_SPREADSHEET_RANGE:
    return "Bad spreadsheet range";
  case ERROR_NO_VISUALIZATIONS:
    return "No visualizations for this spreadsheet";
  case ERROR_PREPARING_VISUALIZATION_INPUT:
    return "Issue preparing visualization input";
  case ERROR_RENDERING_VISUALIZATION:
    return "Issue rendering visualization";
  case ERROR_FORMATTING_VISUALIZATION:
    return "Issue formatting visualization for the web";
  case ERROR_WITH_PLOT_URL:
    return "Plot url isn't formatted correctly";
  case ERROR_PLOT_URL_DOESNT_MATCH_DATA:
    return "Plot url doesn't match data header";
  default:
    return "App code general issue";
  }
}

function issueToString(issue_code) {
  switch (issue_code) {
  case ISSUE_GOOGLE_FILE:
    return "A necessary file provided by Google can't be downloaded right now. The best thing to do is to check your internet connection or try again in 15 minutes.";
  case ISSUE_GOOGLE_SETUP:
    return "A necessary API provided by Google can't be set up right now. The best thing to do is to check your internet connection or try again in 15 minutes.";
  case ISSUE_GOOGLE_API:
    return "A Google API needed by this demo isn't working right now. This type of issue is usually fixed by Google fairly quickly. The best thing to do is to try again in 15 minutes.";
  case ISSUE_APP_FILE:
    return "Part of this demo can't be downloaded right now. The best thing to do is to check your internet connection and try again.";
  case ISSUE_SPREADSHEET_ACCESS:
    return "It looks like you don't have access to this spreadsheet. Make sure the owner of this spreadsheet has shared it with you and then try again.";
  case ISSUE_SPREADSHEET_DOESNT_EXIST:
    return "It looks like this doesn't refer to a Google spreadsheet. That can happen if you accidently changed the 'id' in the url above, or if you used an unsupported spreadsheet. The best thing to do is to click the 'New Spreadsheet' button above, choose one of the supported sample spreadsheets, and try again.";
  case ISSUE_NO_FIELDS_SHEET:
  case ISSUE_BAD_FIELDS_SHEET:
  case ISSUE_FIELDS_SHEET_SYNC:
    return "It looks like you're trying to visualize a spreadsheet that isn't supported yet. The best thing to do is to click the 'New Spreadsheet' button above and choose one of the supported sample spreadsheets."
  case ISSUE_NO_VISUALIZATIONS:
    return "This is very unusual, but it looks like there are no visualizations for your data. This can happen if your spreadsheet doesn't have enough data. This shouldn't happen with the supported sample spreadsheets. So the best thing to do is to click the 'New Spreadsheet' button above and choose one of the sample spreadsheets.";
  case ISSUE_NO_SHEET:
    return "The sheet in the url above doesn't seem to exist in the spreadsheet anymore. The best thing to do is to click 'Back to Report' and refresh the page to regenerate the report and select a visualization again.";
  case ISSUE_URL_NO_SPREADSHEET_ID:
    return "It looks like there's something wrong with the url above. This can happen if you accidently changed the url above or if you opened a broken link. The best thing to do is to click the 'New Spreadsheet' button above and visualize the spreadsheet you're interested in again.";
  case ISSUE_URL_NO_SPREADSHEET_SHEET:
  case ISSUE_URL_NO_VISUALIZATION:
  case ISSUE_URL_VISUALIZATION_NOT_SUPPORTED:
  case ISSUE_URL_PLOT_GENERAL:
    return "It looks like there's something wrong with the url above. This can happen if you accidently changed the url above or if you opened a broken link. The best thing to do is to click 'Back to Report' and try selecting this visualization again.";
  case ISSUE_URL_PLOT_DOESNT_MATCH_DATA:
    return "It looks like some of columns in this spreadsheet were renamed or removed so this visualization can't be generated anymore. The best thing to do is to click 'Back to Report' and refresh the page to regenerate the report so all visualizations are based on what the spreadsheet looks right now.";
  case ISSUE_NO_TEST_DATA:
    return "There's no test data for this test id. Try using 'diseases' instead.";
  default:
    return "";
  }
}

function errorToIssue(error_code) {
  switch (error_code) {
  case ERROR_CANT_GET_GOOGLE_FILE:
    return ISSUE_GOOGLE_FILE;
  case ERROR_GOOGLE_RESOURCE_DOESNT_EXIST:
    return ISSUE_GOOGLE_SETUP;
  case ERROR_CANT_GET_APP_FILE:
    return ISSUE_APP_FILE;
  case ERROR_APP_RESOURCE_DOESNT_EXIST:
    return ISSUE_APP_SETUP;
  case ERROR_GOOGLE_SERVER_ISSUE:
  case ERROR_GOOGLE_CLIENT_INIT:
    return ISSUE_GOOGLE_API;
  case ERROR_SPREADSHEET_UNAUTHORIZED:
    return ISSUE_SPREADSHEET_ACCESS;
  case ERROR_NO_SPREADSHEET:
    return ISSUE_SPREADSHEET_DOESNT_EXIST;
  case ERROR_NO_VISUALIZATIONS:
    return ISSUE_NO_VISUALIZATIONS;
  case ERROR_WITH_PLOT_URL:
    return ISSUE_URL_PLOT_GENERAL;
  case ERROR_PLOT_URL_DOESNT_MATCH_DATA:
    return ISSUE_URL_PLOT_DOESNT_MATCH_DATA;
  default:
    return -1;
  }
}

function isAuthIssue(error) {
  if (!isKnownError(error)) return false;

  var code = parseErrorCode(error);
  if (code < 0) return false;

  return code == ERROR_SPREADSHEET_UNAUTHORIZED;
}

function makeKnownError(code, error) {
  var known_error = new Error();
  known_error.name = "KnownError-" + code;
  known_error.message = error.message;
  return known_error;
}

function isKnownError(error) {
  return error.name.startsWith("KnownError-");
}

function parseErrorCode(error) {
  var parts = error.name.split("-"),
      code = parseInt(parts[1], 10);
  return (isNaN(code) ? -1 : code);
}

function showLoadingKnownIssue(issue_code, error) {
  var issue = document.getElementById("loading-issue"),
      issue_container = issue.querySelector(".issue-help-container"),
      issue_help = issue.querySelector(".issue-help"),
      bug_report = issue.querySelector(".bug-report");

  if (!issue_code) {
    var error_code = parseErrorCode(error);
    issue_code = errorToIssue(error_code);
  }

  var issue_message = issueToString(issue_code);
  if (issue_message === "") {
    return false;
  }

  issue_help.textContent = issue_message;
  bug_report.classList.add("hidden");

  issue_container.classList.remove("hidden");
  issue.classList.remove("hidden");

  if (error)
    console.error("[known error]", error);

  return true;
}

function showLoadingBug(step, error) {
  var issue = document.getElementById("loading-issue"),
      bug_report = issue.querySelector(".bug-report"),
      step_message = issue.querySelector(".step-description"),
      issue_message = issue.querySelector(".issue-description"),
      details_message = issue.querySelector(".details-description");

  step_message.textContent = step;
  var error_code = -1;
  if (isKnownError(error)) {
    error_code = parseErrorCode(error);
  }
  issue_message.textContent = errorToString(error_code);
  details_message.textContent = error.message;

  bug_report.classList.remove("hidden");
  issue.classList.remove("hidden");
}

// Export error codes
export { ERROR_CANT_GET_GOOGLE_FILE as ERROR_CANT_GET_GOOGLE_FILE };
export { ERROR_GOOGLE_RESOURCE_DOESNT_EXIST as ERROR_GOOGLE_RESOURCE_DOESNT_EXIST };
export { ERROR_CANT_GET_APP_FILE as ERROR_CANT_GET_APP_FILE };
export { ERROR_APP_RESOURCE_DOESNT_EXIST as ERROR_APP_RESOURCE_DOESNT_EXIST };
export { ERROR_GOOGLE_SERVER_ISSUE as ERROR_GOOGLE_SERVER_ISSUE };
export { ERROR_GOOGLE_CLIENT_INIT as ERROR_GOOGLE_CLIENT_INIT };
export { ERROR_GOOGLE_CLIENT_MISCONFIGURED as ERROR_GOOGLE_CLIENT_MISCONFIGURED };
export { ERROR_SPREADSHEET_UNAUTHORIZED as ERROR_SPREADSHEET_UNAUTHORIZED };
export { ERROR_NO_SPREADSHEET as ERROR_NO_SPREADSHEET };
export { ERROR_SPREADSHEET_API_GET as ERROR_SPREADSHEET_API_GET };
export { ERROR_SPREADSHEET_VALUES_API_GET as ERROR_SPREADSHEET_VALUES_API_GET };
export { ERROR_BAD_SPREADSHEET_RANGE as ERROR_BAD_SPREADSHEET_RANGE };
export { ERROR_NO_VISUALIZATIONS as ERROR_NO_VISUALIZATIONS };
export { ERROR_PREPARING_VISUALIZATION_INPUT as ERROR_PREPARING_VISUALIZATION_INPUT };
export { ERROR_RENDERING_VISUALIZATION as ERROR_RENDERING_VISUALIZATION };
export { ERROR_FORMATTING_VISUALIZATION as ERROR_FORMATTING_VISUALIZATION };
export { ERROR_WITH_PLOT_URL as ERROR_WITH_PLOT_URL };
export { ERROR_PLOT_URL_DOESNT_MATCH_DATA as ERROR_PLOT_URL_DOESNT_MATCH_DATA };

// Export message codes
export { ISSUE_SPREADSHEET_ACCESS as ISSUE_SPREADSHEET_ACCESS };
export { ISSUE_SPREADSHEET_DOESNT_EXIST as ISSUE_SPREADSHEET_DOESNT_EXIST };
export { ISSUE_NO_FIELDS_SHEET as ISSUE_NO_FIELDS_SHEET };
export { ISSUE_BAD_FIELDS_SHEET as ISSUE_BAD_FIELDS_SHEET };
export { ISSUE_FIELDS_SHEET_SYNC as ISSUE_FIELDS_SHEET_SYNC };
export { ISSUE_NO_SHEET as ISSUE_NO_SHEET };
export { ISSUE_URL_NO_SPREADSHEET_ID as ISSUE_URL_NO_SPREADSHEET_ID };
export { ISSUE_URL_NO_SPREADSHEET_SHEET as ISSUE_URL_NO_SPREADSHEET_SHEET };
export { ISSUE_URL_NO_VISUALIZATION as ISSUE_URL_NO_VISUALIZATION };
export { ISSUE_URL_VISUALIZATION_NOT_SUPPORTED as ISSUE_URL_VISUALIZATION_NOT_SUPPORTED };
export { ISSUE_NO_TEST_DATA as ISSUE_NO_TEST_DATA };

// Export helpers
export { isAuthIssue as isAuthIssue };
export { isKnownError as isKnownError };
export { makeKnownError as makeKnownError }
export { showLoadingKnownIssue as showLoadingKnownIssue };
export { showLoadingBug as showLoadingBug };
