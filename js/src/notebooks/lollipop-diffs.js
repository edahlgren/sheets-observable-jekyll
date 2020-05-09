// Your notebook, compiled as an ES module.
import notebook from "./code/b12a22484549525c@80.js";

// config: {
//   data: [{key: "AK", group: "West", start: 0.4, end: 0.5}]
//   colorIncrease: "rgba(232, 108, 9, 0.8)",
//   colorDecrease: "rgba(39, 181, 234, 0.8)"
// }

window.lollipop_diffmap = function(config) {
  return configure_notebook(notebook, config, "chart");
};
