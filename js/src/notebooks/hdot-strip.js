// Your notebook, compiled as an ES module.
import notebook from "./code/aca446db1cd4775e@96.js";

// config: {
//   data: [{key: "South", values: [0.4, 0.6, 0.3]}, ...],
//   colorPoints: "rgba(99, 162, 230, 0.2)",
//   colorMeans: "#ff9178"
// }

window.horizontal_dot_strip = function(config) {
  return configure_notebook(notebook, config, "chart");
};
