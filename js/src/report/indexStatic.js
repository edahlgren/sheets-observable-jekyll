// Imports ------------------------------------

import { setupTopNav } from "../top-nav.js";
import { setupDropdowns } from "../dropdowns.js";
import { staticTests } from "../static.js";
import { loaderPart1, loaderPart2, loaderPart3 } from "./loaders.js";
import { getQueryVar } from "../query_vars.js";
import { choose_single_sheet, organize_fields, match_header_to_fields} from "./processing.js";
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
  loader_part2.desc.textContent = "Choosing visualizations";
  loader_part2.bar.style.width = 20 + "%";
  try {
    report = bestReport(fields);
    if (!report) {
      showIssue(STEP_CHOOSE_VISUALIZATIONS, new Error("No report for data"));
    }
  } catch (error) {
    showBug(STEP_ORGANIZE_FIELDS, error);
    return;
  }
  loader_part2.bar.style.width = 100 + "%";

  // Step 3: Make the visualizations
  try {
    reportRoot = report.make(fields, data, loader_part3);
    if (!root) {
      showIssue(STEP_MAKE_VISUALIZATIONS, new Error("No root"));
    }
  } catch (error) {
    showBug(STEP_MAKE_VISUALIZATIONS, error);
    return;
  }

  // Step 4: Add to DOM
  reportContainer.appendChild(reportRoot);
  reportTitle.textContent = spec.name;
  reportLink.href = spec.dataFile;

  // Step 5: Reveal
  processing.classList.add("hidden");
  reportContainer.classList.remove("invisible");
}

function showIssue(step, error) {
  if (!showLoadingKnownIssue(null, error)) {
    showLoadingBug(stepToString(step), error);
  }
}

function showBug(step, error) {
  showLoadingBug(stepToString(step), error);
}
