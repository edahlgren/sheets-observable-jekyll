import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

function makeConfig(columns, indices, data) {
  var points = data.map(function(row) {
    var m = {};
    columns.forEach(function(c) {
      var index = indices[c];
      m[c] = +row[index];
    });
    return m;
  }).filter(function(p) {
    for (var i = 0; i < columns.length; i++) {
      if (p[columns[i]] == 0) return false;
    }
    return true;
  });

  return { data: points, columns: columns };
}

var reportAPI = {
  config: function(i, fields, data) {
    var columns = i.list;
    var indices = {};
    columns.forEach(function(c) {
      indices[c] = fields.get(c).index;
    });

    return makeConfig(columns, indices, data);
  },

  titles: function(i, fields) {
    return [ "Correlation matrix" ];
  },

  makeVars: function(i, fields) {
    return [ "columns=" + i.list.join(',') ];
  },
};

var plotAPI = {
  parseVars: function(query_vars, header) {
    var columns = query_vars.get("columns");
    if (!columns) {
      var error = new Error("Need query string variable 'columns'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }

    var columnList = columns.split(',');
    var indices = {};
    for (var i = 0; i < columnList.length; i++) {
      var column = columnList[i];
      var index = header.indexOf(column);
      if (index < 0) {
        var error = new Error("Query var not in header");
        throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
      }
      indices[column] = index;
    }

    return { columns: columnList, indices: indices };
  },

  config: function(vars, data) {
    return makeConfig(vars.columns, vars.indices, data);
  },

  titles: function(vars) {
    return [ "Correlation matrix" ];
  }
};

export default {
  dataFormats: [
    "numerical-random:list-all"
  ],
  script: "/assets/plots/correlation-matrix.js",
  render: function(data) {
    if (!window.correlation_matrix) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("correlation_matrix function isn't defined"));
    }
    return correlation_matrix(data);
  },
  report: reportAPI,
  plot: plotAPI
};
