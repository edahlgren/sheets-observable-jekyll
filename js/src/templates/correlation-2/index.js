import lib from "../lib/index.js";
import template from "./template.html";
import scatterplot from "../../visualizations/scatterplot-1/index.js";

export default {
  canUse: function(fields) {
    var fs = fields.numericalRandom;
    return (fs && fs.length > 1);
  },
  visualization: scatterplot,
  variations: function(fields) {
    var fs = fields.numericalRandom;
    return fs.slice(1).map(function(other) {
      return { x: fs[0], y: other };
    });
  },
  compile: function(svgRoots) {
    // TODO: add data-correlation property to svg to
    // showcase the variables with the highest correlation
    var root = lib.parseTemplate(template);
    var primary = root.getElementById("primary-scatterplot");
    var secondaries = root.getElementsByClassName("secondary-scatterplot");

    primary.appendChild(svgRoots[0]);
    svgRoots.slice(1).forEach(function(svgRoot, i) {
      secondaries[i].appendChild(svgRoot);
      secondaries[i].classList.remove("hide");
    });
    return root;
  }
}
