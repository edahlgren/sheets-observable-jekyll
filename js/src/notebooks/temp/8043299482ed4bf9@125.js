// https://observablehq.com/d/8043299482ed4bf9@125
import define1 from "./9821d94b209bcc62@6.js";
import define2 from "./bba258fd25367b55@16.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Vertical dot strip with regression band`
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
  // data: [{ key: 2011, values: [value1, value2]}, ...]
  data: [],
  colorRegression: "rgba(99, 162, 230, 0.1)",
  colorPoints: "rgba(99, 162, 230, 0.2)"
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","flatten","makeScaleX","makeScaleY","makeRegression","makeAxisX","makeAxisY","plotPoints","makeRegressionBand"], function(setDefaults,config,defaults,d3,getDimensions,flatten,makeScaleX,makeScaleY,makeRegression,makeAxisX,makeAxisY,plotPoints,makeRegressionBand){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) {
    return d3.create("svg");
  }
  
  var categories = config.data.map(d => d.key); 
  var { margin, w, h, fw, fh } = getDimensions(categories);
  
  var flat = flatten(config.data);
  
  var scaleX = makeScaleX(categories, w - 60),
      scaleY = makeScaleY(flat.map(d => d.y), h),
      regression = makeRegression(flat, scaleX, scaleY); 
  
  var svg = d3.create("svg")
    .attr("viewBox", [0, 0, fw, fh])
    .attr("color", "rgba(5, 5, 38, 0.5)"); 
  
  var axisX = svg.append("g")
    .attr("transform", `translate(${margin.left + 30},${fh - margin.bottom + 10})`);
  makeAxisX(axisX, scaleX);
  
  var axisY = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  makeAxisY(axisY, scaleY, w);
  
  var pointsLayer = svg.append("g")
    .attr("transform", `translate(${margin.left + 30},${margin.top})`);
  plotPoints(pointsLayer, flat, scaleX, scaleY, config.colorPoints);
  
  var regressionLayer = svg.append("g")
    .attr("transform", `translate(${margin.left + 30},${margin.top})`);
  makeRegressionBand(regressionLayer, regression, config.colorRegression);  
  
  return svg;
}
)});
  main.variable(observer("plotPoints")).define("plotPoints", function(){return(
function(g, points, scaleX, scaleY, colorPoints) {
  g.attr("fill", "none")
    .attr("pointer-events", "all")
    .selectAll("circle")
    .data(points)
    .join("circle")
    .attr("r", 4.5)
    .attr("stroke", "none")
    .attr("fill", colorPoints)
    .attr("cx", d => scaleX(d.x))
    .attr("cy", d => scaleY(d.y));
}
)});
  main.variable(observer("makeRegressionBand")).define("makeRegressionBand", function(){return(
function(g, regression, colorRegression) {
  g.append("path")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .attr("stroke", colorRegression)
    .attr("stroke-width", 30)
    .datum(regression.points)
    .attr("d", regression.lineGenerator);
}
)});
  main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function(d3){return(
function(g, scaleY, w) {
  g.call(d3.axisLeft(scaleY))
    .call(g => g.selectAll(".domain").remove())
    .call(g => g.selectAll("text")
      .attr("font-size", 13))
    .call(function(g) {
      g.selectAll(".tick line").clone()
        .attr("stroke-opacity", 0.1)
        .attr("x2", w)
    })
}
)});
  main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function(d3){return(
function(g, scaleX) {
  g.call(d3.axisBottom(scaleX))
    .call(g => g.selectAll(".domain").remove())
    .call(g => g.selectAll("text")
      .attr("font-size", 13));
}
)});
  main.variable(observer("makeScaleY")).define("makeScaleY", ["d3"], function(d3){return(
function(values, h) {
  var extent = d3.extent(values);
  return d3.scaleLinear()
    .domain([extent[1], extent[0]]).nice()
    .range([0, h]);
}
)});
  main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function(d3){return(
function(categories, w) {
  return d3.scalePoint()
    .domain(categories)
    .range([0, w]);
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", function(){return(
function(categories) {
  var margin = {top: 20, right: 20, bottom: 50, left: 50},
      w = 50 * categories.length,
      h = 400;
  
  return {
    margin: margin, w: w, h: h,
    fw: margin.left + w + margin.right,
    fh: margin.top + h + margin.bottom
  };
}
)});
  main.variable(observer("flatten")).define("flatten", function(){return(
function(data) {
  var out = [];
  data.forEach(function(category) {
    category.values.forEach(function(value) {
      out.push({x: category.key, y: value});
    });
  });
  return out;
}
)});
  const child2 = runtime.module(define2);
  main.import("makeRegression", child2);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
