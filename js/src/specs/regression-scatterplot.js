import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

var reportAPI = {
  config: function(i, fields, data) {
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

    return {
      data: points,
      labelX: x.description,
      labelY: y.description
    };
  },

  titles: function(i, fields) {
    return [
      fields.get(i.x).description + " \u2A2F",
      fields.get(i.y).description
    ];
  },

  makeVars: function(i, fields) {
    return [
      "x=" + i.x,
      "xlabel=" + fields.get(i.x).description,
      "y=" + i.y,
      "ylabel=" + fields.get(i.y).description
    ];
  },
};

var plotAPI = {
  parseVars: function(query_vars, header) {
    var x = query_vars.get("x"),
        y = query_vars.get("y"),
        x_desc = query_vars.get("xlabel"),
        y_desc = query_vars.get("ylabel");

    if (!x || !x_desc) {
      var error = new Error("Need query string variables 'x' and 'xlabel'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }
    if (!y || !y_desc) {
      var error = new Error("Need query string variables 'y' and 'ylabel'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }

    var x_index = -1,
        y_index = -1;

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
      var error = new Error("Query var not in header");
      throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
    }

    return {
      x: x, x_index: x_index, x_desc: x_desc,
      y: y, y_index: y_index, y_desc: y_desc
    };
  },

  config: function(vars, data) {
    var points = data.map(function(row) {
      return {
        x: +row[vars.x_index],
        y: +row[vars.y_index]
      };
    }).filter(function(p) {
      return p.x != 0 && p.y != 0;
    });

    return {
      data: points,
      labelX: vars.x_desc,
      labelY: vars.y_desc
    };
  },

  titles: function(vars) {
    return [
      vars.x_desc + " \u2A2F",
      vars.y_desc
    ];
  }
};

export default {
  dataFormats: [
    "numerical-random:xy"
  ],
  script: "/assets/plots/regression-scatterplot.js",
  render: function(data) {
    if (!window.regression_scatterplot) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("regression_scatterplot function isn't defined"));
    }
    return regression_scatterplot(data);
  },
  report: reportAPI,
  plot: plotAPI
};
