const ERROR_GOOGLE_RESOURCE_DOESNT_EXIST = 0,
      ERROR_APP_RESOURCE_DOESNT_EXIST = 1,
      ERROR_GOOGLE_SERVER_ISSUE = 2,
      ERROR_GOOGLE_CLIENT_INIT = 3,
      ERROR_GOOGLE_CLIENT_MISCONFIGURED = 4,
      ERROR_SPREADSHEET_UNAUTHORIZED = 5,
      ERROR_NO_SPREADSHEET = 6,
      ERROR_SPREADSHEET_API_GET = 7,
      ERROR_SPREADSHEET_VALUES_API_GET = 8,
      ERROR_BAD_SPREADSHEET_RANGE = 9;

const ISSUE_GOOGLE_RESOURCE = 0,
      ISSUE_GOOGLE_API = 1,
      ISSUE_SPREADSHEET_ACCESS = 2,
      ISSUE_SPREADSHEET_DOESNT_EXIST = 3,
      ISSUE_NO_FIELDS_SHEET = 4,
      ISSUE_BAD_FIELDS_SHEET = 5,
      ISSUE_FIELDS_SHEET_SYNC = 6;

function errorToString(error_code) {
  switch (error_code) {
  case ERROR_GOOGLE_RESOURCE_DOESNT_EXIST:
    return "Google resource doesn't exit";
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
  default:
    return "App code general issue";
  }
}

function issueToString(issue_code) {
  switch (issue_code) {
  case ISSUE_GOOGLE_RESOURCE:
    return "A necessary file provided by Google can't be downloaded right now. The best thing to do is to check your internet connection or try again in 15 minutes.";
  case ISSUE_GOOGLE_API:
    return "A Google API needed by this demo isn't working right now. This type of issue is usually fixed by Google fairly quickly. The best thing to do is to try again in 15 minutes.";
  case ISSUE_SPREADSHEET_ACCESS:
    return "It looks like you don't have access to this spreadsheet. Make sure the owner of this spreadsheet has shared it with you and then try again.";
  case ISSUE_SPREADSHEET_DOESNT_EXIST:
    return "It looks like this doesn't refer to a Google spreadsheet. That can happen if you accidently changed the 'id' in the url above, or if you used an unsupported spreadsheet. The best thing to do is to click the 'New Spreadsheet' button above, choose one of the supported sample spreadsheets, and try again.";
  case ISSUE_NO_FIELDS_SHEET:
  case ISSUE_BAD_FIELDS_SHEET:
  case ISSUE_FIELDS_SHEET_SYNC:
    return "It looks like you're trying to visualize a spreadsheet that isn't supported yet. The best thing to do is to click the 'New Spreadsheet' button above and choose one of the sample spreadsheets."
  default:
    return "";
  }
}

function errorToIssue(error_code) {
  switch (error_code) {
  case ERROR_GOOGLE_RESOURCE_DOESNT_EXIST:
      return ISSUE_GOOGLE_RESOURCE;
  case ERROR_GOOGLE_SERVER_ISSUE:
  case ERROR_GOOGLE_CLIENT_INIT:
    return ISSUE_GOOGLE_API;
  case ERROR_SPREADSHEET_UNAUTHORIZED:
    return ISSUE_SPREADSHEET_ACCESS;
  case ERROR_NO_SPREADSHEET:
    return ISSUE_SPREADSHEET_DOESNT_EXIST;
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
export { ERROR_GOOGLE_RESOURCE_DOESNT_EXIST as ERROR_GOOGLE_RESOURCE_DOESNT_EXIST };
export { ERROR_APP_RESOURCE_DOESNT_EXIST as ERROR_APP_RESOURCE_DOESNT_EXIST };
export { ERROR_GOOGLE_SERVER_ISSUE as ERROR_GOOGLE_SERVER_ISSUE };
export { ERROR_GOOGLE_CLIENT_INIT as ERROR_GOOGLE_CLIENT_INIT };
export { ERROR_GOOGLE_CLIENT_MISCONFIGURED as ERROR_GOOGLE_CLIENT_MISCONFIGURED };
export { ERROR_SPREADSHEET_UNAUTHORIZED as ERROR_SPREADSHEET_UNAUTHORIZED };
export { ERROR_NO_SPREADSHEET as ERROR_NO_SPREADSHEET };
export { ERROR_SPREADSHEET_API_GET as ERROR_SPREADSHEET_API_GET };
export { ERROR_SPREADSHEET_VALUES_API_GET as ERROR_SPREADSHEET_VALUES_API_GET };
export { ERROR_BAD_SPREADSHEET_RANGE as ERROR_BAD_SPREADSHEET_RANGE };

// Export message codes
export { ISSUE_SPREADSHEET_ACCESS as ISSUE_SPREADSHEET_ACCESS };
export { ISSUE_NO_FIELDS_SHEET as ISSUE_NO_FIELDS_SHEET };
export { ISSUE_BAD_FIELDS_SHEET as ISSUE_BAD_FIELDS_SHEET };
export { ISSUE_FIELDS_SHEET_SYNC as ISSUE_FIELDS_SHEET_SYNC };

// Export helpers
export { isAuthIssue as isAuthIssue };
export { makeKnownError as makeKnownError }
export { showLoadingKnownIssue as showLoadingKnownIssue };
export { showLoadingBug as showLoadingBug };
