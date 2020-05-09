import lib from "../lib/index.js";
import template from "./template.html";
import lib_template from "../../templates/lib/index.js";

import correlation from "../../sections/correlation/index.js";
import trendsByValue from "../../sections/trends-by-value/index.js";
import trendsOverTime from "../../sections/trends-over-time/index.js";
import summary from "../../sections/summary/index.js";

const sections = [
  correlation,
  trendsByValue,
  trendsOverTime,
  summary
];

export default {
  canUse: function(fields) {
    // Test only
    return correlation.canUse(fields);
    /**
    var canUseTrend = lib.canUseOne(fields, [
      trendsByValue,
      trendsOverTime
    ]);
    return (correlation.canUse(fields) && canUseTrend);
    **/
  },
  computeScore: function(fields) {
    return 1;
  },
  sections: function(fields) {
    // Test only
    return [correlation];
    /**
    return lib.filterForUsable(fields, sections);
    **/
  },
  compile: function(sectionRoots) {
    var root = lib_template.parseTemplate(template);
    return lib.insertAll(root, sectionRoots);
  }
}
