import lib from "../lib/index.js";
import template from "./template.html";
import correlationMatrix from "../../visualizations/correlation-matrix-1/index.js";

export default {
  canUse: function(fields) {
    var fs = fields.numericalRandom;
    return (fs && fs.length > 1);
  },
  visualization: correlationMatrix,
  variations: function(fields) {
    var fs = fields.numericalRandom;
    return [{columns: fs}];
  },
  compile: function(svgRoots) {
    var root = lib.parseTemplate(template);
    var matrix = root.getElementById("matrix");
    matrix.appendChild(svgRoots[0]);
    return root;
  }
}
