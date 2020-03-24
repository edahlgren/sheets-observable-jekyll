function iteration_data_xy(i, fields, data) {
  var x = fields.get(i.x),
      y = fields.get(i.y);

  var points = data.map(function(row) {
    return {
      x: +row[x.index],
      y: +row[y.index]
    };
  }).filter(function(p) {
    return p.x != 0 && p.y != 0;
  });

  return { points: points, x: x.description, y: y.description };
}

function iteration_titles_xy(i, fields) {
  return [
    fields.get(i.x).description + " \u2A2F",
    fields.get(i.y).description
  ];
}

function make_query_vars_xy(i, fields) {
  return [
    "x=" + i.x,
    "xlabel=" + fields.get(i.x).description,
    "y=" + i.y,
    "ylabel=" + fields.get(i.y).description
  ];
}

function parse_vars_xy(query_vars, header) {
  console.log("query vars", query_vars, "header", header);

  var x = query_vars.get("x"),
      y = query_vars.get("y"),
      x_desc = query_vars.get("xlabel"),
      y_desc = query_vars.get("ylabel");

  if (!x || !x_desc) {
    throw new Error("Need query string variables 'x' and 'xlabel'");
  }
  if (!y || !y_desc) {
    throw new Error("Need query string variables 'y' and 'ylabel'");
  }

  var x_index = -1,
      y_index = 1;

  for (var i = 0; i < header.length; i++) {
    if (header[i] === x) {
      x_index = i;
      continue;
    }
    if (header[i] === y) {
      y_index = i;
    }
  }

  if (x_index < 0 || y_index < 0) {
    throw new Error("Query var not in header");
  }

  return {
    x: x, x_index: x_index, x_desc: x_desc,
    y: y, y_index: y_index, y_desc: y_desc
  };
}

function plot_data_xy(vars, data) {
  var points = data.slice(1).map(function(row) {
    return {
      x: +row[vars.x_index],
      y: +row[vars.y_index]
    };
  }).filter(function(p) {
    return p.x != 0 && p.y != 0;
  });

  return { points: points, x: vars.x_desc, y: vars.y_desc };
}

function plot_title_xy(vars) {
  return vars.x_desc + " \u2A2F " + vars.y_desc;
}

const visualizations = {
  "basic-scatterplot": {
    // Position and data formats
    position: 1,
    dataFormats: [
      "combo:numerical-random"
    ],
    // Script and render function
    script: "/assets/plots/basic-scatterplot.js",
    render: function(data) {
      return basic_scatterplot(data);
    },
    // Iterating through the report graphics
    iterationData: iteration_data_xy,
    iterationTitles: iteration_titles_xy,
    // Handling query vars for single plot
    makeQueryVars: make_query_vars_xy,
    parseQueryVars: parse_vars_xy,
    // Making the single plot
    plotData: plot_data_xy,
    plotTitle: plot_title_xy
  }
};

export default visualizations;
