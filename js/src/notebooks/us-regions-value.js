// Your notebook, compiled as an ES module.
import notebook from "./code/2002bd989603ac6a@134.js";

// config: {
//   data: {AK: 7.4, AL: 12.64, AR: 11.7, AZ: 10.18, CA: 9.84, ...}
//   colorStart: "rgb(227, 238, 249)",
//   colorMiddle: "rgb(165, 204, 228)",
//   colorEnd: "rgb(75, 151, 201)"
// }

window.us_regions_value = function(config) {
  return configure_notebook(notebook, config, "chart");
};
