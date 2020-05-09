import regressionScatterplot from "./regression-scatterplot.js";
import correlationMatrix from "./correlation-matrix.js";
import triParallel from "./tri-parallel.js";
import navioGrid from "./navio-grid.js";
import horizontalDotStrip from "./hdot-strip.js";
import verticalDotStrip from "./vdot-strip.js";
import usRegionsValue from "./us-regions-value.js";
import usRegionsDiff from "./us-regions-diff.js";
import sparklinesList from "./sparklines-list.js";
import lollipopDiffs from "./lollipop-diffs.js";
import rankedPercents from "./ranked-percents.js";

export default {
  visualizations: {
    "ranked-percents": {
      api: rankedPercents
    },
    "regression-scatterplot": {
      api: regressionScatterplot
    },
    "correlation-matrix": {
      api: correlationMatrix
    },
    "tri-parallel": {
      api: triParallel
    },
    "navio-grid": {
      api: navioGrid
    },
    "hdot-strip": {
      api: horizontalDotStrip
    },
    "us-regions-value": {
      api: usRegionsValue
    },
    "vdot-strip": {
      api: verticalDotStrip
    },
    "sparklines-list": {
      api: sparklinesList
    },
    "lollipop-diffs": {
      api: lollipopDiffs
    },
    "us-regions-diff": {
      api: usRegionsDiff
    }
  }
};
