import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

var reportAPI = {
  config: function(i, fields, data) {
    var c = fields.get(i.category),
        v = fields.get(i.value);

    var m = {};
    data.forEach(function(row) {
      var category = row[c.index];
      if (!m.hasOwnProperty(category)) {
        m[category] = [];
      }

      var values = m[category],
          value = +row[v.index];

      if (value > 0) {
        values.push(value);
      }
    });

    var points = [];
    for (var key in m) {
      if (m.hasOwnProperty(key)) {
        points.push({key: key, values: m[key]});
      }
    }
    return { data: points };
  },

  titles: function(i, fields) {
    return [ fields.get(i.value).description ];
  },

  makeVars: function(i, fields) {
    return [
      "x=" + i.category,
      "x_desc=" + fields.get(i.category).description,
      "y=" + i.value,
      "y_desc=" + fields.get(i.value).description
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
    var m = {};
    data.forEach(function(row) {
      var category = row[vars.x_index];
      if (!m.hasOwnProperty(category)) {
        m[category] = [];
      }

      var values = m[category],
          value = +row[vars.y_index];

      if (value > 0) {
        values.push(value);
      }
    });

    var points = [];
    for (var key in m) {
      if (m.hasOwnProperty(key)) {
        points.push({key: key, values: m[key]});
      }
    }
    return { data: points };
  },

  titles: function(vars) {
    return [ vars.y_desc ];
  }
};

export default {
  dataFormats: [
    "category-date:numerical-random-value"
  ],
  script: "/assets/plots/vdot-strip.js",
  render: function(data) {
    if (!window.vertical_dot_strip) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("vertical_dot_strip function isn't defined"));
    }
    return vertical_dot_strip(data);
  },
  report: reportAPI,
  plot: plotAPI
};
