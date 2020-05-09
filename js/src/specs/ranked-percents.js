import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

var reportAPI = {
  config: function(i, fields, data) {
    var means = i.list.map(function(c) {
      return { key: c, percent: fields.get(c).avg };
    });
    return { data: means };
  },

  titles: function(i, fields) {
    return [ "Percentages" ];
  },

  makeVars: function(i, fields) {
    var means = i.list.map(function(c) {
      return c + ":" + fields.get(c).avg;
    });
    return [ "data=" + means.join(',') ];
  },
};

var plotAPI = {
  parseVars: function(query_vars, header) {
    var data = query_vars.get("data");
    if (!data) {
      var error = new Error("Need query string variable 'data'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }

    var vars = {};
    var dataList = columns.split(',');

    for (var i = 0; i < dataList.length; i++) {
      var parts = dataList[i].split(":"),
          key = parts[0],
          percent = +parts[1];
      vars[key] = percent;
    }

    return vars;
  },

  config: function(vars, data) {
    var out = [];
    for (var key in vars) {
      if (vars.hasOwnProperty(key)) {
        out.push({ key: key, percent: vars[key] });
      }
    }
    return { data: out };
  },

  titles: function(vars) {
    return [ "Percentages" ];
  }
};

export default {
  dataFormats: [
    "percent:list-all"
  ],
  script: "/assets/plots/ranked-percents.js",
  render: function(data) {
    if (!window.ranked_percents) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("ranked_percents function isn't defined"));
    }
    return ranked_percents(data);
  },
  report: reportAPI,
  plot: plotAPI
};
