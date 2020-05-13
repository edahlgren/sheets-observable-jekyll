// https://observablehq.com/d/bba258fd25367b55@16
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Regression code`
)});
  main.variable(observer("makeRegression")).define("makeRegression", ["r","d3","correlation"], function(r,d3,correlation){return(
function(points, xScale, yScale) {
  var loess = r.regressionLoess()
    .x(d => d.x)
    .y(d => d.y)
    .bandwidth(0.9);
  
  var lineLoess = d3.line()
    .x(d => xScale(d[0]))
    .y(d => yScale(d[1]));
  
  if (points.length == 0) {
    return { points: [], lineGenerator: lineLoess, correlated: 0 };
  }
  
  var ps = loess(points);
  return {
    points: ps,
    lineGenerator: lineLoess,
    correlated: correlation(points, ps)
  };
}
)});
  main.variable(observer("correlation")).define("correlation", ["d3"], function(d3){return(
function(ds, rpoints) {
  var regressFirst = rpoints[0];
  var regressLast = rpoints[rpoints.length - 1];
  var slope = (regressLast[1] - regressFirst[1]) / (regressLast[0] - regressFirst[0]);
  
  var xEnds = d3.extent(ds, d => d.x);
  var yEnds = d3.extent(ds, d => d.y);
  var perfectSlope = (yEnds[1] - yEnds[0]) / (xEnds[1] - xEnds[0]);
  
  var positive = [perfectSlope/2, perfectSlope*2];
  var negative = [-positive[0], -positive[1]];
  
  if (slope >= positive[0] &&
      slope <= positive[1]) {
    return 1;
  }
  
  if (slope >= negative[1] &&
      slope <= negative[0]) {
    return -1;
  }  
  
  return 0;
}
)});
  main.variable(observer("r")).define("r", ["require"], function(require){return(
require.alias({
  "d3-regression": "d3-regression@1"
})("d3-regression")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
