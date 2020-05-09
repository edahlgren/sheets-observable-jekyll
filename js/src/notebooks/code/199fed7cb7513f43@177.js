// https://observablehq.com/d/199fed7cb7513f43@177
import define1 from "./9821d94b209bcc62@6.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Sparklines with diffs`
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
  // data: [{key: "South", values: [0.5, 0.7, 0.4]}, ...]
  data: [],
  colorIncrease: "rgb(244, 82, 59)",
  colorDecrease: "rgb(86, 159, 206)"
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","makeLineScaleX","makeScalePlotY","makeSmallLineScaleY","makeSparkline","makeValueLabel","makeDiffLabel","makeLineLabel"], function(setDefaults,config,defaults,d3,getDimensions,makeLineScaleX,makeScalePlotY,makeSmallLineScaleY,makeSparkline,makeValueLabel,makeDiffLabel,makeLineLabel){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) {
    return d3.create("svg");
  }
  
  var { margin, w, h, lineWidth, lineHeight, fw, fh } = getDimensions();
  var scaleLineX = makeLineScaleX(lineWidth),
      scalePlotY = makeScalePlotY(h);
  
  var svg = d3.create("svg")
      .attr("viewBox", [0, 0, fw, fh])
      .attr("color", "rgba(5, 5, 38, 0.5)");
  
  config.data.forEach(function(d) {
    var smallScaleY = makeSmallLineScaleY(d.values, lineHeight);
    
    var g = svg.append("g")
      .attr("transform", `translate(0,${margin.top + scalePlotY(d.key)})`);
    
    g.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(makeSparkline(scaleLineX, lineHeight, d.values)); 
    
    g.append("g")
      .attr("transform", `translate(${margin.left - 10},0)`)
      .call(makeValueLabel(smallScaleY, "end", d.values[0]));
    
    g.append("g")
      .attr("transform", `translate(${margin.left + lineWidth + 10},0)`)
      .call(makeValueLabel(smallScaleY, "start", d.values[d.values.length-1]));
    
    g.append("g")
      .attr("transform", `translate(${margin.left + lineWidth + 62},0)`)
      .call(makeDiffLabel(smallScaleY, lineHeight, d.values));
    
    g.append("g")
      .attr("transform", `translate(${margin.left + lineWidth + 72},0)`)
      .call(makeLineLabel(lineHeight, d.key));
  });
  
  return svg;
}
)});
  main.variable(observer("makeLineLabel")).define("makeLineLabel", function(){return(
function(lineHeight, key) {
  return function(g) {
    return g.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 11)
      .attr("text-anchor", "start")
      .attr("fill", "currentColor")
      .attr("x", 0)
      .attr("y", 2 + lineHeight - 1)
      .text(key); 
  }
}
)});
  main.variable(observer("makeDiffLabel")).define("makeDiffLabel", ["scaleColor"], function(scaleColor){return(
function(smallScaleY, lineHeight, values) {
  var diff = values[values.length - 1] - values[0];
  return function(g) {
    return g.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 11)
      .attr("text-anchor", "end")
      .attr("fill", scaleColor(diff))
      .attr("x", 0)
      .attr("y", 2 + lineHeight - 1)
      .text(function() {
        var text = diff.toFixed(1)
        if (diff > 0) text = "+" + text;
        return text;
      }); 
  }
}
)});
  main.variable(observer("makeValueLabel")).define("makeValueLabel", function(){return(
function(smallScaleY, orientation, value) {
  return function(g) {
    return g.append("text")
      .attr("font-family", "sans-serif")
      .attr("font-size", 9)
      .attr("text-anchor", orientation)
      .attr("fill", "#000000")
      .attr("x", 0)
      .attr("y", smallScaleY(value) + 5)
      .text(value.toFixed(1)); 
  }
}
)});
  main.variable(observer("makeSparkline")).define("makeSparkline", ["makeLineScaleY","d3"], function(makeLineScaleY,d3){return(
function(scaleX, lineHeight, values) {  
  return function(g) {
    return g.append("path")
      .attr("stroke", "rgba(5, 5, 38, 0.8)")
      .attr("stroke-width", 1)
      .attr("fill", "none")
      .attr("d", function() {
         var scaleY = makeLineScaleY(values, lineHeight); 
         var lineGen = d3.line()
           .x(function(p, i) {
             return scaleX(i);
           })
           .y(function(p) {
             return scaleY(p) + 5;
           });
         return lineGen(values);
      });
  }
}
)});
  main.variable(observer("scaleColor")).define("scaleColor", ["config"], function(config){return(
function(diff) {
  if (diff == 0) return "#cccccc";  
  if (diff < 0) return config.colorDecrease;
  return config.colorIncrease;
}
)});
  main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function(d3){return(
function(scaleY) {
  return function(g) {
    return g.call(d3.axisRight(scaleY))
      .call(g => g.selectAll("text")
        .attr("font-size", 11)
        .attr("dy", "-0.2em"))
      .call(g => g.selectAll(".tick line").remove())
      .call(g => g.selectAll(".domain").remove());
  }
}
)});
  main.variable(observer("makeScalePlotY")).define("makeScalePlotY", ["d3","config"], function(d3,config){return(
function(h) {
  return d3.scaleBand()
    .domain(config.data.map(d => d.key))
    .range([0, h]);
}
)});
  main.variable(observer("makeSmallLineScaleY")).define("makeSmallLineScaleY", ["d3"], function(d3){return(
function(values, lineHeight) {
  return d3.scaleLinear()
    .domain(d3.extent(values))
    .range([lineHeight, 5]);
}
)});
  main.variable(observer("makeLineScaleY")).define("makeLineScaleY", ["d3"], function(d3){return(
function(values, lineHeight) {
  return d3.scaleLinear()
    .domain(d3.extent(values))
    .range([lineHeight, 0]);
}
)});
  main.variable(observer("makeLineScaleX")).define("makeLineScaleX", ["d3","config"], function(d3,config){return(
function(lineWidth) {
  return d3.scaleLinear()
    .domain([0, config.data[0].values.length - 1])
    .range([0, lineWidth]);
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", ["config"], function(config){return(
function() {
  var margin = {top: 10, right: 120, bottom: 20, left: 50};
  var lineHeight = 10,
      lineWidth = 12 * config.data[0].values.length,
      w = lineWidth * 2,
      h = (lineHeight + 10) * config.data.length;
  
  return {
    margin: margin, 
    lineHeight: lineHeight,
    lineWidth: lineWidth,
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
