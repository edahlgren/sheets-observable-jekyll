// https://observablehq.com/d/aca446db1cd4775e@96
import define1 from "./9821d94b209bcc62@6.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Horizontal dot strip with means`
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
  // data: [{key: "South", values: [0.4, 0.6, 0.3]}, ...]
  data: [],
  colorPoints: "rgba(99, 162, 230, 0.2)",
  colorMeans: "#ff9178"  
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","makeScaleX","makeScaleY","makeAxisX","makeAxisY","plotPoints","plotMeans"], function(setDefaults,config,defaults,d3,getDimensions,makeScaleX,makeScaleY,makeAxisX,makeAxisY,plotPoints,plotMeans){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) return d3.create("svg");
  
  var { margin, w, h, leftPadding, fw, fh } = getDimensions();
  var scaleX = makeScaleX(w),
      scaleY = makeScaleY(h);
  
  var svg = d3.create("svg")
      .attr("viewBox", [0, 0, fw, fh])
      .attr("color", "rgba(5, 5, 38, 0.5)");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left + leftPadding},${margin.top})`)
    .call(makeAxisX(scaleX, h));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(makeAxisY(scaleY, w + leftPadding));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left + leftPadding},${margin.top})`)
    .call(plotPoints(scaleX, scaleY));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left + leftPadding},${margin.top})`)
    .call(plotMeans(scaleX, scaleY));
  
  return svg;
}
)});
  main.variable(observer("plotMeans")).define("plotMeans", ["config","d3"], function(config,d3){return(
function(scaleX, scaleY) {
  var means = config.data.map(function(d) {
    return {key: d.key, mean: d3.mean(d.values)};
  });
  return function(g) {
    return g.attr("fill", "none")
      .attr("pointer-events", "all")
      .selectAll("circle")
      .data(means)
      .join("circle")
      .attr("r", 5)
      .attr("stroke", "none")
      .attr("fill", config.colorMeans)
      .attr("cx", d => scaleX(d.mean))
      .attr("cy", d => scaleY(d.key));
  }
}
)});
  main.variable(observer("plotPoints")).define("plotPoints", ["config"], function(config){return(
function(scaleX, scaleY) {
  return function(g) {
    config.data.forEach(function(d) {
      g.append("g")
        .attr("fill", "none")
        .attr("pointer-events", "all")
        .selectAll("circle")
        .data(d.values)
        .join("circle")
        .attr("r", 4.5)
        .attr("stroke", "none")
        .attr("fill", config.colorPoints)
        .attr("cx", d0 => scaleX(d0))
        .attr("cy", scaleY(d.key)); 
    });
    return g;
  }
}
)});
  main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function(d3){return(
function(scaleY, w) {
  return function(g) {
    return g.call(d3.axisLeft(scaleY))
      .call(g => g.selectAll("text")
        .attr("font-size", 13))
      .call(function(g) {
        g.selectAll(".tick line").clone()
          .attr("stroke-opacity", 0.1)
          .attr("x2", w)
      })
      .call(g => g.selectAll(".domain").remove());
  }
}
)});
  main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function(d3){return(
function(scaleX, h) {
  return function(g) {
    return g.call(d3.axisTop(scaleX))
      .call(g => g.selectAll("text")
        .attr("font-size", 13))
      .call(function(g) {
        g.selectAll(".tick line").clone()
          .attr("stroke-opacity", 0.1)
          .attr("y2", h)
      })
      .call(g => g.selectAll(".domain").remove());
  }
}
)});
  main.variable(observer("makeScaleY")).define("makeScaleY", ["d3","config"], function(d3,config){return(
function(h) {
  return d3.scalePoint()
    .domain(config.data.map(d => d.key))
    .rangeRound([0, h])
    .padding(1);
}
)});
  main.variable(observer("makeScaleX")).define("makeScaleX", ["config","d3"], function(config,d3){return(
function(w) {
  var flat = config.data.map(d => d.values).flat();
  return d3.scaleLinear()
    .domain(d3.extent(flat))
    .rangeRound([0, w]);
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", ["config"], function(config){return(
function() {
  var margin = {top: 20, right: 10, bottom: 10, left: 120};
  var w = 800,
      h = 30 * config.data.length,
      leftpad = 30;
  
  return {
    margin: margin, 
    w: w, h: h,
    leftPadding: leftpad,
    fw: margin.left + leftpad + w + margin.right, 
    fh: margin.top + h + margin.bottom
  };
}
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
