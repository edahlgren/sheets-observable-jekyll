// Imports -------------------------------------
import loadScript from "../loadScript.js";
import visualizations from "../visualizations.js";

import { getGoogleApi } from "../google.js";
import { setupTopNav } from "../top-nav.js";
import { setupDropdowns } from "../dropdowns.js";
import { downloadSVG, downloadPNG } from "../download.js";

import {
  ERROR_CANT_GET_APP_FILE,
  ERROR_PREPARING_VISUALIZATION_INPUT,
  ERROR_RENDERING_VISUALIZATION,
  ERROR_FORMATTING_VISUALIZATION,
  ISSUE_SPREADSHEET_ACCESS,
  ISSUE_NO_SHEET,
  ISSUE_URL_NO_SPREADSHEET_ID,
  ISSUE_URL_NO_SPREADSHEET_SHEET,
  ISSUE_URL_NO_VISUALIZATION,
  ISSUE_URL_VISUALIZATION_NOT_SUPPORTED,
  isKnownError,
  makeKnownError,
  isAuthIssue,
  showLoadingKnownIssue,
  showLoadingBug
} from "../errors.js";

// DOM -----------------------------------------

// Header buttons
var top_left_options = document.getElementById("left-top-options");

// Loading plot
var processing = document.getElementById("plot-processing"),
    loader = document.getElementById("plot-loader");

var part1 = document.getElementById("plot-loader-part1"),
    load_part1_bar = part1.querySelector(".plot-loader-bar-complete"),
    load_part1_desc = part1.querySelector(".plot-loader-part-desc");

var part2 = document.getElementById("plot-loader-part2"),
    load_part2_bar = part2.querySelector(".plot-loader-bar-complete"),
    load_part2_desc = part2.querySelector(".plot-loader-part-desc");

// Actual plot
var plot = document.getElementById("plot"),
    plot_spreadsheet_title = document.getElementById("plot-spreadsheet-title"),
    plot_spreadsheet_link = document.getElementById("plot-spreadsheet-url"),
    plot_title = document.getElementById("plot-title"),
    plot_help = document.getElementById("plot-help"),
    actual_plot = document.getElementById("actual-plot");

// Parse query vars -----------------------------

function query_vars() {
  var query = window.location.search.substring(1);
  var vars = query.split('&');
  var vars_map = new Map();
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      vars_map.set(
        decodeURIComponent(pair[0]),
        decodeURIComponent(pair[1])
      );
  }
  return {
    map: vars_map,
    get: function(name) {
      var v = vars_map.get(name);
      if (!v) {
        var error = new Error("Need query string variable '" + name + "'");
        throw makeKnownError(ERROR_WITH_PLOT_URL, error);
      }
      return v;
    }
  }
  return vars_map;
}

// Parse query vars ------------------------------

var qvars = query_vars(),
    id = qvars.get("id"),
    sheet = qvars.get("sheet"),
    plot_number = qvars.get("pn"),
    visualization = qvars.get("v");

console.log("[spreadsheet " + id + "]",
            "[sheet " + sheet + "]",
            "[plot number " + plot_number + "]",
            "[visualization " + visualization + "]");

// Setup the top nav bar ----------------------

setupTopNav();

// Setup the drop downs -----------------------

setupDropdowns([
  {
    button: document.getElementById("customize-button"),
    menu: document.getElementById("customize-menu")
  },
  {
    button: document.getElementById("download-button"),
    menu: document.getElementById("download-menu")
  },
  {
    button: document.getElementById("save-button"),
    menu: document.getElementById("save-menu")
  }
]);

// Setup the download buttons -------------------

var download_svg_button = document.getElementById("download-svg"),
    download_png_button = document.getElementById("download-png");

download_svg_button.addEventListener('click', function(event) {
  var svg = actual_plot.querySelector("svg");
  downloadSVG(svg, visualization);
});

download_png_button.addEventListener('click', function(event) {
  var svg = actual_plot.querySelector("svg");
  downloadPNG(svg, visualization);
});

// Implement back button ------------------------

//back_button.onclick = function(event) {
//  window.location.href = "report?id=" + id;
//};

// Load the visualization from a tab ------------

var request_channel = new BroadcastChannel("request_channel:" + id + ":" + sheet),
    request_timeout = null;

var response_channel_name = "response_channel:" + id + ":" + sheet + ":" + plot_number,
    response_channel = new BroadcastChannel(response_channel_name);

response_channel.onmessage = function(e) {
  switch (e.data.type) {
  case "ResourceResponse":
    window.clearTimeout(request_timeout);
    close_response_channel();

    if (!e.data.params.hasResource) {
      load_from_scratch();
    } else {
      load_from_message(e.data.params);
    }
    break;

  default:
    console.log("Can't handle message:", e);
  }
}

function close_response_channel() {
  request_channel.postMessage({
    type: "CloseChannel",
    params: {
      response_channel: response_channel_name
    }
  });
}

function request_plot() {
  request_channel.postMessage({
    type: "ResourceRequest",
    params: {
      response_channel: response_channel_name,
      plot_number: plot_number
    }
  });
  request_timeout = window.setTimeout(load_from_scratch, 200);
}

function load_from_message(msg) {
  plot_spreadsheet_title.textContent = msg.spreadsheet.title;
  plot_spreadsheet_link.href = msg.spreadsheet.url;

  plot_title.textContent = msg.title;
  actual_plot.innerHTML = msg.resource;

  if (!id) {
    return showLoadingKnownIssue(ISSUE_URL_NO_SPREADSHEET_ID);
  }
  plot.classList.remove("invisible");
}

request_plot();

// Load the visualization from scratch ----------

