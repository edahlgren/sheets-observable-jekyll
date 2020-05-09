import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

var reportAPI = {
  config: function(i, fields, data) {
    var stateKey = fields.get(i.category),
        valueKey = fields.get(i.value);

    var m = {};
    data.forEach(function(row) {
      var state = row[stateKey.index];
      if (!m.hasOwnProperty(state)) {
        m[state] = [];
      }
      var values = m[state],
          value = +row[valueKey.index];

      if (value > 0) {
        values.push(value);
      }
    });

    for (var key in m) {
      if (m.hasOwnProperty(key)) {
        var values = m[key];
        var sum = values.reduce(function(sum, current) {
          return sum + current;
        }, 0);

        m[key] = (1.0 * sum) / (1.0 * values.length);
      }
    }
    return { data: m };
  },

  titles: function(i, fields) {
    return [ fields.get(i.value).description ];
  },

  makeVars: function(i, fields) {
    return [
      "category=" + i.category,
      "value=" + i.value,
      "value_desc=" + fields.get(i.value).description
    ];
  },
};

var plotAPI = {
  parseVars: function(query_vars, header) {
    var category = query_vars.get("category"),
        value = query_vars.get("value"),
        value_desc = query_vars.get("value_desc");

    if (!category) {
      var error = new Error("Need query string variables 'category'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }
    if (!value || !value_desc) {
      var error = new Error("Need query string variables 'value' and 'value_desc'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }

    var category_index = -1,
        value_index = -1;

    for (var i = 0; i < header.length; i++) {
      if (header[i] === x) {
        category_index = i;
        continue;
      }
      if (header[i] === y) {
        value_index = i;
      }
    }

    if (category_index < 0 || value_index < 0) {
      var error = new Error("Query var not in header");
      throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
    }

    return {
      category_index: category_index,
      value_index: value_index,
      value_desc: value_desc
    };
  },

  config: function(vars, data) {
    var m = {};
    data.forEach(function(row) {
      var state = row[vars.category_index];
      if (!m.hasOwnProperty(state)) {
        m[state] = [];
      }
      var values = m[state],
          value = +row[vars.value_index];

      if (value > 0) {
        values.push(value);
      }
    });

    for (var key in m) {
      if (m.hasOwnProperty(key)) {
        var values = m[key];
        var sum = values.reduce(function(sum, current) {
          return sum + current;
        }, 0);

        m[key] = (1.0 * sum) / (1.0 * values.length);
      }
    }
    return { data: m };
  },

  titles: function(vars) {
    return [ vars.value_desc ];
  }
};

export default {
  dataFormats: [
    "category-us-state:numerical-random-value"
  ],
  script: "/assets/plots/us-regions-value.js",
  render: function(data) {
    if (!window.us_regions_value) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("us_regions_value function isn't defined"));
    }
    return us_regions_value(data);
  },
  report: reportAPI,
  plot: plotAPI
};
