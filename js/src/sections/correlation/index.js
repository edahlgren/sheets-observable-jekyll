import lib from "../lib/index.js";
import template from "./template.html";
import lib_template from "../../templates/lib/index.js";

import correlation1 from "../../templates/correlation-1/index.js";
import correlation2 from "../../templates/correlation-2/index.js";

const templates = [
  correlation1,
  correlation2
];

export default {
  canUse: function(fields) {
    return lib.canUseAny(fields, templates);
  },
  templates: function(fields) {
    return lib.filterForUsable(fields, templates);
  },
  compile: function(templateRoots) {
    var root = lib_template.parseTemplate(template);
    return lib.insertAll(root, templateRoots);
  },
  name: "Correlation",
  shortDescription: "How one column predicts another"
}
