// Your notebook, compiled as an ES module.
import notebook from "./code/feb6c976291064fe@44.js";

// config: {
//   data: [{top 55.3, middle: 66.7, bottom: 22.3}, ...]
//   top: "overweight"
//   middle: "diabetes"
//   bottom: "healthy_weight"
// }

window.tri_parallel_coordinates = function(config) {
  return configure_notebook(notebook, config, "chart");
};
