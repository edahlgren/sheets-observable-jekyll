import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

var reportAPI = {
  config: function(i, fields, data) {
    var stateKey = fields.get(i.category),
        dateKey = fields.get(i.date),
        valueKey = fields.get(i.value);

    var minDate = dateKey.min,
        maxDate = dateKey.max;

    var m = {};
    data.forEach(function(row) {
      var state = row[stateKey.index],
          date = +row[dateKey.index];

      if (date == minDate || date == maxDate) {
        if (!m.hasOwnProperty(state)) {
          m[state] = {min: [], max: []};
        }
        var values = m[state],
            value = +row[valueKey.index];

        if (date === minDate) {
          values.min.push(value);
        } else {
          values.max.push(value);
        }
      }
    });

    var absMax = 0;
    for (var key in m) {
      if (m.hasOwnProperty(key)) {
        var values = m[key];
        var minSum = values.min.reduce(function(sum, current) {
          return sum + current;
        }, 0);
        var maxSum = values.max.reduce(function(sum, current) {
          return sum + current;
        }, 0);

        var min = (1.0 * minSum) / (1.0 * values.min.length),
            max = (1.0 * maxSum) / (1.0 * values.max.length),
            diff = max - min;

        m[key] = diff;
        if (Math.abs(diff) > absMax) {
          absMax = Math.abs(diff);
        }
      }
    }

    return {
      data: m,
      colorScale1: {
        start: -absMax,
        end: 0,
        startColor: "rgb(169, 220, 252)",
        endColor: "rgb(246, 250, 255)"
      },
      colorScale2: {
        start: 0,
        end: absMax,
        startColor: "rgb(255, 244, 239)",
        endColor: "rgb(252, 195, 169)"
      }
    };
  },

  titles: function(i, fields) {
    var minDate = fields.get(i.date).min,
        maxDate = fields.get(i.date).max;
    return [
      fields.get(i.value).description,
      "(" + minDate + "-" + maxDate + ")"
    ];
  },

  makeVars: function(i, fields) {
    var minDate = fields.get(i.date).min,
        maxDate = fields.get(i.date).max;
    return [
      "category=" + i.category,
      "date=" + i.date,
      "dateMin=" + minDate,
      "dateMax=" + maxDate,
      "value=" + i.value,
      "value_desc=" + fields.get(i.value).description
    ];
  },
};

var plotAPI = {
  parseVars: function(query_vars, header) {
    var category = query_vars.get("category"),
        date = query_vars.get("date"),
        dateMin = query_vars.get("dateMin"),
        dateMax = query_vars.get("dateMax"),
        value = query_vars.get("value"),
        value_desc = query_vars.get("value_desc");

    if (!category) {
      var error = new Error("Need query string variables 'category'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }
    if (!date || !dateMin || !dateMax) {
      var error = new Error("Need query string variables 'date', 'dateMin', and 'dateMax'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }
    if (!value || !value_desc) {
      var error = new Error("Need query string variables 'value' and 'value_desc'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }

    var category_index = -1,
        date_index = -1,
        value_index = -1;

    for (var i = 0; i < header.length; i++) {
      if (header[i] === category) {
        category_index = i;
        continue;
      }
      if (header[i] === date) {
        date_index = i;
        continue;
      }
      if (header[i] === value) {
        value_index = i;
      }
    }

    if (category_index < 0 || date_index < 0 || value_index < 0) {
      var error = new Error("Query var not in header");
      throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
    }

    return {
      category_index: category_index,
      date_index: date_index,
      date_min: dateMin,
      date_max: dateMax,
      value_index: value_index,
      value_desc: value_desc
    };
  },

  config: function(vars, data) {
    var m = {};
    data.forEach(function(row) {
      var state = row[vars.category_index],
          date = row[vars.date_index];

      if (date !== vars.date_min || date !== vars.date_max) {
        return;
      }
      if (!m.hasOwnProperty(state)) {
        m[state] = {min: [], max: []};
      }
      var values = m[state],
          value = +row[vars.value_index];

      if (date === vars.date_min) {
        values.min.push(value);
      } else {
        values.max.push(value);
      }
    });

    var absMax = 0;
    for (var key in m) {
      if (m.hasOwnProperty(key)) {
        var values = m[key];
        var minSum = values.min.reduce(function(sum, current) {
          return sum + current;
        }, 0);
        var maxSum = values.max.reduce(function(sum, current) {
          return sum + current;
        }, 0);

        var min = (1.0 * minSum) / (1.0 * values.min.length),
            max = (1.0 * maxSum) / (1.0 * values.max.length),
            diff = max - min;

        m[key] = diff;
        if (Math.abs(diff) > absMax) {
          absMax = Math.abs(diff);
        }
      }
    }

    return {
      data: m,
      colorScale1: {
        start: -absMax,
        end: 0,
        startColor: "rgb(169, 220, 252)",
        endColor: "rgb(246, 250, 255)"
      },
      colorScale2: {
        start: 0,
        end: absMax,
        startColor: "rgb(255, 244, 239)",
        endColor: "rgb(252, 195, 169)"
      }
    };
  },

  titles: function(vars) {
    return [ vars.value_desc ];
  }
};

export default {
  dataFormats: [
    "category-us-state+category-date:numerical-random-value"
  ],
  script: "/assets/plots/us-regions-diff.js",
  render: function(data) {
    if (!window.us_regions_diff) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("us_regions_diff function isn't defined"));
    }
    return us_regions_diff(data);
  },
  report: reportAPI,
  plot: plotAPI
};
