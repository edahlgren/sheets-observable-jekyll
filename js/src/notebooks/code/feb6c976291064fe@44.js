// https://observablehq.com/d/feb6c976291064fe@44
import define1 from "./9821d94b209bcc62@6.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Tri-parallel coordinates`
)});
  main.variable(observer("chart")).define("chart", ["make"], function(make)
{
  const svg = make(); 
  return svg.node();
}
);
  main.variable(observer("config")).define("config", function(){return(
{}
)});
  main.variable(observer("defaults")).define("defaults", function(){return(
{
  // data: [{top 55.3, middle: 66.7, bottom: 22.3}, ...]
  data: [],
  // top: "overweight"
  topLabel: "",
  // middle: "diabetes"
  middleLabel: "",
  // bottom: "healthy_weight"
  bottomLabel: ""
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","makeXScales","makeScaleY","makeScaleColor","drawLines","placeLabels"], function(setDefaults,config,defaults,d3,getDimensions,makeXScales,makeScaleY,makeScaleColor,drawLines,placeLabels){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) return d3.create("svg");
  
  var { margin, w, h, leftPadding, fw, fh } = getDimensions();
  var xScales = makeXScales(w),
      scaleY = makeScaleY(h),
      scaleColor = makeScaleColor(xScales.middle);
  
  var svg = d3.create("svg")
      .attr("viewBox", [0, 0, fw, fh])
      .attr("color", "rgba(5, 5, 38, 0.5)");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(drawLines(xScales, scaleY, scaleColor));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(placeLabels(xScales, scaleY));
  
  return svg;
}
)});
  main.variable(observer("placeLabels")).define("placeLabels", ["config","d3"], function(config,d3){return(
function(xScales, scaleY) {
  return function(g) {
    return g.selectAll("g")
      .data([
        { section: "top", key: config.topLabel },
        { section: "middle", key: config.middleLabel },
        { section: "bottom", key: config.bottomLabel }
      ])
      .join("g")
      .attr("transform", d => `translate(0,${scaleY(d.section)})`)
      .each(function(d, i) { 
        var axisFunc = (i == 0 ? d3.axisTop : d3.axisBottom);
        d3.select(this).call(axisFunc(xScales[d.section]));
      })
      .call(g => g.append("text")
        .attr("x", 10)
        .attr("y", d => (d.section === "top" ? 13 : -6))
        .attr("text-anchor", "start")
        .attr("fill", "currentColor")
        .text(d => d.key))  
      .call(g => g.selectAll("text")
        .clone(true).lower()
        .attr("fill", "none")
        .attr("stroke-width", 5)
        .attr("stroke-linejoin", "round")
        .attr("stroke", "white"));
  }
}
)});
  main.variable(observer("drawLines")).define("drawLines", ["config","d3"], function(config,d3){return(
function(xScales, scaleY, scaleColor) {
  return function(g) {
    return g.attr("fill", "none")
      .attr("stroke-width", 1.5)
      .selectAll("path")
      .data(config.data)
      .join("path")
      .attr("stroke", d => scaleColor(d.middle))
      .attr("stroke-opacity", 0.3)
      .attr("d", function(d) {
        var set = [
          ["top", d.top], 
          ["middle", d.middle],
          ["bottom", d.bottom]
        ];
        var lineGen = d3.line()
          .x(function(p) {
            var scaleX = xScales[p[0]];
            return scaleX(p[1]);
          })
          .y(function(p) {
            return scaleY(p[0]);
          });
        return lineGen(set);
      });
  }
}
)});
  main.variable(observer("makeScaleColor")).define("makeScaleColor", ["d3"], function(d3){return(
function(middleScale) {
  return d3.scaleSequential(
    middleScale.domain().reverse(), 
    d3.interpolateRdBu);
}
)});
  main.variable(observer("makeScaleY")).define("makeScaleY", ["d3"], function(d3){return(
function(h) {
  return d3.scalePoint()
    .domain(["top", "middle", "bottom"])
    .range([0, h]);
}
)});
  main.variable(observer("makeXScales")).define("makeXScales", ["d3","config"], function(d3,config){return(
function(w) {
  var scale = function(ds) {
    return d3.scaleLinear()
      .domain(d3.extent(ds)).nice()
      .range([0, w]);
  }
  
  var m = {};
  m["top"] = scale(config.data.map(d => d.top));
  m["middle"] = scale(config.data.map(d => d.middle));
  m["bottom"] = scale(config.data.map(d => d.bottom));
  return m;
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", function(){return(
function() {
  var margin = {top: 20, right: 10, bottom: 20, left: 10};
  var w = 800,
      h = 240;
  
  return {
    margin: margin, 
    w: w, h: h,
    fw: margin.left + w + margin.right, 
    fh: margin.top + h + margin.bottom
  };
}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
