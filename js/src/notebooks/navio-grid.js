// Your notebook, compiled as an ES module.
import notebook from "./code/d602542817405a3a@109.js";

// config: {
//   data: [ {region: "Midwest", kidney_disease: 2.4, diabetes: 8.2}, ...]
//   columns: [ {key: "region", type: "category", primary: true},
//     {key: "diabetes", type: "numerical", secondary: true},
//     {key: "kidney_disease", type: "numerical"} ]
//   sortPrimary: true
// }

window.navio_grid = function(config) {
  return configure_notebook(notebook, config, "chart");
};
