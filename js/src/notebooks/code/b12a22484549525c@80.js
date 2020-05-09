// https://observablehq.com/d/b12a22484549525c@80
import define1 from "./9821d94b209bcc62@6.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Lollipop difference map`
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
  // data: [{key: "AK", group: "West", start: 0.4, end: 0.5}]
  data: [],
  colorIncrease: "rgba(232, 108, 9, 0.8)",
  colorDecrease: "rgba(39, 181, 234, 0.8)"
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","mapData","makeLabels","makeScaleX","makeScaleY","makeAxisX","makeAxisY"], function(setDefaults,config,defaults,d3,getDimensions,mapData,makeLabels,makeScaleX,makeScaleY,makeAxisX,makeAxisY){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) {
    return d3.create("svg");
  }
  
  var { margin, w, h, fw, fh } = getDimensions();
  var mapped = mapData(),
      labels = makeLabels(),
      scaleX = makeScaleX(labels, w),
      scaleY = makeScaleY(h);
  
  var svg = d3.create("svg")
      .attr("viewBox", [0, 0, fw, fh])
      .attr("color", "rgba(5, 5, 38, 0.5)");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top + h})`)
    .call(makeAxisX(scaleX, labels));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(makeAxisY(scaleY, w));
  
  var g = svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);
  
  labels.forEach(function(label, i) {
    if (label.startsWith("label-")) {
      var next = labels[i+1];
      g.append("text")
        .attr("font-family", "sans-serif")
        .attr("font-size", 11)
        .attr("fill", "currentColor")
        .attr("x", scaleX(next) - 5)
        .attr("y", -5)
        .text(label.slice(label.indexOf('-') + 1));
      
      if (i > 0) {
        g.append("line")
          .attr("stroke", "currentColor")
          .attr("stroke-opacity", 0.5)
          .attr("fill", "none")
          .attr("x1", scaleX(label))
          .attr("y1", 0)
          .attr("x2", scaleX(label))
          .attr("y2", h);
      }
      return;
    }
    
    var diff_group = g.append("g");
    var e = mapped[label],
        diff = e.end - e.start;
    
    if (diff != 0) {
      diff_group.append("path")
        .attr("stroke", function() {
          if (diff == 0) return "#999999";
          if (diff > 0) return config.colorIncrease;
          return config.colorDecrease;
        })
        .attr("stroke-width", 1)
        .attr("fill", "none")
        .attr("d", function() { 
           var lineGen = d3.line()
             .x(scaleX(label))
             .y(p => scaleY(p));
           return lineGen([e.start, e.end]);
        });
    }
    
    diff_group.append("circle")
      .attr("r", 2.5)
      .attr("stroke", "none")
      .attr("fill", function() {
        if (diff == 0) return "#999999";
        if (diff > 0) return config.colorIncrease;
        return config.colorDecrease;
      })
      .attr("cx", scaleX(label))
      .attr("cy", scaleY(e.end));    
  });
  
  return svg;
}
)});
  main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function(d3){return(
function(scaleY, w) {
  return function(g) {
    return g.call(d3.axisLeft(scaleY))
      .call(g => g.selectAll("text").attr("font-size", 11))
      .call(function(g) {
        g.selectAll(".tick line").clone()
          .attr("stroke-opacity", 0.1)
          .attr("x2", w + 40)
      })
      .call(g => g.selectAll(".domain").remove());
  }
}
)});
  main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function(d3){return(
function(scaleX, labels) {
  return function(g) {
    return g.call(d3.axisBottom(scaleX).ticks(labels.length))
      .call(g => g.selectAll(".domain").remove())
      .call(g => g.selectAll(".tick")
        .filter(function(d) {
          return d.startsWith("label-");
        }).remove())
      .call(g => g.selectAll("text")
        .attr("font-size", 10)
        .style("text-anchor", "start")
        .attr("dx", "1em")
        .attr("dy", 0)
        .attr("transform", function(d) {
          return "rotate(65)" 
        }));
  }
}
)});
  main.variable(observer("makeScaleY")).define("makeScaleY", ["config","d3"], function(config,d3){return(
function(h) {
  var values = Object.values(config.data),
      starts = values.map(d => d.start),
      ends = values.map(d => d.end),
      extent = d3.extent(starts.concat(ends));
  
  return d3.scaleLinear()
    .domain(extent).nice()
    .range([h, 0]);
}
)});
  main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function(d3){return(
function(labels, w) {
  return d3.scalePoint()
    .domain(labels)
    .range([0, w]);
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", ["config"], function(config){return(
function() {
  var margin = {top: 50, right: 20, bottom: 50, left: 50};
  var w = 15 * Object.keys(config.data).length,
      h = 150;
  
  return {
    margin: margin, 
    w: w, h: h,
    fw: margin.left + w + margin.right, 
    fh: margin.top + h + margin.bottom
  };
}
)});
  main.variable(observer()).define(["mapData"], function(mapData){return(
mapData()
)});
  main.variable(observer("mapData")).define("mapData", ["config"], function(config){return(
function() {
  var m = {};
  config.data.forEach(function(d) {
    m[d.key] = d;
  });
  return m;
}
)});
  main.variable(observer("makeLabels")).define("makeLabels", ["arr","config"], function(arr,config){return(
function() {
  var byGroups = arr.group(config.data, d => d.group);
  var keys = Array.from(byGroups.keys());
  
  var out = [];
  keys.forEach(function(k) {
    var values = byGroups.get(k);
    out.push("label-" + k);
    out = out.concat(values.map(d => d.key));
  });
  return out;
}
)});
  main.variable(observer("arr")).define("arr", ["require"], function(require){return(
require("d3-array@^2.2")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
