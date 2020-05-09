// Your notebook, compiled as an ES module.
import notebook from "./code/671762263456aced@190.js";

// config: {
//   data: [{ diabetes: 9.45, obese: 0.56, overweight: 34.5}, ...],
//   columns: ["diabetes", "obese", "overweight"]
// }

window.correlation_matrix = function(config) {
  return configure_notebook(notebook, config, "chart");
};
