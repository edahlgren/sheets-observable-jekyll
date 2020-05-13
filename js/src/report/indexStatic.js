// Imports ------------------------------------

import { setupTopNav } from "../top-nav.js";
import { setupDropdowns } from "../dropdowns.js";
import { staticTests } from "../static.js";
import { loaderPart1, loaderPart2, loaderPart3 } from "./loaders.js";
import { getQueryVar } from "../query_vars.js";
import { choose_single_sheet, organize_fields, match_header_to_fields} from "./processingStatic.js";
import { bestReport } from "../reports/index.js";
import {
  ISSUE_SPREADSHEET_DOESNT_EXIST,
  ISSUE_SPREADSHEET_ACCESS,
  ISSUE_NO_FIELDS_SHEET,
  ISSUE_BAD_FIELDS_SHEET,
  ISSUE_FIELDS_SHEET_SYNC,
  ISSUE_NO_TEST_DATA,
  showLoadingKnownIssue,
  showLoadingBug
} from "../errors.js";

// DOM ----------------------------------------

var processingView = document.getElementById("report-processing");
var useCaseDropdown = {
  button: document.getElementById("use-case-button"),
  menu: document.getElementById("use-case-menu")
};
var templateDropdown = {
  button: document.getElementById("template-button"),
  menu: document.getElementById("template-menu")
};
var saveDropdown = {
  button: document.getElementById("save-button"),
  menu: document.getElementById("save-menu")
};
var reportContainer = document.getElementById("report"),
    reportTitle = document.getElementById("report-spreadsheet-title"),
    reportLink = document.getElementById("report-spreadsheet-url");

// Execute ------------------------------------

exec();

// Implementation -----------------------------

function exec() {
  setupTopNav();
  setupDropdowns([
    useCaseDropdown,
    templateDropdown,
    saveDropdown
  ]);

  var test = getQueryVar("test");
  if (test) {
    processStatic(test);
  } else {
    showLoadingKnownIssue(ISSUE_SPREADSHEET_DOESNT_EXIST);
  }
}

async function processStatic(testId) {
  var fields = null,
      data = null,
      report = null,
      reportRoot = null;

  console.log("processing test [" + testId + "]");
  if (!staticTests.hasOwnProperty(testId)) {
    showLoadingKnownIssue(ISSUE_NO_TEST_DATA);
    return;
  }
  var spec = staticTests[testId];

  // Step 1: Load the spreadsheet fields and data
  loaderPart1.desc.textContent = "Reading spreadsheet fields";
  try {
    var response = await fetch(spec.fieldsFile);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    var text = await response.text();
    fields = text.split('\n').map(function(d) {
      return d.split(',').map(function(d0) { return d0.trim(); });
    });
  } catch (error) {
    console.error(error);
    showIssue(STEP_DOWNLOAD_FIELDS, error);
    return;
  }
  loaderPart1.bar.style.width = 30 + "%";

  loaderPart1.desc.textContent = "Reading spreadsheet data";
  try {
    var response = await fetch(spec.dataFile);
    if (!response.ok) {
      throw new Error(response.statusText);
    }
    var text = await response.text();
    data = text.split('\n').map(function(d) {
      return d.split(',').map(function(d0) { return d0.trim(); });
    });
  } catch (error) {
    console.error(error);
    showIssue(STEP_DOWNLOAD_DATA, error);
    return;
  }
  loaderPart1.bar.style.width = 60 + "%";

  loaderPart1.desc.textContent = "Checking consistency";
  try {
    fields = organize_fields(fields);
    if (fields.isMalformed) {
      showLoadingKnownIssue(ISSUE_BAD_FIELDS_SHEET);
      return;
    }
  } catch (error) {
    console.error(error);
    showBug(STEP_ORGANIZE_FIELDS, error);
    return;
  }
  try {
    fields = match_header_to_fields(fields, data[0]);
    if (!fields) {
      showLoadingKnownIssue(ISSUE_FIELDS_SHEET_SYNC);
      return;
    }
  } catch (error) {
    console.error(error);
    showBug(STEP_MATCH_FIELDS, error);
    return;
  }
  loaderPart1.bar.style.width = 100 + "%";

  // Step 2: Choose visualizations
  loaderPart2.desc.textContent = "Choosing visualizations";
  loaderPart2.bar.style.width = 20 + "%";
  try {
    report = bestReport(fields);
    if (!report) {
      showIssue(STEP_CHOOSE_VISUALIZATIONS, new Error("No report for data"));
    }
  } catch (error) {
    console.error(error);
    showBug(STEP_CHOOSE_VISUALIZATIONS, error);
    return;
  }
  loaderPart2.bar.style.width = 100 + "%";

  // Step 3: Make the visualizations
  try {
    reportRoot = await report.make(fields, data.slice(1), loaderPart3);
    if (!reportRoot) {
      showIssue(STEP_MAKE_VISUALIZATIONS, new Error("No root"));
    }
  } catch (error) {
    console.error(error);
    showBug(STEP_MAKE_VISUALIZATIONS, error);
    return;
  }

  // Step 4: Add to DOM
  reportContainer.appendChild(reportRoot);
  reportTitle.textContent = spec.name;
  reportLink.href = spec.dataFile;

  // Step 5: Reveal
  processingView.classList.add("hidden");
  reportContainer.classList.remove("invisible");
}

const STEP_BEFORE_AUTH = 0,
      STEP_AFTER_AUTH = 1,
      STEP_GET_METADATA = 2,
      STEP_CHOOSE_SHEET = 3,
      STEP_DOWNLOAD_FIELDS = 4,
      STEP_DOWNLOAD_DATA = 5,
      STEP_ORGANIZE_FIELDS = 6,
      STEP_MATCH_FIELDS = 7,
      STEP_CHOOSE_VISUALIZATIONS = 8,
      STEP_MAKE_VISUALIZATIONS = 9;

function stepToString(step) {
  switch (step) {
  case STEP_BEFORE_AUTH:
    return "Before authorization";
  case STEP_AFTER_AUTH:
    return "After authorization";
  case STEP_GET_METADATA:
    return "Getting spreadsheet metadata";
  case STEP_CHOOSE_SHEET:
    return "Choosing sheet";
  case STEP_DOWNLOAD_FIELDS:
    return "Downloading fields";
  case STEP_DOWNLOAD_DATA:
    return "Downloading data";
  case STEP_ORGANIZE_FIELDS:
    return "Organizing fields";
  case STEP_MATCH_FIELDS:
    return "Matching header to fields";
  case STEP_CHOOSE_VISUALIZATIONS:
    return "Choosing visualizations";
  case STEP_MAKE_VISUALIZATIONS:
    return "Making visualizations";
  default:
    return "unknown";
  }
}

function showIssue(step, error) {
  if (!showLoadingKnownIssue(null, error)) {
    showLoadingBug(stepToString(step), error);
  }
}

function showBug(step, error) {
  showLoadingBug(stepToString(step), error);
}
