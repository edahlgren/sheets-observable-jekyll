// Your notebook, compiled as an ES module.
import notebook from "./code/ff91f6565903a1fd@139.js";

// config: {
//   data: {AK: 7.4, AL: 12.64, AR: 11.7, AZ: 10.18, CA: 9.84, ...}
//   colorScale1: {
//     start: -1.0,
//     end: 0.0,
//     startColor: "rgb(169, 220, 252)",
//     endColor: "rgb(246, 250, 255)"
//   },
//  colorScale2: {
//    start: 0.0,
//    end: 1.0,
//    startColor: "rgb(255, 244, 239)",
//    endColor: "rgb(252, 195, 169)"
//   }
// }

window.us_regions_diff = function(config) {
  return configure_notebook(notebook, config, "chart");
};
