// https://observablehq.com/d/e172324391f49fb8@105
import define1 from "./9821d94b209bcc62@6.js";
import define2 from "./bba258fd25367b55@16.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Scatterplot with loess regression`
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
  // data: [{ x: 5.67, y: 10.45}]
  data: [],
  // "diabetes"
  labelX: "",
  // "obese"
  labelY: ""
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","makeScaleX","makeScaleY","makeRegression","makeBackground","makeAxisX","makeAxisY","plotPoints","scaleColor","makeRegressionLine"], function(setDefaults,config,defaults,d3,getDimensions,makeScaleX,makeScaleY,makeRegression,makeBackground,makeAxisX,makeAxisY,plotPoints,scaleColor,makeRegressionLine){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) {
    return d3.create("svg");
  }
  
  var { margin, w, h, fw, fh } = getDimensions();
  
  var scaleX = makeScaleX(config.data, w),
      scaleY = makeScaleY(config.data, h),
      regression = makeRegression(config.data, scaleX, scaleY);
  
  var svg = d3.create("svg")
    .attr("viewBox", [0, 0, fw, fh])
    .attr("color", "rgba(5, 5, 38, 0.5)");
  
  var backgroundLayer = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top - 15})`);
  makeBackground(backgroundLayer, w + 15, h + 15);
  
  var axisX = svg.append("g")
    .attr("transform", `translate(${margin.left},${fh - margin.bottom})`);
  makeAxisX(axisX, scaleX, w, config.labelX);
  
  var axisY = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  makeAxisY(axisY, scaleY, config.labelY);
  
  var pointsLayer = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  plotPoints(pointsLayer, config.data, regression.correlated, 
             scaleX, scaleY, scaleColor);
  
  var lineLayer = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  makeRegressionLine(lineLayer, regression, scaleColor);
  
  return svg;
}
)});
  main.variable(observer("makeRegressionLine")).define("makeRegressionLine", function(){return(
function(g, regression, scaleColor) {
  g.append("path")
    .attr("fill", "none")
    .attr("stroke", scaleColor(regression.correlated, 0.8))
    .attr("stroke-width", 2)
    .datum(regression.points)
    .attr("d", regression.lineGenerator);
}
)});
  main.variable(observer("plotPoints")).define("plotPoints", function(){return(
function(g, points, correlated, scaleX, scaleY, scaleColor) {
  g.selectAll("cirlce")
    .data(points)
    .join("circle")
    .attr("r", 3)
    .attr("cx", d => scaleX(d.x))
    .attr("cy", d => scaleY(d.y))
    .attr("stroke", "none")
    .attr("fill", scaleColor(correlated, 0.4));
}
)});
  main.variable(observer("makeBackground")).define("makeBackground", function(){return(
function(g, w, h) {
  g.append("rect")
    .attr("fill", "#F7FBFB")
    .attr("x", 0)
    .attr("y", 0)
    .attr("width", w)
    .attr("height", h);
}
)});
  main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function(d3){return(
function(g, scaleY, labelY) {
  g.call(d3.axisLeft(scaleY))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("text")
         .attr("font-size", 12))
    .call(g => g.select(".tick:last-of-type text").clone()
        .attr("x", 8)
        .attr("fill", "rgba(5, 5, 38, 0.5)")
        .attr("text-anchor", "start")
        .attr("font-weight", "bold")
        .attr("font-size", 12)
        .text(labelY));
}
)});
  main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function(d3){return(
function(g, scaleX, endX, labelX) {
  g.call(d3.axisBottom(scaleX))
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll("text")
         .attr("font-size", 12))
    .call(g => g.append("text")
        .attr("fill", "rgba(5, 5, 38, 0.5)")
        .attr("font-weight", "bold")
        .attr("text-anchor", "end")
        .attr("font-size", 12)
        .attr("x", endX)
        .attr("y", -12)
        .text(labelX));
}
)});
  main.variable(observer("scaleColor")).define("scaleColor", function(){return(
function(correlation, alpha) {
  if (correlation < 0) {
    return "rgba(232, 108, 9, " + alpha + ")";
  }
  if (correlation > 0) {
    return "rgba(39, 181, 234, " + alpha + ")";
  }
  return "rgba(111, 214, 214, " + alpha + ")";
}
)});
  main.variable(observer("makeScaleY")).define("makeScaleY", ["d3"], function(d3){return(
function(points, h) {
  return d3.scaleLinear()
    .domain(d3.extent(points, d => d.y)).nice()
    .range([h, 0]);
}
)});
  main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function(d3){return(
function(points, w) {
  return d3.scaleLinear()
    .domain(d3.extent(points, d => d.x)).nice()
    .range([0, w]);
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", function(){return(
function() {
  var margin = {top: 20, right: 30, bottom: 30, left: 40};
  var fw = 900,
      fh = 800;
  
  return {
    margin: margin, 
    w: fw - margin.left - margin.right, 
    h: fh - margin.top - margin.bottom,
    fw: fw, fh: fh
  };
}
)});
  const child2 = runtime.module(define2);
  main.import("makeRegression", child2);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
