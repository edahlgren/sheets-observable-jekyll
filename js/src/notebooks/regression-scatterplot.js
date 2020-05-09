// Your notebook, compiled as an ES module.
import notebook from "./code/e172324391f49fb8@105.js";

// config: {
//   data: [{ x: 5.67, y: 10.45}],
//   labelX: "diabetes",
//   labelY: "obese"
// }

window.regression_scatterplot = function(config) {
  return configure_notebook(notebook, config, "chart");
};
