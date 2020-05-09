// Your notebook, compiled as an ES module.
import notebook from "../notebooks/e380c1e518b1cc55@353.js";

// data:
// [ points: { x: 0, y: 0}, x: "X Axis", y: "Y Axis" ]

window.basic_scatterplot = function(data) {
  return render_notebook(notebook, data, "selection");
};
