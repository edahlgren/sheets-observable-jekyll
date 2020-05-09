// Imports ------------------------------------

import { makeSpreadsheetUrl, getGoogleApi } from "../google.js";
import { setupTopNav } from "../top-nav.js";
import { setupDropdowns } from "../dropdowns.js";
import { staticTests } from "../static.js";
import { bestReport } from "../reports/index.js";

import {
  ISSUE_SPREADSHEET_DOESNT_EXIST,
  ISSUE_SPREADSHEET_ACCESS,
  ISSUE_NO_FIELDS_SHEET,
  ISSUE_BAD_FIELDS_SHEET,
  ISSUE_FIELDS_SHEET_SYNC,
  ISSUE_NO_TEST_DATA,
  isAuthIssue,
  showLoadingKnownIssue,
  showLoadingBug
} from "../errors.js";

import {
  choose_single_sheet,
  organize_fields,
  load_designs,
  load_designs2,
  match_header_to_fields,
  render_visualizations,
  render_visualizations2
} from "./processing.js";

// DOM ----------------------------------------

// Loading report
var processing = document.getElementById("report-processing");
var part1 = document.getElementById("report-loader-part1"),
    load_part1_bar = part1.querySelector(".report-loader-bar-complete"),
    load_part1_desc = part1.querySelector(".report-loader-part-desc"),
    loader_part1 = {
      bar: load_part1_bar,
      desc: load_part1_desc
    };

var part2 = document.getElementById("report-loader-part2"),
    load_part2_bar = part2.querySelector(".report-loader-bar-complete"),
    load_part2_desc = part2.querySelector(".report-loader-part-desc"),
    loader_part2 = {
      bar: load_part2_bar,
      desc: load_part2_desc
    };

var part3 = document.getElementById("report-loader-part3"),
    load_part3_bar = part3.querySelector(".report-loader-bar-complete"),
    load_part3_desc = part3.querySelector(".report-loader-part-desc"),
    loader_part3 = {
      bar: load_part3_bar,
      desc: load_part3_desc
    };

// Sign in message
var authorize_message = document.getElementById("authorize-container"),
    signin_button = document.getElementById("signin");

// Contains the report
var report = document.getElementById("report");

// Setup the top nav bar ----------------------

setupTopNav();

// Setup the drop downs -----------------------

setupDropdowns([
  {
    button: document.getElementById("use-case-button"),
    menu: document.getElementById("use-case-menu")
  },
  {
    button: document.getElementById("template-button"),
    menu: document.getElementById("template-menu")
  },
  {
    button: document.getElementById("save-button"),
    menu: document.getElementById("save-menu")
  }
]);

// Request channels ---------------------------

var request_channel = null,
    response_channels = new Map();

// Error handling -----------------------------

function showIssue(step, error) {
  if (!showLoadingKnownIssue(null, error)) {
    showLoadingBug(stepToString(step), error);
  }
}

function showBug(step, error) {
  showLoadingBug(stepToString(step), error);
}

// Execute ------------------------------------

// TODO: Cancel and re-process on submitting new URL
go();

function go() {
  var spreadsheetId = get_id();
  if (spreadsheetId) {
    processGoogle(spreadsheetId, STEP_BEFORE_AUTH);
    return;
  }

  var testId = get_test();
  if (testId) {
    processStatic(testId);
    return;
  }

  showLoadingKnownIssue(ISSUE_SPREADSHEET_DOESNT_EXIST);
}

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

function get_id() {
  var id = query_var("id");
  if (id.length == 0) {
    return null;
  }
  return id;
}

function get_test() {
  var test = query_var("test");
  if (test.length == 0) {
    return null;
  }
  return test;
}

// Actally do processing steps ---------------

async function processStatic(testId) {
  console.log("processing test [" + testId + "]");

  if (!staticTests.hasOwnProperty(testId)) {
    showLoadingKnownIssue(ISSUE_NO_TEST_DATA);
    return;
  }

  var spec = staticTests[testId],
      fields = null,
      data = null,
      designs = null;

  // Try to download the fields metadata
  load_part1_desc.textContent = "Reading spreadsheet fields";
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
  load_part1_bar.style.width = 30 + "%";

  // Try to download the data
  load_part1_desc.textContent = "Reading spreadsheet data";
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
  load_part1_bar.style.width = 60 + "%";

  // Validating
  load_part1_desc.textContent = "Checking consistency";
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
  load_part1_bar.style.width = 100 + "%";

  // Part 2 --------------------------------------

  try {
    designs = await load_designs2(fields, {
      bar: load_part2_bar,
      desc: load_part2_desc
    });
  } catch (error) {
    console.error(error);
    showIssue(STEP_CHOOSE_VISUALIZATIONS, error);
    return;
  }

  // Part 3 --------------------------------------

  var render_config = {
    root: report,
    identifier: `test=${testId}`,
    title: spec.name,
    url: spec.dataFile,
    fields: fields,
    visualizations: designs,
    data: data
  };
  try {
    await render_visualizations2(render_config, {
      bar: load_part3_bar,
      desc: load_part3_desc
    });
  } catch (error) {
    console.error(error);
    showIssue(STEP_MAKE_VISUALIZATIONS, error);
    return;
  }

  finish("test", testId);
}

// Define the Google processing steps ---------------

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