const CHECK_VISUALIZATION_SUPPORTED = 0,
      SETUP_GOOGLE_API = 1,
      STEP_GET_METADATA = 2,
      STEP_CHECK_SHEET = 3,
      STEP_DOWNLOAD_DATA = 4,
      STEP_PARSE_QUERY_VARS = 5,
      STEP_LOAD_DESIGN = 6,
      STEP_LOAD_INPUT = 7,
      STEP_RENDER_DESIGN = 8,
      STEP_FORMAT_DESIGN = 9,
      STEP_UNKNOWN = 10;

function stepToString(step) {
  switch (step) {
  case CHECK_VISUALIZATION_SUPPORTED:
    return "Check visualization is supported";
  case SETUP_GOOGLE_API:
    return "Setting up Google API";
  case STEP_GET_METADATA:
    return "Getting spreadsheet metadata";
  case STEP_CHECK_SHEET:
    return "Checking that sheet exists";
  case STEP_DOWNLOAD_DATA:
    return "Downloading data";
  case STEP_PARSE_QUERY_VARS:
    return "Parsing query variables";
  case STEP_LOAD_DESIGN:
    return "Loading design";
  case STEP_LOAD_INPUT:
    return "Loading input";
  case STEP_RENDER_DESIGN:
    return "Rendering visualization";
  case STEP_FORMAT_DESIGN:
    return "Formatting visualization";
  case STEP_UNKNOWN:
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

async function load_from_scratch() {
  loader.classList.add("hidden");
  processing.classList.remove("hidden");

  if (!id) {
    return showLoadingKnownIssue(ISSUE_URL_NO_SPREADSHEET_ID);
  }

  if (!sheet)
    return showLoadingKnownIssue(ISSUE_URL_NO_SPREADSHEET_SHEET);
  if (!visualization)
    return showLoadingKnownIssue(ISSUE_URL_NO_VISUALIZATION);
  if (!visualizations.hasOwnProperty(visualization))
    return showLoadingKnownIssue(ISSUE_URL_VISUALIZATION_NOT_SUPPORTED);

  loader.classList.remove("hidden");

  // This should go away when I switch to one template per
  // visualization type
  var vspec = visualizations[visualization];
  try {
    await __load_visualization(vspec);
  } catch (error) {
    showBug(STEP_UNKNOWN, error);
  }
}

async function __load_visualization(vspec) {
  var auth = {},
      api = null,
      metadata = null,
      vars = null,
      data = null,
      input = null,
      svg = null;

  // Part 1 --------------------------------------

  try {
    api = await getGoogleApi(auth, {
      bar: load_part1_bar,
      desc: load_part1_desc
    });
  } catch (error) {
    showIssue(SETUP_GOOGLE_API, error);
    return;
  }

  load_part1_desc.textContent = "Getting metadata";
  try {
    metadata = await api.getSpreadsheetMetadata(id);
  } catch (error) {
    if (isAuthIssue(error)) {
      showLoadingKnownIssue(ISSUE_SPREADSHEET_ACCESS);
      return;
    }
    showIssue(STEP_GET_METADATA, error);
    return;
  }
  load_part1_bar.style.width = 45 + "%";

  load_part1_desc.textContent = "Checking sheet";
  try {
    var sheets = metadata.sheets.map(function(s) {
      return s.properties.title;
    });
    if (!sheets.includes(sheet)) {
      showLoadingKnownIssue(ISSUE_NO_SHEET);
      return;
    }
  } catch (error) {
    showIssue(STEP_CHECK_SHEET, error);
    return;
  }
  load_part1_bar.style.width = 50 + "%";

  load_part1_desc.textContent = "Reading spreadsheet data";
  try {
    data = await api.getSpreadsheetValues(id, sheet);
  } catch (error) {
    showIssue(STEP_DOWNLOAD_DATA, error);
    return;
  }
  load_part1_bar.style.width = 70 + "%";

  load_part1_desc.textContent = "Checking consistency";
  try {
    vars = vspec.parseQueryVars(qvars, data[0]);
  } catch (error) {
    showIssue(STEP_PARSE_QUERY_VARS, error);
    return;
  }
  load_part1_bar.style.width = 100 + "%";

  // Part 2 --------------------------------------

  load_part2_desc.textContent = "Loading design";
  try {
    await loadScript(vspec.script);
  } catch (error) {
    var error = makeKnownError(ERROR_CANT_GET_APP_FILE, error);
    showIssue(STEP_LOAD_DESIGN, error);
    return;
  }
  load_part2_bar.style.width = 25 + "%";

  load_part2_desc.textContent = "Formatting input";
  try {
    input = vspec.plotData(vars, data);
  } catch (error) {
    var error = makeKnownError(ERROR_PREPARING_VISUALIZATION_INPUT, error);
    showIssue(STEP_LOAD_INPUT, error);
    return;
  }
  load_part2_bar.style.width = 50 + "%";

  load_part2_desc.textContent = "Rendering";
  try {
    svg = await vspec.render(input);
  } catch (error) {
    if (!isKnownError(error)) {
      error = makeKnownError(ERROR_RENDERING_VISUALIZATION, error);
    }
    showIssue(STEP_RENDER_DESIGN, error);
    return;
  }
  try {
    plot_spreadsheet_title.textContent = metadata.properties.title;
    plot_spreadsheet_link.href = metadata.spreadsheetUrl;
    plot_title.textContent = vspec.plotTitle(vars);
    actual_plot.appendChild(svg);
  } catch (error) {
    error = makeKnownError(ERROR_FORMATTING_VISUALIZATION, error);
    showIssue(STEP_FORMAT_DESIGN, error);
    return;
  }
  load_part2_bar.style.width = 100 + "%";

  processing.classList.add("hidden");
  plot.classList.remove("invisible");
}
