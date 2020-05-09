import lib from "../lib/index.js";
import notebook from "./notebook.js";

// Regression scatterplot
//
// context: {
//   x: "diabetes",
//   y: "pulmonary_disease"
// }
// config: {
//   data: [{ x: 5.67, y: 10.45}],
//   labelX: "Diabetes",
//   labelY: "Pulmonary disease"
// }
export default {
  make: function(fields, data, ctx) {
    var df = lib.filterByNumericVariables(fields, data, ctx);
    var config = {
      data: df,
      labelX: fields.get(ctx.x).description,
      labelY: fields.get(ctx.y).description
    };
    return lib.runNotebook(notebook, cfg, "chart");
  },
  checkContext: function(fields, ctx) {
    return lib.validateFields(fields, [ctx.x, ctx.y]);
  },
  toQuery: function(ctx) {
    return [ "x=" + ctx.x, "y=" + ctx.y ];
  },
  fromQuery: function(fields, qvars) {
    var x = qvars.get("x"), y = qvars.get("y");
    return { x: x, y: y };
  },
  describe: function(fields, ctx) {
    return {
      plot: "Scatterplot with trend line",
      variables: lib.getFieldNames(fields, [ctx.x, ctx.y])
    };
  }
}

const notebookUrl = "https://observablehq.com/d/e172324391f49fb8";
export { notebookURL };
