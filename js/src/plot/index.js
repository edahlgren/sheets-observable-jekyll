// Imports -------------------------------------

import { accessSpreadsheet, getData } from "../google.js";
import loadScript from "../loadScript.js";
import visualizations from "../visualizations.js";

// DOM -----------------------------------------

var processing = document.getElementById("plot-processing"),
    plot = document.getElementById("plot");

var plot_spreadsheet_title = document.getElementById("plot-spreadsheet-title"),
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

// Execute -------------------------------------

var qvars = query_vars(),
    id = qvars.get("id"),
    sheet = qvars.get("sheet"),
    plot_number = qvars.get("pn"),
    visualization = qvars.get("v");

console.log("[spreadsheet " + id + "]",
            "[sheet " + sheet + "]",
            "[plot number " + plot_number + "]",
            "[visualization " + visualization + "]");

// Load the visualization from a tab ------------

var request_channel = new BroadcastChannel("request_channel:" + id + ":" + sheet),
    request_timeout = null;

var response_channel_name = "response_channel:" + id + ":" + sheet + ":" + plot_number,
    response_channel = new BroadcastChannel(response_channel_name);

response_channel.onmessage = function(e) {
  console.log("View received message:", e.data);

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
      metadata = null,
      vars = null,
      data = null,
      svg = null;

  try {
    metadata = await accessSpreadsheet(auth, id);
  } catch (error) {
    console.log("[error: access spreadsheet]", error);
    throw error;
  }

  var sheets = metadata.sheets.map(function(s) {
    return s.properties.title;
  });
  if (!sheets.includes(sheet)) {
    throw new Error("No sheet named " + sheet);
  }

  if (!visualizations.hasOwnProperty(visualization)) {
    throw new Error("No visualization named " + visualization);
  }

  var vspec = visualizations[visualization];
  try {
    loadScript(vspec.script);
  } catch (error) {
    console.log("[error: loading script]", error);
    throw error;
  }

  try {
    data = await getData(auth, id, sheet);
  } catch (error) {
    console.log("[error: loading data]", error);
    throw error;
  }

  try {
    vars = vspec.parseQueryVars(qvars, data[0]);
  } catch (error) {
    console.log("[error: parsing query vars]", error);
    throw error;
  }

  try {
    var input = vspec.plotData(vars, data);
    svg = await vspec.render(input);
  } catch (error) {
    console.log("[error: rendering]", error);
    throw error;
  }

  // Fill in the plot
  plot_spreadsheet_title.textContent = metadata.properties.title;
  plot_spreadsheet_link.href = metadata.spreadsheetUrl;

  plot_title.textContent = vspec.plotTitle(vars);
  actual_plot.appendChild(svg);
}
