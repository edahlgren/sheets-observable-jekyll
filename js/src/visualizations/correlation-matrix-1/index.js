import lib from "../lib/index.js";
import notebook from "./notebook.js";

// Basic correlation matrices
//
// context: {
//   columns: ["a", "b", "c", "d"]
// }
// config: {
//   data: [{"a": 23.4, "b", 34.5, "c", 12.3}, ...]
// }
export default {
  make: function(fields, data, ctx) {
    var df = lib.filterByNumericColumns(fields, data, ctx.columns);
    var config = {
      data: df,
      columns: ctx.columns
    };
    return lib.runNotebook(notebook, config, "chart");
  },
  checkContext: function(fields, ctx) {
    return lib.validateFields(fields, ctx.columns);
  },
  toQuery: function(ctx) {
    return [ "columns=" + ctx.columns.join(',') ];
  },
  fromQuery: function(fields, qvars) {
    var columns = qvars.get("columns").split(',');
    return { columns: columns };
  },
  describe: function(fields, ctx) {
    return {
      plot: "Correlation matrix",
      variables: lib.getFieldNames(fields, ctx.columns)
    };
  }
}

const notebookUrl = "https://observablehq.com/d/671762263456aced";
//export { notebookURL };
