import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

function nonEmptyKeys(p) {
  for (var key in p) {
    if (p.hasOwnProperty(key) && (p[key] === "" || p[key] == 0)) {
      return false;
    }
  }
  return true;
}

var reportAPI = {
  config: function(i, fields, data) {
    var points = data.map(function(row) {
      var m = {};
      i.grid.forEach(function(g) {
        var index = fields.get(g.key).index,
            value = row[index];
        if (g.type === "numerical") {
          value = +value;
        }
        m[g.key] = value;
      })
      return m;
    }).filter(nonEmptyKeys);

    return {
      data: points,
      columns: i.grid,
      sortPrimary: true
    };
  },

  titles: function(i, fields) {
    return [
      "By",
      fields.get(i.primary).description,
      " + ",
      fields.get(i.secondary).description
    ];
  },

  makeVars: function(i, fields) {
    var other = i.grid.filter(function(g) {
      return g.key !== i.primary && g.key !== i.secondary;
    })
    return [
      "primary=" + i.primary,
      "primary_desc=" + fields.get(i.primary).description,
      "secondary=" + i.secondary,
      "secondary_desc=" + fields.get(i.secondary).description,
      "other=" + other.join(',')
    ];
  },
};

var plotAPI = {
  parseVars: function(query_vars, header) {
    var primary = query_vars.get("primary"),
        primary_desc = query_vars.get("primary"),
        secondary = query_vars.get("secondary"),
        secondary_desc = query_vars.get("secondary"),
        other = query_vars.get("other").split(',');

    if (!primary || !primary_desc) {
      var error = new Error("Need query string variables 'primary' and 'primary_desc");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }
    if (!secondary || !secondary_desc) {
      var error = new Error("Need query string variables 'secondary' and 'secondary_desc'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }

    var primary_index = -1,
        secondary_index = -1,
        other_indices = {};

    for (var i = 0; i < header.length; i++) {
      if (header[i] === primary) {
        primary_index = i;
        continue;
      }
      if (header[i] === secondary) {
        secondary_index = i;
        continue;
      }
      for (var j = 0; j < other.length; j++) {
        if (header[i] === other[j]) {
          other_indices[other[j]] = i;
          break;
        }
      }
    }

    if (primary_index < 0 || primary_index < 0) {
      var error = new Error("Query var not in header");
      throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
    }
    for (var i = 0; i < other.length; i++) {
      if (!other_indices.hasOwnProperty(other[i])) {
        var error = new Error("Query var not in header");
        throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
      }
    }

    var grid = [
      {index: primary_index, key: primary, type: "category", primary: true},
      {index: secondary_index, key: secondary, type: "numerical", secondary: true}
    ];
    grid = grid.concat(other.map(function(o) {
      return {index: other_indices[o], key: o, type: "numerical"};
    }));

    return {
      grid: grid,
      primary_description: primary_desc,
      secondary_description: secondary_desc
    };
  },

  config: function(vars, data) {
    var points = data.map(function(row) {
      var m = {};
      i.grid.forEach(function(g) {
        var index = g.index,
            value = row[index];
        if (g.type === "numerical") {
          value = +value;
        }
        m[g.key] = value;
      })
      return m;
    }).filter(nonEmptyKeys);

    return {
      data: points,
      columns: i.grid,
      sortPrimary: true
    };
  },

  titles: function(vars) {
    return [
      "By",
      vars.primary_description,
      " + ",
      vars.secondary_description
    ];
  }
};

export default {
  dataFormats: [
    "category:numerical-random-grid"
  ],
  script: "/assets/plots/navio-grid.js",
  render: function(data) {
    if (!window.navio_grid) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("navio_grid function isn't defined"));
    }
    return navio_grid(data);
  },
  report: reportAPI,
  plot: plotAPI
};
