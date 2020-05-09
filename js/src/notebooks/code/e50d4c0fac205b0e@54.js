// https://observablehq.com/d/e50d4c0fac205b0e@54
import define1 from "./9821d94b209bcc62@6.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Ranked percents`
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
  // data: [ {key: "overweight", percent: 64.09333333333336}, ...]
  data: [],
  colorBars: "#cee9f2"
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","makeScaleX","makeScaleY","makeAxisY","drawBars"], function(setDefaults,config,defaults,d3,getDimensions,makeScaleX,makeScaleY,makeAxisY,drawBars){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) {
    return d3.create("svg");
  }
  
  var { margin, w, h, boxH, fw, fh } = getDimensions();
  var scaleX = makeScaleX(w),
      scaleY = makeScaleY(h);
  
  var svg = d3.create("svg")
      .attr("viewBox", [0, 0, fw, fh])
      .attr("color", "rgba(5, 5, 38, 0.5)");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(makeAxisY(scaleY));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`)
    .call(drawBars(scaleX, scaleY, w, boxH));
  
  return svg;
}
)});
  main.variable(observer("drawBars")).define("drawBars", ["config"], function(config){return(
function(scaleX, scaleY, w, boxH) {
  return function(g) {
    config.data.forEach(function(d, i) {
      g.append("rect")
        .attr("stroke", "none")
        .attr("fill", "#fafafa")
        .attr("x", 0)
        .attr("y", scaleY(d.key))
        .attr("fill", "#fafafa")
        .attr("width", w)
        .attr("height", boxH);

      g.append("rect")
        .attr("stroke", "none")
        .attr("fill", config.colorBars)
        .attr("x", 0)
        .attr("y", scaleY(d.key))
        .attr("width", scaleX(d.percent))
        .attr("height", boxH);

      g.append("text")
        .attr("x", scaleX(d.percent) + 10)
        .attr("y", scaleY(d.key) + boxH/2 + 5)
        .attr("fill", "rgba(5, 5, 38, 0.4)")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .text(d.percent.toFixed(2) + "%");
    });
    return g;
  }
}
)});
  main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function(d3){return(
function(scaleY) {
  return function(g) {
    return g.call(d3.axisLeft(scaleY))
      .call(g => g.selectAll("text").attr("font-size", 13))
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".domain").remove());
  }
}
)});
  main.variable(observer("makeScaleY")).define("makeScaleY", ["d3","config"], function(d3,config){return(
function(h) {
  return d3.scaleBand()
    .domain(config.data.map(d => d.key))
    .range([0, h]);
}
)});
  main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function(d3){return(
function(w) {
  return d3.scaleLinear()
    .domain([0.0, 100.0])
    .range([0, w]);
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", ["config"], function(config){return(
function() {
  var margin = {top: 25, bottom: 15, left: 150, right: 25};
  var w = 300,
      boxH = 28,
      h = 30 * config.data.length;
  
  return {
    margin: margin, 
    w: w, h: h, boxH: boxH,
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
