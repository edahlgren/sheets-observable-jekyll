// Your notebook, compiled as an ES module.
import notebook from "./code/199fed7cb7513f43@177.js";

// config: {
//   data: [{key: "South", values: [0.5, 0.7, 0.4]}, ...]
//   colorIncrease: "rgb(244, 82, 59)",
//   colorDecrease: "rgb(86, 159, 206)"
// }

window.sparklines_difflist = function(config) {
  console.log("sparklines_difflist", config);
  return configure_notebook(notebook, config, "chart");
};
