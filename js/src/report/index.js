// Imports ------------------------------------

import { makeSpreadsheetUrl, accessSpreadsheet, getData } from "../google.js";
import errors from "../errors.js";
import steps from "./steps.js";
import {
  choose_single_sheet,
  organize_fields,
  choose_designs,
  match_header_to_fields,
  render_visualizations
} from "./processing.js";

// DOM ----------------------------------------

// Top submit new spreadsheet bar
var spreadsheet_submit = document.getElementById("submit-spreadsheet"),
    spreadsheet_input = document.getElementById("spreadsheet-url");

// Processing steps
var step_access = document.getElementById("processing-step-access"),
    step_fields = document.getElementById("processing-step-fields"),
    step_choose = document.getElementById("processing-step-choose"),
    step_load = document.getElementById("processing-step-load"),
    step_render = document.getElementById("processing-step-render");

// Sign in message
var authorize_message = document.getElementById("authorize-container"),
    signin_button = document.getElementById("signin");

// Containers for processing and report
var processing = document.getElementById("report-processing"),
    report = document.getElementById("report");

// Request channels ---------------------------

var request_channel = null,
    response_channels = new Map();

// Execute ------------------------------------

// TODO: Cancel and re-process on submitting new URL
var spreadsheetId = refresh_id();
if (spreadsheetId) {
  process(spreadsheetId, steps.ACCESS_SPREADSHEET_BEFORE_AUTH);
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

function refresh_id() {
  var id = query_var("id");
  if (id.length == 0) {
    return null;
  }
  return id;
}

// Define the processing steps ---------------

function make_auth(on_signin) {
  return {
    signin: [{
      element: signin_button,
      afterAuth: on_signin
    }]
  };
}

async function process(id, step) {
  console.log("starting processing with", "[" + id + "]");

  var auth = null,
      metadata = null,
      fields = null,
      designs = null,
      data = null;

  // Make auth config (signin / signout buttons)
  auth = make_auth({
    afterAuth: function() {
      authorize_message.classList.add("hidden");
      process(id, steps.ACCESS_SPREADSHEET_AFTER_AUTH);
    }
  });

  // Step 1: Accessing the spreadsheet
  step_access.classList.remove("inactive");

  try {
    metadata = await accessSpreadsheet(auth, id);
  } catch (error) {
    console.log("[error: access spreadsheet]", error);
    steps.show_help(step, error);
    return;
  }

  // Step 2: Choose a sheet & parse its fields
  step_fields.classList.remove("inactive");

  step = steps.CHOOSE_SPREADSHEET;
  var sheet = choose_single_sheet(metadata.sheets);
  if (!sheet) {
    steps.show_help(step);
    return;
  }

  step = steps.READ_FIELDS_DATA;
  try {
    fields = await getData(auth, id, sheet + ".fields");
  } catch (error) {
    steps.show_help(step, error);
    return;
  }

  step = steps.ORGANIZE_FIELDS_DATA;
  fields = organize_fields(fields);
  if (fields.isMalformed) {
    steps.show_help(step);
    return;
  }

  // Step 3: Choose and download visualization code
  step_choose.classList.remove("inactive");

  step = steps.CHOOSE_VISUALIZATIONS;
  try {
    designs = await choose_designs(fields);
  } catch (error) {
    steps.show_help(step, error);
    return;
  }

  // Step 4: Loading data
  step_load.classList.remove("inactive");

  step = steps.DOWNLOAD_DATA;
  try {
    data = await getData(auth, id, sheet);
  } catch (error) {
    steps.show_help(step, error);
    return;
  }

  step = steps.MATCH_HEADER_TO_FIELDS;
  fields = match_header_to_fields(fields, data[0]);
  if (!fields) {
    steps.show_help(step);
    return;
  }

  // Step 4: Loading data
  step_render.classList.remove("inactive");

  step = steps.RENDER_VISUALIZATIONS;
  try {
    await render_visualizations({
      root: report,
      id: id,
      sheet: sheet,
      title: metadata.properties.title,
      url: metadata.spreadsheetUrl,
      fields: fields,
      visualizations: designs,
      data: data
    });
  } catch (error) {
    steps.show_help(step, error);
    return;
  }

  setTimeout(function() {
    finish(id, sheet);
  }, 500);
}

function finish(id, sheet) {
  request_channel = new BroadcastChannel("request_channel:" + spreadsheetId + ":" + sheet);
  request_channel.onmessage = handle_channel_request;

  processing.classList.add("hidden");
  report.classList.remove("hidden");
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
