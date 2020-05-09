// Your notebook, compiled as an ES module.
import notebook from "./code/8043299482ed4bf9@125.js";

// config: {
//   data: [{ key: 2011, values: [value1, value2]}, ...]
//   colorRegression: "rgba(99, 162, 230, 0.1)",
//   colorPoints: "rgba(99, 162, 230, 0.2)"
// }

window.vertical_dot_strip = function(config) {
  return configure_notebook(notebook, config, "chart");
};
