// https://observablehq.com/d/ff91f6565903a1fd@139
import define1 from "./9821d94b209bcc62@6.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["names.json",new URL("/assets/plots/files/states-names.json", window.location.origin)],["albers.json",new URL("/assets/plots/files/states-albers.json", window.location.origin)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Two scale US regions and states`
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
  // data: {AK: 7.4, AL: 12.64, AR: 11.7, AZ: 10.18, CA: 9.84, ...}
  data: {},
  colorScale1: {
    start: -1.0,
    end: 0.0,
    startColor: "rgb(169, 220, 252)",
    endColor: "rgb(246, 250, 255)"
  },
  colorScale2: {
    start: 0.0,
    end: 1.0,
    startColor: "rgb(255, 244, 239)",
    endColor: "rgb(252, 195, 169)"
  }
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","makeScaleColor","regionGroups","states","state_names","state_region","path"], function(setDefaults,config,defaults,d3,getDimensions,makeScaleColor,regionGroups,states,state_names,state_region,path){return(
function() {
  setDefaults(config, defaults);
  if (Object.keys(config.data) == 0) {
    return d3.create("svg");
  }

  var { margin, w, h, fw, fh } = getDimensions();
  var scaleColor = makeScaleColor();

  var svg = d3.create("svg")
      .attr("viewBox", [0, 0, fw, fh])
      .attr("color", "rgba(5, 5, 38, 0.5)");

  var rs = regionGroups(svg);

  states.forEach(function(s) {
    var short = state_names[s.properties.name],
        region = state_region[short];

    if (rs.hasOwnProperty(region)) {
      var g = rs[region].group;
      g.append("path")
        .attr("d", path(s))
        .attr("stroke-width", 0.5)
        .attr("stroke", "#ffffff")
        .attr("fill", function() {
          if (config.data.hasOwnProperty(short)) {
            return scaleColor(config.data[short]);
          }
          return "#f0f0f0";
        });
    }
  });

  for (var key in rs) {
    if (rs.hasOwnProperty(key)) {
      var r = rs[key];
      r.group.attr("transform", `translate(${r.deltaX}, ${r.deltaY})`);
    }
  }

  return svg;
}
)});
  main.variable(observer("makeScaleColor")).define("makeScaleColor", ["d3","config"], function(d3,config){return(
function() {
  var scale1 = d3.scaleLinear()
    .domain([
      config.colorScale1.start,
      config.colorScale1.end
    ])
    .range([
      config.colorScale1.startColor,
      config.colorScale1.endColor
    ]);

  var scale2 = d3.scaleLinear()
    .domain([
      config.colorScale2.start,
      config.colorScale2.end
    ])
    .range([
      config.colorScale2.startColor,
      config.colorScale2.endColor
    ]);

  return function(v) {
    if (v == 0) return "#f0f0f0";
    if (v < 0) return scale1(v);
    return scale2(v);
  }
}
)});
  main.variable(observer("getDimensions")).define("getDimensions", function(){return(
function() {
  var margin = {top: 0, right: 0, bottom: 0, left: 0};
  var w = 975,
      h = 610;

  return {
    margin: margin,
    w: w, h: h,
    fw: margin.left + w + margin.right,
    fh: margin.top + h + margin.bottom
  };
}
)});
  main.variable(observer("regionGroups")).define("regionGroups", ["regions","path","us_centroid","movePointAtAngle"], function(regions,path,us_centroid,movePointAtAngle){return(
function(g) {
  var rs = {};
  regions.forEach(function(r) {
    var [x, y] = path.centroid(r);
    var angle = Math.atan2(y - us_centroid[1], x - us_centroid[0]);
    var new_center = movePointAtAngle(x, y, angle, 20);
    var deltaX = new_center[0] - x,
        deltaY = new_center[1] - y;

    var g0 = g.append("g");
    rs[r.id] = {group: g0, deltaX: deltaX, deltaY: deltaY};
  });
  return rs;
}
)});
  main.variable(observer("movePointAtAngle")).define("movePointAtAngle", function(){return(
function(x, y, angle, distance) {
  angle += Math.PI/2;
  return [
    x + (Math.sin(angle) * distance),
    y - (Math.cos(angle) * distance)
  ];
}
)});
  main.variable(observer("state_outlines")).define("state_outlines", ["topojson","us"], function(topojson,us){return(
topojson.mesh(us, us.objects.states, (a, b) => a !== b)
)});
  main.variable(observer("states")).define("states", ["topojson","us"], function(topojson,us){return(
topojson.feature(us, us.objects.states).features
)});
  main.variable(observer("regions")).define("regions", ["region_names","topojson","us","state_names","state_region"], function(region_names,topojson,us,state_names,state_region){return(
region_names.map(function(r) {
  return {
    id: r,
    ...topojson.merge(us, us.objects.states.geometries.filter(function(d) {
      var short = state_names[d.properties.name];
      return r === state_region[short];
    }))
  };
})
)});
  main.variable(observer("state_region")).define("state_region", function(){return(
{
  AK: "West",
  AL: "South",
  AR: "South",
  AZ: "West",
  CA: "West",
  CO: "West",
  CT: "Northeast",
  DC: "South",
  DE: "South",
  FL: "South",
  GA: "South",
  HI: "West",
  IA: "Midwest",
  ID: "West",
  IL: "Midwest",
  IN: "Midwest",
  KS: "Midwest",
  KY: "South",
  LA: "South",
  MA: "Northeast",
  MD: "South",
  ME: "Northeast",
  MI: "Midwest",
  MN: "Midwest",
  MO: "Midwest",
  MS: "South",
  MT: "West",
  NC: "South",
  ND: "Midwest",
  NE: "Midwest",
  NH: "Northeast",
  NJ: "Northeast",
  NM: "West",
  NV: "West",
  NY: "Northeast",
  OH: "Midwest",
  OK: "South",
  OR: "West",
  PA: "Northeast",
  RI: "Northeast",
  SC: "South",
  SD: "Midwest",
  TN: "South",
  TX: "South",
  UT: "West",
  VA: "South",
  VT: "Northeast",
  WA: "West",
  WI: "Midwest",
  WV: "South",
  WY: "West"
}
)});
  main.variable(observer("region_names")).define("region_names", function(){return(
["South", "West", "Northeast", "Midwest"]
)});
  main.variable(observer("state_names")).define("state_names", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("names.json").json()
)});
  main.variable(observer("us_centroid")).define("us_centroid", ["path","us_border"], function(path,us_border){return(
function() {
  var boundingBox = path.bounds(us_border),
      boundStartX = boundingBox[0][0],
      boundStartY = boundingBox[0][1],
      boundWidth = boundingBox[1][0] - boundingBox[0][0],
      boundHeight = boundingBox[1][1] - boundingBox[0][1];

  return [
    boundStartX + (boundWidth/2),
    boundStartX + (boundHeight/2),
  ];
}()
)});
  main.variable(observer("us_border")).define("us_border", ["topojson","us"], function(topojson,us){return(
topojson.mesh(us, us.objects.states, function(a, b) {
  if (a.properties.name === "Alaska" || b.properties.name === "Alaska")
    return false;
  if (a.properties.name === "Hawaii" || b.properties.name === "Hawaii")
    return false;
  return a === b;
})
)});
  main.variable(observer("us")).define("us", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("albers.json").json()
)});
  main.variable(observer("path")).define("path", ["d3"], function(d3){return(
d3.geoPath()
)});
  main.variable(observer("topojson")).define("topojson", ["require"], function(require){return(
require("topojson-client@3")
)});
  main.variable(observer("d3")).define("d3", ["require"], function(require){return(
require("d3@5")
)});
  return main;
}
