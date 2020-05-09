import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

function sortedValues(values) {
  var out = [];
  for (var key in values) {
    if (values.hasOwnProperty(key)) {
      var vs = values[key];
      var sum = vs.reduce(function(sum, current) {
        return sum + current;
      }, 0);
      out.push({key: key, value: (1.0 * sum) / (1.0 * vs.length)});
    }
  }
  var sorted = out.sort(function(a, b) {
    var dateA = new Date(a.key),
        dateB = new Date(b.key);
    return (dateA > dateB ? -1 : (dateA < dateB ? 1 : 0));
  });
  return sorted.map(function(d) {
    return d.value;
  });
}

var reportAPI = {
  config: function(i, fields, data) {
    var category = fields.get(i.category),
        dateKey = fields.get(i.date),
        valueKey = fields.get(i.value);

    var m = {};
    data.forEach(function(row) {
      var state = row[category.index],
          date = row[dateKey.index];
      if (!m.hasOwnProperty(state)) {
        m[state] = {};
      }
      var values = m[state];
      if (!values.hasOwnProperty(date)) {
        values[date] = [];
      }
      values[date].push(+row[valueKey.index]);
    });

    var out = [];
    for (var key in m) {
      if (m.hasOwnProperty(key)) {
        out.push({ key: key, values: sortedValues(m[key]) })
      }
    }
    return { data: out };
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
      if (!m.hasOwnProperty(state)) {
        m[state] = [];
      }
      var values = m[state];
      values.push({
        date: date,
        value: +row[vars.value_index]
      });
    });

    var out = [];
    for (var key in m) {
      if (m.hasOwnProperty(key)) {
        out.push({ key: key, values: sortedValues(m[key]) })
      }
    }
    return { data: out };
  },

  titles: function(vars) {
    return [
      vars.value_desc,
      "(" + vars.date_min + "-" + vars.date_max + ")"
    ];
  }
};

export default {
  dataFormats: [
    "limited-category!date+category-date:numerical-random-value"
  ],
  script: "/assets/plots/sparklines-list.js",
  render: function(data) {
    if (!window.sparklines_difflist) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("sparklines_difflist function isn't defined"));
    }
    return sparklines_difflist(data);
  },
  report: reportAPI,
  plot: plotAPI
};
