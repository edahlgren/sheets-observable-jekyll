// https://observablehq.com/d/2002bd989603ac6a@134
import define1 from "./9821d94b209bcc62@6.js";
import define2 from "./13c1b72055821e5f@4.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["names.json",new URL("/assets/plots/files/states-names.json", window.location.origin)],["albers.json",new URL("/assets/plots/files/states-albers.json", window.location.origin)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Linear US regions and states`
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
  colorStart: "rgb(227, 238, 249)",
  colorMiddle: "rgb(165, 204, 228)",
  colorEnd: "rgb(75, 151, 201)"
}
)});
  const child1 = runtime.module(define1);
  main.import("setDefaults", child1);
  main.variable(observer("make")).define("make", ["setDefaults","config","defaults","d3","getDimensions","makeScaleColor","regionGroups","states","state_names","stateToRegion","path"], function(setDefaults,config,defaults,d3,getDimensions,makeScaleColor,regionGroups,states,state_names,stateToRegion,path){return(
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
        region = stateToRegion(short);

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
  var extent = d3.extent(Object.values(config.data)),
      middle = extent[0] + (extent[1] - extent[0])/2;

  var scale0 = d3.scaleLinear()
    .domain([extent[0], middle])
    .range([config.colorStart, config.colorMiddle]);

  var scale1 = d3.scaleLinear()
    .domain([middle, extent[1]])
    .range([config.colorMiddle, config.colorEnd])

  return function(v) {
    if (v < middle) return scale0(v);
    return scale1(v);
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
  main.variable(observer("regions")).define("regions", ["region_names","topojson","us","state_names","stateToRegion"], function(region_names,topojson,us,state_names,stateToRegion){return(
region_names.map(function(r) {
  return {
    id: r,
    ...topojson.merge(us, us.objects.states.geometries.filter(function(d) {
      var short = state_names[d.properties.name];
      return r === stateToRegion(short);
    }))
  };
})
)});
  main.variable(observer("region_names")).define("region_names", function(){return(
["South", "West", "Northeast", "Midwest"]
)});
  const child2 = runtime.module(define2);
  main.import("stateToRegion", child2);
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