async function processGoogle(id, firstStep) {
  console.log("processing [" + id + "]");

  var api = null,
      metadata = null,
      sheet = null,
      fields = null,
      designs = null,
      data = null;

  // Make auth config (signin / signout buttons)
  var auth = {
    signin: [{
      element: signin_button,
      afterAuth: function() {
        authorize_message.classList.add("hidden");
        process(id, STEP_AFTER_AUTH);
      }
    }]
  };

  // Part 1 --------------------------------------

  // Authenticating
  try {
    api = await getGoogleApi(auth, {
      bar: load_part1_bar,
      desc: load_part1_desc
    });
  } catch (error) {
    showIssue(firstStep, error);
    return;
  }

  // Getting metadata
  load_part1_desc.textContent = "Getting metadata";
  try {
    metadata = await api.getSpreadsheetMetadata(id);
  } catch (error) {
    if (isAuthIssue(error)) {
      if (firstStep == STEP_BEFORE_AUTH) {
        authorize_message.classList.remove("hidden");
        return;
      }
      if (firstStep == STEP_AFTER_AUTH) {
        showLoadingKnownIssue(ISSUE_SPREADSHEET_ACCESS);
        return;
      }
    }
    showIssue(STEP_GET_METADATA, error);
    return;
  }
  load_part1_bar.style.width = 45 + "%";

  // Choosing sheet
  load_part1_desc.textContent = "Choosing sheet";
  try {
    sheet = choose_single_sheet(metadata.sheets);
    if (!sheet) {
      showLoadingKnownIssue(ISSUE_NO_FIELDS_SHEET);
      return;
    }
  } catch (error) {
    showBug(STEP_CHOOSE_SHEET, error);
    return;
  }
  load_part1_bar.style.width = 50 + "%";

  // Reading fields
  load_part1_desc.textContent = "Reading spreadsheet fields";
  try {
    fields = await api.getSpreadsheetValues(id, sheet + ".fields");
  } catch (error) {
    showIssue(STEP_DOWNLOAD_FIELDS, error);
    return;
  }
  load_part1_bar.style.width = 70 + "%";

  // Reading data
  load_part1_desc.textContent = "Reading spreadsheet data";
  try {
    data = await api.getSpreadsheetValues(id, sheet);
  } catch (error) {
    showIssue(STEP_DOWNLOAD_DATA, error);
    return;
  }
  load_part1_bar.style.width = 90 + "%";

  // Validating
  load_part1_desc.textContent = "Checking consistency";
  try {
    fields = organize_fields(fields);
    if (fields.isMalformed) {
      showLoadingKnownIssue(ISSUE_BAD_FIELDS_SHEET);
      return;
    }
  } catch (error) {
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
    showBug(STEP_MATCH_FIELDS, error);
    return;
  }
  load_part1_bar.style.width = 100 + "%";

  // Part 2 --------------------------------------

  try {
    designs = await load_designs2(fields, {
      bar: load_part2_bar,
      desc: load_part2_desc
    });
  } catch (error) {
    showIssue(STEP_CHOOSE_VISUALIZATIONS, error);
    return;
  }

  // Part 3 --------------------------------------

  var render_config = {
    root: report,
    identifier: `id=${id}&sheet=${sheet}`,
    title: metadata.properties.title,
    url: metadata.spreadsheetUrl,
    fields: fields,
    visualizations: designs,
    data: data
  };
  try {
    await render_visualizations2(render_config, {
      bar: load_part3_bar,
      desc: load_part3_desc
    });
  } catch (error) {
    showIssue(STEP_MAKE_VISUALIZATIONS, error);
    return;
  }

  finish(id, sheet);
}

function finish(id, sheet) {
  request_channel = new BroadcastChannel("request_channel:" + id + ":" + sheet);
  request_channel.onmessage = handle_channel_request;

  processing.classList.add("hidden");
  report.classList.remove("invisible");
}

function handle_channel_request(e) {
  console.log("Report received message:", e.data);

  switch (e.data.type) {
  case "CloseChannel":
    var response_channel_name = e.data.params.response_channel,
        response_channel = response_channels.get(response_channel_name);

    if (response_channel) {
      response_channels.delete(response_channel_name);
      response_channel.close();
    }
    break;

  case "ResourceRequest":
    var response_channel_name = e.data.params.response_channel,
        response_channel = response_channels.get(response_channel_name);

    if (!response_channel) {
      response_channel = new BroadcastChannel(response_channel_name);
      response_channels.set(response_channel_name, response_channel);
    }

    var plot = get_plot_from_report(e.data.params.plot_number);
    if (!plot) {
      response_channel.postMessage({
        type: "ResourceResponse",
        params: {
          hasResource: false
        }
      });
    } else {
      response_channel.postMessage({
        type: "ResourceResponse",
        params: {
          hasResource: true,
          spreadsheet: get_spreadsheet_info(),
          title: plot.title,
          resource: plot.svg.outerHTML
        }
      });
    }
    break;

  default:
    console.log("Can't handle message:", e);
  }
}

function get_spreadsheet_info() {
  return {
    title: document.getElementById("report-spreadsheet-title").textContent,
    url: document.getElementById("report-spreadsheet-url").href
  };
}

function join_titles(collection) {
  var output = [];
  for (var i = 0; i < collection.length; i++) {
    var div = collection.item(i);
    output.push(div.textContent);
  }
  return output.join(" ");
}

function get_plot_from_report(plot_number) {
  var link = document.getElementById("pn-" + plot_number);
  if (!link) {
    return null;
  }
  var svg = link.querySelector("svg");
  if (!svg) {
    return null;
  }
  var titles = link.getElementsByClassName("report-plot-title");
  if (titles.length == 0) {
    return null;
  }
  return {
    title: join_titles(titles),
    svg: svg
  };
}
