// Imports ------------------------------------

import errors from "../errors.js";

// Constants ----------------------------------

const ACCESS_SPREADSHEET_BEFORE_AUTH = 0,
      ACCESS_SPREADSHEET_AFTER_AUTH = 1,
      CHOOSE_SPREADSHEET = 2,
      READ_FIELDS_DATA = 3,
      ORGANIZE_FIELDS_DATA = 4,
      CHOOSE_VISUALIZATIONS = 5,
      DOWNLOAD_DATA = 6,
      MATCH_HEADER_TO_FIELDS = 7,
      RENDER_VISUALIZATIONS = 8;

const GENERAL_GOOGLE_ISSUE = 0,
      SPREADSHEET_ACCESS_ISSUE = 1,
      NEED_FIELDS_SHEET = 2,
      FIELDS_SHEET_IS_MALFORMED = 3;

// DOM ----------------------------------------

// Sign in message
var authorize_message = document.getElementById("authorize-container");

// General processing issues
var step1_issue = document.getElementById("issue-step-1"),
    step2_issue = document.getElementById("issue-step-2"),
    step3_issue = document.getElementById("issue-step-3"),
    step4_issue = document.getElementById("issue-step-4"),
    step5_issue = document.getElementById("issue-step-5");

// Help ----------------------------------------

function show_help(step, error) {
  switch (step) {
  case ACCESS_SPREADSHEET_BEFORE_AUTH:
    if (error == errors.GOOGLE_SPREADSHEET_UNAUTHORIZED) {
      authorize_message.classList.remove("hidden");
      return;
    }
    general_help(step1_issue, GENERAL_GOOGLE_ISSUE);
    return;

  case ACCESS_SPREADSHEET_AFTER_AUTH:
    if (error == errors.GOOGLE_SPREADSHEET_UNAUTHORIZED) {
      general_help(step1_issue, SPREADSHEET_ACCESS_ISSUE);
      return;
    }
    general_help(step1_issue, GENERAL_GOOGLE_ISSUE);
    return;

  case CHOOSE_SPREADSHEET:
    general_help(step2_issue, NEED_FIELDS_SHEET);
    return;

  case READ_FIELDS_DATA:
    general_help(step2_issue, GENERAL_GOOGLE_ISSUE);
    return;

  case ORGANIZE_FIELDS_DATA:
    general_help(step2_issue, FIELDS_SHEET_IS_MALFORMED);
    return;

  default:
    console.log("[error: step" + step + "]", error);
    console.error("Unknown step, can't show help", step);
  }
}

const ISSUE_NO_FIELDS_SHEET = `
  <div class="help-message message-text">
    <p class="help-paragraph">Temporary issue: Use a spreadsheet that has at least one sheet that ends in ".fields" that describes the fields of another sheet.</p>
  </div>
`;

const ISSUE_MALFORMED_FIELDS_SHEET = `
  <div class="help-message message-text">
    <p class="help-paragraph">Temporary issue: One of the sheets that ends in ".fields" isn't formatted in a way that can be understood by this app.</p>
  </div>
`;

const ISSUE_PRIVATE_SPREADSHEET = `
  <div class="help-message message-text">
    <p class="help-paragraph">This is a spreadsheet that you don't have access to.</p>
    <p class="help-paragraph mt-0.5">Try another spreadsheet or choose one of the example spreadsheets below.</p>
  </div>
`;

const ISSUE_WITH_GOOGLE = `
  <div class="help-message message-text">
    <p class="help-paragraph">There's an issue with Google at the moment. Unfortunately that means that this spreadsheet can't be visualized right now. The best thing to do is to wait 15 minutes and try again. This type of issue normally resolves quickly on its own.</p>
  </div>
`;

function general_help(container, type) {
  var text = "";

  switch (type) {
  case SPREADSHEET_ACCESS_ISSUE:
    text = ISSUE_PRIVATE_SPREADSHEET;
    break;

  case NEED_FIELDS_SHEET:
    text = ISSUE_NO_FIELDS_SHEET;
    break;

  case FIELDS_SHEET_IS_MALFORMED:
    text = ISSUE_MALFORMED_FIELDS_SHEET;
    break;

  default:
    text = ISSUE_WITH_GOOGLE;
    break;
  }

  var parser = new DOMParser();
  var doc = parser.parseFromString(text, "text/html");
  console.log("help message", doc.body.firstChild);

  while (container.firstChild) {
    container.removeChild(container.lastChild);
  }
  container.appendChild(doc.body.firstChild);
  container.classList.remove("hidden");
}

export default {
  ACCESS_SPREADSHEET_BEFORE_AUTH,
  ACCESS_SPREADSHEET_AFTER_AUTH,
  CHOOSE_SPREADSHEET,
  READ_FIELDS_DATA,
  ORGANIZE_FIELDS_DATA,
  CHOOSE_VISUALIZATIONS,
  DOWNLOAD_DATA,
  MATCH_HEADER_TO_FIELDS,
  RENDER_VISUALIZATIONS,
  show_help
};
