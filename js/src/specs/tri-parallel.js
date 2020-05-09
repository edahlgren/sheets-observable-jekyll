import {
  ERROR_APP_RESOURCE_DOESNT_EXIST,
  ERROR_WITH_PLOT_URL,
  ERROR_PLOT_URL_DOESNT_MATCH_DATA,
  makeKnownError
} from "../errors.js";

var reportAPI = {
  config: function(i, fields, data) {
    var x = fields.get(i.x),
        y = fields.get(i.y),
        z = fields.get(i.z);

    var points = data.map(function(row) {
      return {
        middle: +row[x.index],
        top: +row[y.index],
        bottom: +row[z.index]
      };
    }).filter(function(p) {
      return p.middle != 0 && p.top != 0 && p.bottom != 0;
    });

    return {
      data: points,
      middle: x.description,
      top: y.description,
      bottom: z.description
    };
  },

  titles: function(i, fields) {
    return [
      fields.get(i.y).description,
      fields.get(i.x).description,
      fields.get(i.z).description
    ];
  },

  makeVars: function(i, fields) {
    return [
      "middle=" + i.x,
      "middle_desc=" + fields.get(i.x).description,
      "top=" + i.y,
      "top_desc=" + fields.get(i.y).description,
      "bottom=" + i.z,
      "bottom_desc=" + fields.get(i.z).description
    ];
  },
};

var plotAPI = {
  parseVars: function(query_vars, header) {
    var top = query_vars.get("top"),
        middle = query_vars.get("middle"),
        bottom = query_vars.get("bottom");

    if (!top) {
      var error = new Error("Need query string variables 'top'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }
    if (!middle) {
      var error = new Error("Need query string variables 'middle'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }
    if (!bottom) {
      var error = new Error("Need query string variables 'bottom'");
      throw makeKnownError(ERROR_WITH_PLOT_URL, error);
    }

    var top_index = -1,
        middle_index = -1,
        bottom_index = -1;

    for (var i = 0; i < header.length; i++) {
      if (header[i] === top) {
        top_index = i;
        continue;
      }
      if (header[i] === middle) {
        middle_index = i;
        continue;
      }
      if (header[i] === bottom) {
        bottom_index = i;
      }
    }

    if (top_index < 0 || middle_index < 0 || bottom_index < 0) {
      var error = new Error("Query var not in header");
      throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
    }

    return {
      top: top, top_index: top_index,
      top_desc: query_vars.get("top_desc"),
      middle: middle, middle_index: middle_index,
      middle_desc: query_vars.get("middle_desc"),
      bottom: bottom, bottom_index: bottom_index,
      bottom_desc: query_vars.get("bottom_desc")
    };
  },

  config: function(vars, data) {
    var points = data.slice(1).map(function(row) {
      return {
        top: +row[vars.top_index],
        middle: +row[vars.middle_index],
        bottom: +row[vars.bottom_index]
      };
    }).filter(function(p) {
      return p.middle != 0 && p.top != 0 && p.bottom != 0;
    });

    return {
      data: points,
      top: vars.top_desc,
      middle: vars.middle_desc,
      bottom: vars.bottom_desc
    };
  },

  titles: function(vars) {
    return [
      vars.top_desc,
      vars.middle_desc,
      vars.bottom_desc
    ];
  }
};

export default {
  dataFormats: [
    "numerical-random:xyz"
  ],
  script: "/assets/plots/tri-parallel.js",
  render: function(data) {
    if (!window.tri_parallel_coordinates) {
      throw makeKnownError(ERROR_APP_RESOURCE_DOESNT_EXIST,
        new Error("tri_parallel_coordinates function isn't defined"));
    }
    return tri_parallel_coordinates(data);
  },
  report: reportAPI,
  plot: plotAPI
};
