// Imports -------------------------------------

import { getGoogleApi } from "../google.js";
import loadScript from "../loadScript.js";
import visualizations from "../visualizations.js";

// DOM -----------------------------------------

// Header buttons
var back_button = document.getElementById("plot-back-button");

// Loading plot
var processing = document.getElementById("plot-processing");
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

// Implement back button ------------------------

back_button.onclick = function(event) {
  // Go to the report page
  window.location.href = "report?id=" + id;
};

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

  plot.classList.remove("hidden");
}

request_plot();

// Load the visualization from scratch ----------

async function load_from_scratch() {
  processing.classList.remove("hidden");

  try {
    await __load_visualization();
  } catch (error) {
    console.log("[error]", error);
    return;
  }

  processing.classList.add("hidden");
  plot.classList.remove("hidden");
}

async function __load_visualization() {
  var auth = {},
      api = null,
      metadata = null,
      vars = null,
      data = null,
      svg = null;

  // TODO: Make auth
  // TODO: Handle errors

  // Part 1 --------------------------------------

  // This should go away when I switch to one template per
  // visualization type
  if (!visualizations.hasOwnProperty(visualization)) {
    throw new Error("No visualization named " + visualization);
  }
  var vspec = visualizations[visualization];

  try {
    api = await getGoogleApi(auth, {
      bar: load_part1_bar,
      desc: load_part1_desc
    });
  } catch (error) {
    console.log("[error: get google api]", error);
    throw error;
  }

  load_part1_desc.textContent = "Getting metadata";
  try {
    metadata = await api.getSpreadsheetMetadata(id);
  } catch (error) {
    console.log("[error: access spreadsheet]", error);
    throw error;
  }
  load_part1_bar.style.width = 45 + "%";

  load_part1_desc.textContent = "Checking sheet";
  var sheets = metadata.sheets.map(function(s) {
    return s.properties.title;
  });
  if (!sheets.includes(sheet)) {
    throw new Error("No sheet named " + sheet);
  }
  load_part1_bar.style.width = 50 + "%";

  load_part1_desc.textContent = "Reading spreadsheet data";
  try {
    data = await api.getSpreadsheetValues(id, sheet);
  } catch (error) {
    console.log("[error: loading data]", error);
    throw error;
  }
  load_part1_bar.style.width = 70 + "%";

  load_part1_desc.textContent = "Checking consistency";
  try {
    vars = vspec.parseQueryVars(qvars, data[0]);
  } catch (error) {
    console.log("[error: parsing query vars]", error);
    throw error;
  }
  load_part1_bar.style.width = 100 + "%";

  // Part 2 --------------------------------------

  load_part2_desc.textContent = "Loading design";
  try {
    await loadScript(vspec.script);
  } catch (error) {
    console.log("[error: loading script]", error);
    throw error;
  }
  load_part2_bar.style.width = 25 + "%";

  load_part2_desc.textContent = "Formatting input";
  var input = vspec.plotData(vars, data);
  load_part2_bar.style.width = 50 + "%";

  load_part2_desc.textContent = "Rendering";
  try {
    svg = await vspec.render(input);
  } catch (error) {
    console.log("[error: rendering]", error);
    throw error;
  }
  load_part2_bar.style.width = 100 + "%";

  // Fill in the plot
  plot_spreadsheet_title.textContent = metadata.properties.title;
  plot_spreadsheet_link.href = metadata.spreadsheetUrl;

  plot_title.textContent = vspec.plotTitle(vars);
  actual_plot.appendChild(svg);
}
