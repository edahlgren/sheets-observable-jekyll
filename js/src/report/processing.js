// Imports ------------------------------------

import loadScript from "../loadScript.js";
import visualizations from "../visualizations.js";

// Methods ------------------------------------

function choose_single_sheet(sheets) {
  var sheet_names = sheets.map(function(sheet) {
    return sheet.properties.title;
  });
  var sheet_set = new Set(sheet_names);
  for (var i = 0; i < sheet_names.length; i++) {
    var sheet = sheet_names[i];
    if (sheet_set.has(sheet + ".fields")) {
      return sheet;
    }
  }
  return null;
}

function organize_fields(fields) {
  // Need at least 2 rows
  if (fields.length < 1) {
    return { isMalformed: true };
  }

  // Header needs to look like this:
  // Field, Description, Caption, Type, Distribution
  var header = fields[0];
  if (header.length < 5) {
    return { isMalformed: true };
  }
  if (header[0] !== "Field" ||
      header[1] !== "Description" ||
      header[2] !== "Caption" ||
      header[3] !== "Type" ||
      header[4] !== "Distribution") {
    return { isMalformed: true };
  }

  // Create a map of the fields
  fields = fields.slice(1).map(function(field) {
    return {
      field: field[0],
      description: field[1],
      caption: field[2],
      type: field[3],
      distribution: field[4],
      index: -1
    };
  });

  // Collect all numerical random fields
  var numerical_random = fields.filter(function(field) {
    return field.type === "numerical" && field.distribution === "random";
  }).map(function(field) {
    return field.field;
  });

  return {
    all: fields,
    numericalRandom: numerical_random
  };
}

function match_header_to_fields(fields, header) {
  // Map all of the fields
  var fields_map = new Map(fields.all.map(function(field) {
    return [field.field, field];
  }));

  // Match each non-empty column to a field description
  for (var i = 0; i < header.length; i++) {
    var col = header[i];
    if (col.length == 0)
      continue;

    if (!fields_map.has(col))
      return null;

    var field = fields_map.get(col);
    field.index = i;
    fields_map.set(col, field);
  }

  // Return new format
  return {
    get: function(field) {
      return fields_map.get(field);
    },
    numericalRandom: fields.numericalRandom
  };
}

function combinations(array) {
  var results = [];
  for (var i = 0; i < array.length - 1; i++) {
    // This is where you'll capture that last value
    for (var j = i + 1; j < array.length; j++) {
      results.push([array[i], array[j]]);
    }
  }
  return results;
}

function choose_designs(fields) {
  // Scripts to load
  var scripts = new Set(),
      chosen = [];

  // Cache data manipulations
  var combos_numerical_random = null;

  // Iterate through each of the visualizations
  for (var key of Object.keys(visualizations)) {
    var v = visualizations[key];

    // Handle each data format
    v.dataFormats.forEach(function(format) {
      switch (format) {
      case "combo:numerical-random":
        if (!fields.numericalRandom || fields.numericalRandom.length < 2) {
          break;
        }
        if (!combos_numerical_random) {
          combos_numerical_random = combinations(fields.numericalRandom);
        }
        console.assert(combos_numerical_random.length > 0);

        // Add a group of visualizations
        chosen.push({
          type: key,
          position: v.position,
          iterations: combos_numerical_random.map(function(combo) {
            return { x: combo[0], y: combo[1] };
          }),
          iterationData: v.iterationData,
          iterationTitles: v.iterationTitles,
          makeQueryVars: v.makeQueryVars,
          render: v.render
        });

        // Make sure the script gets loaded
        scripts.add(v.script);
      }
    });
  }

  if (chosen.length == 0) {
    new Promise(function(resolve, reject) {
      reject(errors.NO_VISUALIZATIONS);
    });
  }

  // Make promises
  var scripts_array = Array.from(scripts.values());
  var load_scripts = Promise.all(scripts_array.map(function(script) {
    return loadScript(script);
  }));

  // Load visualization scripts
  return new Promise(function(resolve, reject) {
    load_scripts.then(function() {
      resolve(chosen);
    }).catch(reject);
  });
}

async function render_visualizations(config) {
  // Sort visualizations by position
  config.visualizations.sort(function(a, b) {
    return a.position - b.position;
  });

  // Render each visualization
  var pn = 1;
  for (var i = 0; i < config.visualizations.length; i++) {
    var v = config.visualizations[i];
    console.log("visualization", v);

    // Plots container
    var plots = plots_container();

    // Choose n value
    var n = choose_n(v.iterations.length);

    // Iterate through visualization
    for (var j = 0; j < v.iterations.length; j++) {
      var iter = v.iterations[j];

      // Get the data needed for this iteration
      var input = v.iterationData(iter, config.fields, config.data.slice(1));

      // Make the visualization
      var svg = await v.render(input);

      // Get a title to describe the visualization
      var titles = v.iterationTitles(iter, config.fields);

      console.log("visualization type:", v.type);

      // Make the plot url
      var url = "/plot?id=" + config.id +
                "&sheet=" + config.sheet +
                "&pn=" + pn +
                "&v=" + v.type;
      var extraQueryVars = v.makeQueryVars(iter, config.fields);
      if (extraQueryVars.length > 0) {
        url += "&" + extraQueryVars.join("&");
      }

      // Put the plot into a DOM element
      var plot = format_plot(pn, url, n, titles, svg);

      // Add the plot element to the container
      plots.appendChild(plot);

      // Increment the plot number
      pn += 1;
    }

    // Add the plot to the root
    config.root.appendChild(plots);
  }

  // If all that worked, then fill in the report title
  set_title(config.title, config.url);
}

function set_title(title, url) {
  var title_element = document.getElementById("report-spreadsheet-title"),
      link_element = document.getElementById("report-spreadsheet-url");

  title_element.textContent = title;
  link_element.href = url;
}

function plots_container() {
  var div = document.createElement("div");
  div.classList.add("report-plots-container");
  return div;
}

function choose_n(num_iterations) {
  return 4;
}

function format_plot(plot_number, url, n, titles, svg) {
  // Create <div class="svg-overlay"><p>Expand</p></div>
  var overlay = document.createElement("div");
  overlay.classList.add("report-svg-overlay");

  var paragraph = document.createElement("p"),
      expand = document.createTextNode("Expand");
  paragraph.appendChild(expand);
  overlay.appendChild(paragraph);

  // Create <div class="svg-wrap">
  var wrap = document.createElement("a");
  wrap.id = "pn-" + plot_number;
  wrap.classList.add("report-svg-wrap");
  wrap.href = url;
  wrap.target = "_blank";
  wrap.rel = "noopener noreferrer";

  titles.forEach(function(title) {
    wrap.appendChild(format_plot_title(title));
  });
  wrap.appendChild(svg);
  wrap.appendChild(overlay);

  // Create <div class="plot-n">
  var container = document.createElement("div");
  container.classList.add("report-plot-" + n);
  container.appendChild(wrap);

  return container;
}

function format_plot_title(title) {
  var div = document.createElement("div");
  div.classList.add("report-plot-title");
  div.appendChild(document.createTextNode(title));
  return div;
}

export {
  choose_single_sheet,
  organize_fields,
  choose_designs,
  match_header_to_fields,
  render_visualizations
};
