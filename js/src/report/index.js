// Imports ------------------------------------

import { makeSpreadsheetUrl, getGoogleApi } from "../google.js";
import errors from "../errors.js";
import steps from "./steps.js";
import {
  choose_single_sheet,
  organize_fields,
  load_designs,
  match_header_to_fields,
  render_visualizations
} from "./processing.js";

// DOM ----------------------------------------

// Top submit new spreadsheet bar
var spreadsheet_submit = document.getElementById("submit-spreadsheet"),
    spreadsheet_input = document.getElementById("spreadsheet-url");

// Loading report
var processing = document.getElementById("report-processing");
var part1 = document.getElementById("report-loader-part1"),
    load_part1_bar = part1.querySelector(".report-loader-bar-complete"),
    load_part1_desc = part1.querySelector(".report-loader-part-desc");

var part2 = document.getElementById("report-loader-part2"),
    load_part2_bar = part2.querySelector(".report-loader-bar-complete"),
    load_part2_desc = part2.querySelector(".report-loader-part-desc");

var part3 = document.getElementById("report-loader-part3"),
    load_part3_bar = part3.querySelector(".report-loader-bar-complete"),
    load_part3_desc = part3.querySelector(".report-loader-part-desc");

// Sign in message
var authorize_message = document.getElementById("authorize-container"),
    signin_button = document.getElementById("signin");

// Contains the report
var report = document.getElementById("report");

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
  console.log("processing [" + id + "]");

  var api = null,
      metadata = null,
      sheet = null,
      fields = null,
      designs = null,
      data = null;

  // Make auth config (signin / signout buttons)
  var auth = make_auth({
    afterAuth: function() {
      authorize_message.classList.add("hidden");
      process(id, steps.ACCESS_SPREADSHEET_AFTER_AUTH);
    }
  });

  // Part 1 --------------------------------------

  // Authenticating
  try {
    api = await getGoogleApi(auth, {
      bar: load_part1_bar,
      desc: load_part1_desc
    });
  } catch (error) {
    console.log("[error: get google api]", error);
    steps.show_help(step, error);
    return;
  }

  // Getting metadata
  load_part1_desc.textContent = "Getting metadata";
  try {
    metadata = await api.getSpreadsheetMetadata(id);
  } catch (error) {
    console.log("[error: access spreadsheet]", error);
    steps.show_help(step, error);
    return;
  }
  load_part1_bar.style.width = 45 + "%";

  // Choosing sheet
  load_part1_desc.textContent = "Choosing sheet";
  step = steps.CHOOSE_SPREADSHEET;
  sheet = choose_single_sheet(metadata.sheets);
  if (!sheet) {
    steps.show_help(step);
    return;
  }
  load_part1_bar.style.width = 50 + "%";

  // Reading fields
  load_part1_desc.textContent = "Reading spreadsheet fields";
  step = steps.READ_FIELDS_DATA;
  try {
    fields = await api.getSpreadsheetValues(id, sheet + ".fields");
  } catch (error) {
    steps.show_help(step, error);
    return;
  }
  load_part1_bar.style.width = 70 + "%";

  // Reading data
  load_part1_desc.textContent = "Reading spreadsheet data";
  step = steps.DOWNLOAD_DATA;
  try {
    data = await api.getSpreadsheetValues(id, sheet);
  } catch (error) {
    steps.show_help(step, error);
    return;
  }
  load_part1_bar.style.width = 90 + "%";

  // Validating
  load_part1_desc.textContent = "Checking consistency";
  step = steps.ORGANIZE_FIELDS_DATA;
  fields = organize_fields(fields);
  if (fields.isMalformed) {
    steps.show_help(step);
    return;
  }
  step = steps.MATCH_HEADER_TO_FIELDS;
  fields = match_header_to_fields(fields, data[0]);
  if (!fields) {
    steps.show_help(step);
    return;
  }
  load_part1_bar.style.width = 100 + "%";

  // Part 2 --------------------------------------

  step = steps.CHOOSE_VISUALIZATIONS;
  try {
    designs = await load_designs(fields, {
      bar: load_part2_bar,
      desc: load_part2_desc
    });
  } catch (error) {
    steps.show_help(step, error);
    return;
  }

  // Part 3 --------------------------------------

  step = steps.RENDER_VISUALIZATIONS;
  var render_config = {
    root: report,
    id: id,
    sheet: sheet,
    title: metadata.properties.title,
    url: metadata.spreadsheetUrl,
    fields: fields,
    visualizations: designs,
    data: data
  };
  try {
    await render_visualizations(render_config, {
      bar: load_part3_bar,
      desc: load_part3_desc
    });
  } catch (error) {
    steps.show_help(step, error);
    return;
  }

  finish(id, sheet);
}

function finish(id, sheet) {
  request_channel = new BroadcastChannel("request_channel:" + spreadsheetId + ":" + sheet);
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
