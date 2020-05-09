// https://observablehq.com/d/d602542817405a3a@109
import define1 from "./9821d94b209bcc62@6.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Navio grid`
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
  // data: [ {region: "Midwest", kidney_disease: 2.4, diabetes: 8.2}, ...]
  data: [],
  // [ {key: "region", type: "category", primary: true},
  //   {key: "diabetes", type: "numerical", secondary: true},
  //   {key: "kidney_disease", type: "numerical"} ]
  columns: [],
  // Sort primary category by max secondary value
  sortPrimary: false,
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","sort","getDimensions","makeColumnScales","makeScaleX","makeScaleY","makeAxisX","drawBand","addLabels"], function(setDefaults,config,defaults,d3,sort,getDimensions,makeColumnScales,makeScaleX,makeScaleY,makeAxisX,drawBand,addLabels){return(
function() {
  setDefaults(config, defaults);
  if (config.data.length == 0) return d3.create("svg");
  
  // Sort the columns and the data
  sort();
  
  var { margin, w, h, leftPadding, fw, fh } = getDimensions();
  var colorScales = makeColumnScales(),
      scaleX = makeScaleX(w),
      scaleY = makeScaleY(h);
  
  var svg = d3.create("svg")
      .attr("viewBox", [0, 0, fw, fh])
      .attr("color", "rgba(5, 5, 38, 0.5)");
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(makeAxisX(scaleX, h));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(drawBand(scaleX, scaleY, colorScales));
  
  svg.append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    .call(addLabels(scaleX, scaleY));
  
  return svg;
}
)});
  main.variable(observer("addLabels")).define("addLabels", ["config"], function(config){return(
function(scaleX, scaleY) {
  return function(g) {
    var primary = config.columns[0].key,
        secondary = config.columns[1].key;
    
    config.data.forEach(function(d, i) {  
      var prev = (i > 0 ? config.data[i - 1] : null);
      var label = d[primary];
      
      if (!prev || prev[primary] !== d[primary]) {
        g.append("line")
          .attr("stroke", "currentColor")
          .attr("stroke-width", 1)
          .attr("stroke-opacity", 0.35)
          .attr("fill", "none")
          .attr("x1", 0)
          .attr("y1", scaleY(i))
          .attr("x2", scaleX.bandwidth())
          .attr("y2", scaleY(i));

        if (label.length > 2) {
          g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 7)
            .attr("text-anchor", "end")
            .attr("fill", "currentColor")
            .attr("transform", function(d) {
              return "rotate(-90)" 
            })
            .attr("x", -1 * (scaleY(i) + 8))
            .attr("y", scaleX.bandwidth() / 2)
            .text(label);
        } else {       
          g.append("text")
            .attr("font-family", "sans-serif")
            .attr("font-size", 7)
            .attr("text-anchor", "start")
            .attr("fill", "currentColor")
            .attr("x", 0)
            .attr("y", scaleY(i) + 10)
            .text(label);
        }
      }
    });
    return g;
  }
}
)});
  main.variable(observer("drawBand")).define("drawBand", ["config","d3"], function(config,d3){return(
function(scaleX, scaleY, colorScales) {
  return function(g) {
    config.data.forEach(function(d, i) {
      var yStart = scaleY(i);  
      g.append("g")
        .selectAll("rect")
        .data(config.columns)
        .join("rect")
        .attr("x", d0 => scaleX(d0.key))
        .attr("y", yStart)
        .attr("width", scaleX.bandwidth())
        .attr("height", scaleY.bandwidth())
        .attr("fill", function(d0, i0) {
          var value = d[d0.key], scale = colorScales[d0.key];
          if (i0 == 0) return "none";
          return d3.interpolateBlues(scale(value));
        })
        .attr("stroke", function(d0, i0) {
          var value = d[d0.key], scale = colorScales[d0.key]; 
          if (i0 == 0) return "none";
          return d3.interpolateBlues(scale(value));
        });
    });
    return g;
  }
}
)});
  main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function(d3){return(
function(scaleX, h) {
  return function(g) {
    return g.call(d3.axisTop(scaleX).tickPadding(8).tickSize(0))
      .call(g => g.select(".domain").remove())
      .call(g => g.selectAll("text")
        .attr("font-size", 8)
        .style("text-anchor", "start")
        .attr("transform", function(d) {
          return "rotate(-30)" 
        }));
  }
}
)});
  main.variable(observer("makeScaleY")).define("makeScaleY", ["d3","config"], function(d3,config){return(
function(h) {
  return d3.scaleBand()
    .domain(config.data.map((d, i) => i))
    .range([0, h]);
}
)});
  main.variable(observer("makeScaleX")).define("makeScaleX", ["d3","config"], function(d3,config){return(
function(w) {
  return d3.scaleBand()
    .domain(config.columns.map(d => d.key))
    .range([0, w]);
}
)});
  main.variable(observer("makeColumnScales")).define("makeColumnScales", ["config","d3"], function(config,d3){return(
function() {
  var m = {};
  config.data.forEach(function(d) {
    config.columns.forEach(function(c) {
      if (!m.hasOwnProperty(c.key)) {
        m[c.key] = [];
      }
      m[c.key].push(d[c.key]);
    });
  });
  
  var scales = {};
  config.columns.forEach(function(c) {
    var values = m[c.key],
        scale = null;
    
    switch (c.type) {
    case "category":
      scale = d3.scalePoint()
        .domain(values).range([0.05, 0.95]);
      break;   
      
    case "date":
      var extent = d3.extent(values);
      scale = d3.scaleTime() 
        .domain(extent).range([0.0, 1.0]);
      break;     
        
    case "numerical":
      var extent = d3.extent(values);
      scale = d3.scaleLinear()
        .domain(extent).range([0.0, 1.0]);
      break;
      
    default:
      console.assert("No category for column", c);
    }
    
    scales[c.key] = scale;
  });
  
  return scales;
}
)});
  main.variable(observer("sort")).define("sort", ["config","arr"], function(config,arr){return(
function() {
  config.columns.sort(function(a, b) {
    var indexA = (a.primary ? 0 : (a.secondary ? 1 : 2)),
        indexB = (b.primary ? 0 : (b.secondary ? 1 : 2));
    return indexA - indexB;
  });
  
  var primary = config.columns[0].key,
      secondary = config.columns[1].key;
  
  var byKey = arr.group(config.data, d => d[primary]);
  var keys = Array.from(byKey.keys());
  
  var grouped = [];
  keys.map(k => {
    var values = byKey.get(k);
    values.sort(function(a, b) {
      return b[secondary] - a[secondary];
    });
    grouped.push({
      key: k, values: values, max: values[0][secondary]
    });
  });
  
  if (!config.sortPrimary) {
    config.data = grouped.map(d => d.values).flat();
    return;
  }
  
  grouped = grouped.sort(function(a, b) {
    return b.max - a.max
  });
  config.data = grouped.map(d => d.values).flat();
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", ["config"], function(config){return(
function() {
  var margin = {top: 50, right: 20, bottom: 50, left: 20};
  var w = config.columns.length * 25,
      h = config.data.length * 2.75;
  
  return {
    margin: margin, 
    w: w, h: h,
    fw: margin.left + w + margin.right, 
    fh: margin.top + h + margin.bottom
  };
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
