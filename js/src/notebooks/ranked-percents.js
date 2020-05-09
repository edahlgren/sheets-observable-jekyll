// Your notebook, compiled as an ES module.
import notebook from "./code/e50d4c0fac205b0e@54.js";

// config: {
//   data: [ {key: "overweight", percent: 64.09333333333336}, ...]
//   colorBars: "#cee9f2"
// }

window.ranked_percents = function(config) {
  return configure_notebook(notebook, config, "chart");
};
