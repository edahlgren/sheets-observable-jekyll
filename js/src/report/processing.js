// Imports ------------------------------------

import loadScript from "../loadScript.js";
import {
  ERROR_CANT_GET_APP_FILE,
  ERROR_NO_VISUALIZATIONS,
  ERROR_PREPARING_VISUALIZATION_INPUT,
  ERROR_RENDERING_VISUALIZATION,
  ERROR_FORMATTING_VISUALIZATION,
  isKnownError,
  makeKnownError
} from "../errors.js";
import visualizations from "../visualizations.js";

import specs from "../specs/index.js";

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
  if (header.length < 9) {
    return { isMalformed: true };
  }
  if (header[0] !== "Field" ||
      header[1] !== "Description" ||
      header[2] !== "Caption" ||
      header[3] !== "Type" ||
      header[4] !== "Distribution" ||
      header[5] !== "TotalUnique" ||
      header[6] !== "Avg" ||
      header[7] !== "Min" ||
      header[8] !== "Max") {
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
      totalUnique: +field[5],
      avg: (field[6] !== "" ? +field[6] : null),
      min: (field[7] !== "" ? +field[7] : null),
      max: (field[8] !== "" ? +field[8] : null),
      index: -1
    };
  });

  // Collect all categorical (grouped) fields
  var categorical = fields.filter(function(field) {
    return field.distribution === "grouped";
  }).map(function(field) {
    return field.field;
  });

  // Collect all numerical random fields
  var numerical_random = fields.filter(function(field) {
    var numerical = (field.type === "numerical" ||
                     field.type === "percent");
    return numerical && field.distribution === "random";
  }).map(function(field) {
    return field.field;
  });

  return {
    all: fields,
    categorical: categorical,
    numericalRandom: numerical_random,
    isMalformed: false
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
  fields.get = function(field) {
    return fields_map.get(field);
  };
  return fields;
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

async function load_designs2(fields, loader) {
  loader.desc.textContent = "Choosing visualizations";
  var { designs, scripts } = choose_designs(fields);
  loader.bar.style.width = 20 + "%";

  console.log("found designs:");
  designs.forEach(function(d) {
    console.log("  ", d.type, "("+ d.iterations.length + ")");
  });

  // Handle no visulizations
  if (designs.length == 0) {
    var distributions = fields.all.map(function(field) {
      return field.field + ":" + field.distribution;
    });
    var error = new Error("fields: " + JSON.stringify(distributions, null, 2));
    throw makeKnownError(ERROR_NO_VISUALIZATIONS, error);
  }

  // Actually load the scripts
  await load_scripts(Array.from(scripts.values()), loader);

  // Return chosen and loaded designs
  return designs;
}

function choose_designs(fields) {
  var scripts = new Set(),
      designs = [],
      cache = {};

  for (var key of Object.keys(specs.visualizations)) {
    var v = specs.visualizations[key];

    v.api.dataFormats.forEach(function(f) {
      var parts = f.split(':'),
          type1 = parts[0],
          type2 = parts[1];

      var d = get_iterations(cache, fields, type1, type2);
      if (d.found) {
        designs.push({
          type: key,
          group: v.group,
          spec: v.api,
          iterations: d.iterations
        });
        scripts.add(v.api.script);
      }
    });
  }

  return { designs: designs, scripts: scripts };
}

function get_iterations(cache, fields, type1, type2) {
  // grouped
  if (type1 === "limited-category!date+category-date" &&
      type2 === "numerical-random-value") {

    var gs = fields.categorical;
    if (!gs) {
      return { found: false };
    }

    var category = "";
    var date = "";
    for (var i = 0; i < gs.length; i++) {
      var field = fields.get(gs[i]);
      if (field.type !== "date" && field.totalUnique <= 20) {
        category = gs[i];
      }
      if (field.type === "date") {
        date = gs[i];
      }
    }

    if (category === "") {
      return { found: false };
    }
    if (date === "") {
      return { found: false };
    }

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    return {
      found: true,
      iterations: fs.map(function(f) {
        return { category: category, date: date, value: f };
      })
    };
  }
  if (type1 === "category!date+category-date" &&
      type2 === "numerical-random-value") {

    var gs = fields.categorical;
    if (!gs) {
      return { found: false };
    }

    var category = "";
    var totalUnique = 0;
    var date = "";
    for (var i = 0; i < gs.length; i++) {
      var field = fields.get(gs[i]);
      if (field.type !== "date" && field.totalUnique > totalUnique) {
        category = gs[i];
        totalUnique = field.totalUnique;
      }
      if (field.type === "date") {
        date = gs[i];
      }
    }

    if (category === "") {
      return { found: false };
    }
    if (date === "") {
      return { found: false };
    }

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    return {
      found: true,
      iterations: fs.slice(0, 1).map(function(f) {
        return { category: category, date: date, value: f };
      })
    };
  }

  if (type1 === "category-us-state+category-date" &&
      type2 === "numerical-random-value") {

    var gs = fields.categorical;
    if (!gs) {
      return { found: false };
    }

    var category = "";
    var date = "";
    for (var i = 0; i < gs.length; i++) {
      var field = fields.get(gs[i]);
      if (field.type === "us-state") {
        category = gs[i];
      }
      if (field.type === "date") {
        date = gs[i];
      }
    }

    if (category === "") {
      return { found: false };
    }
    if (date === "") {
      return { found: false };
    }

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    return {
      found: true,
      iterations: fs.map(function(f) {
        return { category: category, date: date, value: f };
      })
    };
  }

  if (type1 === "category-us-state" &&
      type2 === "numerical-random-value") {

    var gs = fields.categorical;
    if (!gs) {
      return { found: false };
    }
    var categories = gs.filter(function(g) {
      var field = fields.get(g);
      return field.type === "us-state";
    });
    if (categories.length == 0) {
      return { found: false };
    }

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    return {
      found: true,
      iterations: fs.map(function(f) {
        return { category: categories[0], value: f };
      })
    };
  }

  if (type1 === "category-date" &&
      type2 === "numerical-random-value") {

    var gs = fields.categorical;
    if (!gs) {
      return { found: false };
    }
    var categories = gs.filter(function(g) {
      var field = fields.get(g);
      return field.type === "date";
    });
    if (categories.length == 0) {
      return { found: false };
    }

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    return {
      found: true,
      iterations: fs.map(function(f) {
        return { category: categories[0], value: f };
      })
    };
  }

  if (type1 === "category!date" &&
      type2 === "numerical-random-value") {

    var gs = fields.categorical;
    if (!gs) {
      return { found: false };
    }
    var categories = gs.filter(function(g) {
      var field = fields.get(g);
      return field.type !== "date" && field.totalUnique < 20;
    });
    if (categories.length == 0) {
      return { found: false };
    }

    // numerical-random-x
    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    return {
      found: true,
      iterations: fs.slice(0, 1).map(function(f) {
        return { category: categories[0], value: f };
      })
    };
  }

  if (type1 === "category" &&
      type2 === "numerical-random-grid") {

    var gs = fields.categorical;
    if (!gs) {
      return { found: false };
    }

    // numerical-random-grid
    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    var secondary = fs[0], other = fs.slice(1);

    return {
      found: true,
      iterations: gs.map(function(g) {
        var columns = [
          {key: g, type: "category", primary: true},
          {key: secondary, type: "numerical", secondary: true}
        ];
        return {
          primary: g,
          secondary: secondary,
          grid: columns.concat(other.map(function(o) {
            return {key: o, type: "numerical"};
          }))
        };
      })
    };
  }

  // numerical-random
  if (type1 === "numerical-random" &&
      type2 === "xy") {

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    if (fs.length <= 1) {
      return { found: false };
    }

    if (!cache.hasOwnProperty("numerical-random:combos")) {
      cache["numerical-random:combos"] = combinations(fs);
    }
    var combos = cache["numerical-random:combos"];

    return {
      found: true,
      iterations: combos.slice(0, 15).map(function(c) {
        return { x: c[0], y: c[1] };
      })
    };
  }

  if (type1 === "numerical-random" &&
      type2 === "xyz") {

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    if (fs.length <= 1) {
      return { found: false };
    }

    if (!cache.hasOwnProperty("numerical-random:combos")) {
      cache["numerical-random:combos"] = combinations(fs);
    }

    var focus = fs[0];
    var combos = cache["numerical-random:combos"].filter(function(c) {
      return c[0] !== focus && c[1] !== focus;
    });

    return {
      found: true,
      iterations: combos.slice(0, 1).map(function(c) {
        return { x: focus, y: c[0], z: c[1] };
      })
    };
  }

  if (type1 === "numerical-random" &&
      type2 === "list-all") {

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    if (fs.length <= 1) {
      return { found: false };
    }

    return {
      found: true,
      iterations: [{list: fs}]
    };
  }

  if (type1 === "percent" &&
      type2 === "list-all") {

    var fs = fields.numericalRandom;
    if (!fs) {
      return { found: false };
    }
    if (fs.length <= 1) {
      return { found: false };
    }
    var percents = fs.filter(function(d) {
      var field = fields.get(d);
      return field.type === "percent";
    })

    return {
      found: true,
      iterations: [{list: percents}]
    };
  }

  // default
  return { found: false };
}

async function load_designs(fields, loader) {
  // Scripts to load
  var scripts = new Set(),
      chosen = [];

  // Cache data manipulations
  var combos_numerical_random = null;

  // Choosing visualizations
  loader.desc.textContent = "Choosing visualizations";
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
  loader.bar.style.width = 20 + "%";

  // Handle no visulizations
  if (chosen.length == 0) {
    var distributions = fields.all.map(function(field) {
      return field.field + ":" + field.distribution;
    });
    var error = new Error("fields: " + JSON.stringify(distributions, null, 2));
    throw makeKnownError(ERROR_NO_VISUALIZATIONS, error);
  }

  // Actually load the scripts
  await load_scripts(Array.from(scripts.values()), loader);

  // Return chosen + loaded designs
  return chosen;
}

async function load_scripts(scripts, loader) {
  var total = scripts.length,
      interval = 80 / total;

  for (var i = 1; i <= total; i++) {
    loader.desc.textContent = i + "/" + total;
    try {
      await loadScript(scripts[i - 1]);
    } catch (error) {
      throw makeKnownError(ERROR_CANT_GET_APP_FILE, error);
    }
    loader.bar.style.width = (i == total ? 100 : 20 + (interval * i)) + "%";
  }
}

async function render_visualizations2(config, loader) {
  var total = 0;
  config.visualizations.map(function(v) {
    total += v.iterations.length;
  });
  var interval = 100 / total;

  // Sort visualizations by position
  config.visualizations.sort(function(a, b) {
    return a.position - b.position;
  });

  // Render each visualization
  var pn = 1;
  for (var i = 0; i < config.visualizations.length; i++) {
    var v = config.visualizations[i];

    // Plots container
    var plots = plots_container();

    // Choose n value
    var n = choose_n(v.iterations.length);

    // Iterate
    for (var j = 0; j < v.iterations.length; j++) {
      var iter = v.iterations[j],
          input = null,
          svg = null,
          plot = null;

      loader.desc.textContent = pn + "/" + total;

      // Get the data needed for this iteration
      console.log("making", v.type, "iteration", iter);
      try {
        input = v.spec.report.config(iter, config.fields, config.data.slice(1));
      } catch (error) {
        throw makeKnownError(ERROR_PREPARING_VISUALIZATION_INPUT, error);
      }

      // Make the visualization
      try {
        svg = await v.spec.render(input);
      } catch (error) {
        console.log(error);
        if (isKnownError(error)) {
          throw error;
        }
        throw makeKnownError(ERROR_RENDERING_VISUALIZATION, error);
      }

      // Format the plot
      try {
        // Get a title to describe the visualization
        var titles = v.spec.report.titles(iter, config.fields);

        // Make the plot url
        var url = "/plot?" + config.identifier +
                  "&pn=" + pn +
                  "&v=" + v.type;

        var extraQueryVars = v.spec.report.makeVars(iter, config.fields);
        if (extraQueryVars.length > 0) {
          url += "&" + extraQueryVars.join("&");
        }

        // Put the plot into a DOM element
        plot = format_plot(pn, url, n, titles, svg);
      } catch (error) {
        throw makeKnownError(ERROR_FORMATTING_VISUALIZATION, error);
      }

      // Add the plot element to the container
      plots.appendChild(plot);

      // Update loader
      loader.bar.style.width = (pn == total ? 100 : interval * pn) + "%";

      // Increment the plot number
      pn += 1;
    }

    // Add the plot to the root
    config.root.appendChild(plots);
  }

  // If all that worked, then fill in the report title
  set_title(config.title, config.url);
}

async function render_visualizations(config, loader) {
  var total = 0;
  config.visualizations.map(function(v) {
    total += v.iterations.length;
  });
  var interval = 100 / total;

  // Sort visualizations by position
  config.visualizations.sort(function(a, b) {
    return a.position - b.position;
  });

  // Render each visualization
  var pn = 1;
  for (var i = 0; i < config.visualizations.length; i++) {
    var v = config.visualizations[i];

    // Plots container
    var plots = plots_container();

    // Choose n value
    var n = choose_n(v.iterations.length);

    // Iterate through visualization
    for (var j = 0; j < v.iterations.length; j++) {
      var iter = v.iterations[j],
          input = null,
          svg = null,
          plot = null;

      loader.desc.textContent = pn + "/" + total;

      // Get the data needed for this iteration
      try {
        input = v.iterationData(iter, config.fields, config.data.slice(1));
      } catch (error) {
        throw makeKnownError(ERROR_PREPARING_VISUALIZATION_INPUT, error);
      }

      // Make the visualization
      try {
        svg = await v.render(input);
      } catch (error) {
        if (isKnownError(error)) {
          throw error;
        }
        throw makeKnownError(ERROR_RENDERING_VISUALIZATION, error);
      }

      // Format the plot
      try {
        // Get a title to describe the visualization
        var titles = v.iterationTitles(iter, config.fields);

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
        plot = format_plot(pn, url, n, titles, svg);
      } catch (error) {
        throw makeKnownError(ERROR_FORMATTING_VISUALIZATION, error);
      }

      // Add the plot element to the container
      plots.appendChild(plot);

      // Update loader
      loader.bar.style.width = (pn == total ? 100 : interval * pn) + "%";

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
  div.classList.add("wrapper-lg");
  return div;
}

function choose_n(num_iterations) {
  if (num_iterations < 3) return num_iterations;
  if (num_iterations == 3) return 3;
  if (num_iterations <= 4) return 2;
  if (num_iterations <= 9) return 4;
  return 5;
}

function format_plot(plot_number, url, n, titles, svg) {
  // Create <div class="svg-wrap">
  var wrap = document.createElement("a");
  wrap.id = "pn-" + plot_number;
  wrap.classList.add("report-svg-wrap");
  wrap.href = url;
  wrap.target = "_blank";
  wrap.rel = "noopener noreferrer";

  //titles.forEach(function(title) {
  //  wrap.appendChild(format_plot_title(title));
  //});
  wrap.appendChild(svg);

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
  load_designs,
  load_designs2,
  match_header_to_fields,
  render_visualizations,
  render_visualizations2
};
