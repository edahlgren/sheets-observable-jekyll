// https://observablehq.com/d/671762263456aced@190
import define1 from "./9821d94b209bcc62@6.js";
import define2 from "./3f2a225750ecdcdd@60.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Half correlation matrix`
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
  // {kidney_disease: 3.5, pulmonary_disease: 5.3, diabetes: 9.5, ...}
  data: [],
  // ["kidney_disease", "pulmonary_disease", "diabetes", ...]
  columns: [],
  // 65
  binSize: 65
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","correlationMatrix","halfMatrix","makeScaleX","makeAxisX","makeAxisY","makeBoxes","scaleColor","annotateBoxes"], function(setDefaults,config,defaults,d3,getDimensions,correlationMatrix,halfMatrix,makeScaleX,makeAxisX,makeAxisY,makeBoxes,scaleColor,annotateBoxes){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) {
    return d3.create("svg");
  }
  
  var { margin, w, h, fw, fh } = getDimensions();

  var correlations = correlationMatrix(config.data, config.columns),
      matrix = halfMatrix(config.columns, correlations),
      scaleX = makeScaleX(config.columns, w),
      scaleY = makeScaleX(config.columns, h);

  var svg = d3.create("svg")
    .attr("viewBox", [0, 0, fw, fh])
    .attr("color", "rgba(5, 5, 38, 0.5)");

  var axisX = svg.append("g")
    .attr("transform", `translate(${margin.left},${h})`);
  makeAxisX(axisX, scaleX);

  var axisY = svg.append("g")
    .attr("transform", `translate(${margin.left-1},0)`);
  makeAxisY(axisY, scaleY);

  var boxesLayer = svg.append("g")
    .attr("transform", `translate(${margin.left},0)`);
  makeBoxes(boxesLayer, matrix, scaleX, scaleY, scaleColor);

  var textLayer = svg.append("g")
    .attr("transform", `translate(${margin.left},0)`);
  annotateBoxes(textLayer, matrix, scaleX, scaleY);

  return svg;
}
)});
  main.variable(observer("makeBoxes")).define("makeBoxes", function(){return(
function(g, matrix, scaleX, scaleY, scaleColor) {
  g.attr("fill", "none")
    .attr("pointer-events", "all")
    .selectAll("rect")
    .data(matrix.filter(function(d) {
      return d.column_x != d.column_y;
    }))
    .join("rect")
    .attr("x", d => scaleX(d.column_x))
    .attr("y", d => scaleY(d.column_y))
    .attr("width", scaleX.bandwidth())
    .attr("height", scaleX.bandwidth())
    .attr("fill", d => scaleColor(d.correlation))
    .attr("stroke", "none");

  g.append("g")
    .attr("fill", "none")
    .attr("pointer-events", "all")
    .selectAll("rect")
    .data(matrix.filter(function(d) {
      return d.column_x == d.column_y;
    }))
    .join("rect")
    .attr("x", d => scaleX(d.column_x))
    .attr("y", d => scaleY(d.column_y))
    .attr("width", scaleX.bandwidth())
    .attr("height", scaleX.bandwidth())
    .attr("fill", "#ffffff")
    .attr("stroke", "#999999")
    .attr("stroke-width", 0.5);
}
)});
  main.variable(observer("annotateBoxes")).define("annotateBoxes", function(){return(
function(g, matrix, scaleX, scaleY) {
  g.attr("fill", "none")
    .attr("pointer-events", "all")
    .selectAll("text")
    .data(matrix)
    .join("text")
    .text(d => d.correlation.toFixed(2))
    .attr('dominant-baseline', 'middle')
    .attr('fill', d => {
      if (d.column_x == d.column_y) return "none";
      return 'rgba(0, 0, 0, 0.7)';
    })
    .attr('font-family', 'sans-serif')
    .attr('font-size', '11px')
    .attr('font-weight', 'bold')
    .attr('text-anchor', 'middle')
    .attr('transform', d => {
      var x = scaleX(d.column_x),
          y = scaleY(d.column_y);
      return `translate(${x + (scaleX.bandwidth() / 2)}, ${y + (scaleY.bandwidth() / 2)})`;
    });
}
)});
  main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function(d3){return(
function(g, scaleY) {
  g.call(d3.axisLeft(scaleY).tickPadding(8).tickSize(0))
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll("text")
    .attr("font-size", 10));
}
)});
  main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function(d3){return(
function(g, scaleX) {
  g.call(d3.axisBottom(scaleX).tickPadding(8).tickSize(0))
  .call(g => g.select(".domain").remove())
  .call(g => g.selectAll("text")
    .attr("font-size", 10)
    .style("text-anchor", "start")
    .attr("dx", "1em")
    .attr("dy", "0.6em")
    .attr("transform", function(d) {
      return "rotate(40)"
    }));
}
)});
  main.variable(observer("scaleColor")).define("scaleColor", ["d3"], function(d3){return(
function(correlation) {
  var lightReds = d3.scaleLinear()
    .domain([-1.0, 0.0])
    .range([0.35, 0.0]);

  var lightBlues = d3.scaleLinear()
    .domain([0.0, 1.0])
    .range([0.0, 0.35]);

  if (correlation >= 0) {
    return d3.interpolateBlues(lightBlues(correlation));
  }
  return d3.interpolateReds(lightReds(correlation));
}
)});
  main.variable(observer("makeScaleY")).define("makeScaleY", ["d3"], function(d3){return(
function(columns, h) {
  return d3.scaleBand()
    .domain(columns)
    .range([0, h]);
}
)});
  main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function(d3){return(
function(columns, w) {
  return d3.scaleBand()
    .domain(columns)
    .range([0, w]);
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", ["config"], function(config){return(
function() {
  var margin = {left: 100, top: 0, right: 20, bottom: 100};
  var w = config.columns.length * config.binSize,
      h = w;

  return {
    margin: margin, w: w, h: h,
    fw: margin.left + w + margin.right,
    fh: margin.top + h + margin.bottom
  };
}
)});
  main.variable(observer("halfMatrix")).define("halfMatrix", function(){return(
function(columns, matrix) {
  var indices = {};
  columns.map(function(d, i) {
    indices[d] = i;
  });

  return matrix.filter(function(d) {
    var ix = indices[d.column_x],
        iy = indices[d.column_y];
    return (ix <= iy);
  });
}
)});
  const child2 = runtime.module(define2);
  main.import("correlationMatrix", child2);
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
