import { Runtime } from "../../runtime-implementation.js";

function runNotebook(notebook, config, cell) {
  var main = new Runtime().module(notebook);
  main.redefine("config", config)
  return main.value(cell);
}

function getFieldNames(fields, list) {
  var m = {};
  list.forEach(function(d) {
    m[d] = fields.get(d).description;
  });
  return m;
}

function validateFields(fields, vars) {
  for (var i = 0; i < vars.length; i++) {
    var field = fields.get(vars[i]);
    if (!field) {
      var error = new Error("Field in query var '" + vars[i] + "' isn't a field in the spreadsheet");
      throw makeKnownError(ERROR_PLOT_URL_DOESNT_MATCH_DATA, error);
    }
  }
}

// columns: ["a", "b", "c", "d"]
// returns: [{"a": 23.4, "b", 34.5, "c", 12.3}, ...]
function filterByNumericColumns(fields, data, columns) {
  return data.map(function(row) {
    var m = {};
    for (var i = 0; i < columns.length; i++) {
      var d = columns[i];
      var index = fields.get(d).index;
      if (row[index] === "") { // check for empty cells
        return null;
      }
      m[d] = +row[index];
    }
    return m;
  }).filter(function(p) {
    return (p ? true : false);
  });
}

function filterByNumericVariables(fields, data, variables) {
  var indices = [];
  for (var key in variables) {
    if (variables.hasOwnProperty(key)) {
      var index = fields.get(variables[key]).index;
      indices.push({key: key, index: index});
    }
  }
  return data.map(function(row) {
    var m = {};
    for (var i = 0; i < indices.length; i++) {
      var idx = indices[i];
      if (row[idx.index].length == 0) { // check for empty cells
        return null;
      }
      m[idx.key] = +row[idx.index];
    }
    return m;
  }).filter(function(p) {
    return (p ? true : false);
  });
}

export default {
  runNotebook: runNotebook,
  getFieldNames: getFieldNames,
  validateFields: validateFields,
  filterByNumericColumns: filterByNumericColumns,
  filterByNumericVariables: filterByNumericVariables
}
