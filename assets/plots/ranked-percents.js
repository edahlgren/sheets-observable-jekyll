(function () {
  'use strict';

  function _taggedTemplateLiteral(strings, raw) {
    if (!raw) {
      raw = strings.slice(0);
    }

    return Object.freeze(Object.defineProperties(strings, {
      raw: {
        value: Object.freeze(raw)
      }
    }));
  }

  function _templateObject() {
    var data = _taggedTemplateLiteral(["# Set defaults"]);

    _templateObject = function _templateObject() {
      return data;
    };

    return data;
  }

  // https://observablehq.com/d/9821d94b209bcc62@6
  function define(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject());
    });
    main.variable(observer("setDefaults")).define("setDefaults", function () {
      return function (config, defaults) {
        for (var key in defaults) {
          if (defaults.hasOwnProperty(key) && !config.hasOwnProperty(key)) {
            config[key] = defaults[key];
          }
        }
      };
    });
    return main;
  }

  function _templateObject$1() {
    var data = _taggedTemplateLiteral(["# Ranked percents"]);

    _templateObject$1 = function _templateObject() {
      return data;
    };

    return data;
  }
  function define$1(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject$1());
    });
    main.variable(observer("chart")).define("chart", ["make"], function (make) {
      var svg = make();
      return svg.node();
    });
    main.variable(observer("config")).define("config", function () {
      return {};
    });
    main.variable(observer("defaults")).define("defaults", function () {
      return {
        // data: [ {key: "overweight", percent: 64.09333333333336}, ...]
        data: [],
        colorBars: "#cee9f2"
      };
    });
    var child1 = runtime.module(define);
    main.import("setDefaults", child1);
    main.variable(observer("make")).define("make", ["setDefaults", "config", "defaults", "d3", "getDimensions", "makeScaleX", "makeScaleY", "makeAxisY", "drawBars"], function (setDefaults, config, defaults, d3, getDimensions, makeScaleX, makeScaleY, makeAxisY, drawBars) {
      return function () {
        setDefaults(config, defaults);

        if (config.data.length == 0) {
          return d3.create("svg");
        }

        var _getDimensions = getDimensions(),
            margin = _getDimensions.margin,
            w = _getDimensions.w,
            h = _getDimensions.h,
            boxH = _getDimensions.boxH,
            fw = _getDimensions.fw,
            fh = _getDimensions.fh;

        var scaleX = makeScaleX(w),
            scaleY = makeScaleY(h);
        var svg = d3.create("svg").attr("viewBox", [0, 0, fw, fh]).attr("color", "rgba(5, 5, 38, 0.5)");
        svg.append("g").attr("transform", "translate(".concat(margin.left, ", ").concat(margin.top, ")")).call(makeAxisY(scaleY));
        svg.append("g").attr("transform", "translate(".concat(margin.left, ", ").concat(margin.top, ")")).call(drawBars(scaleX, scaleY, w, boxH));
        return svg;
      };
    });
    main.variable(observer("drawBars")).define("drawBars", ["config"], function (config) {
      return function (scaleX, scaleY, w, boxH) {
        return function (g) {
          config.data.forEach(function (d, i) {
            g.append("rect").attr("stroke", "none").attr("fill", "#fafafa").attr("x", 0).attr("y", scaleY(d.key)).attr("fill", "#fafafa").attr("width", w).attr("height", boxH);
            g.append("rect").attr("stroke", "none").attr("fill", config.colorBars).attr("x", 0).attr("y", scaleY(d.key)).attr("width", scaleX(d.percent)).attr("height", boxH);
            g.append("text").attr("x", scaleX(d.percent) + 10).attr("y", scaleY(d.key) + boxH / 2 + 5).attr("fill", "rgba(5, 5, 38, 0.4)").attr("font-family", "sans-serif").attr("font-size", 12).text(d.percent.toFixed(2) + "%");
          });
          return g;
        };
      };
    });
    main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function (d3) {
      return function (scaleY) {
        return function (g) {
          return g.call(d3.axisLeft(scaleY)).call(function (g) {
            return g.selectAll("text").attr("font-size", 13);
          }).call(function (g) {
            return g.selectAll(".tick line").remove();
          }).call(function (g) {
            return g.selectAll(".domain").remove();
          });
        };
      };
    });
    main.variable(observer("makeScaleY")).define("makeScaleY", ["d3", "config"], function (d3, config) {
      return function (h) {
        return d3.scaleBand().domain(config.data.map(function (d) {
          return d.key;
        })).range([0, h]);
      };
    });
    main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function (d3) {
      return function (w) {
        return d3.scaleLinear().domain([0.0, 100.0]).range([0, w]);
      };
    });
    main.variable(observer("getDimensions")).define("getDimensions", ["config"], function (config) {
      return function () {
        var margin = {
          top: 25,
          bottom: 15,
          left: 150,
          right: 25
        };
        var w = 300,
            boxH = 28,
            h = 30 * config.data.length;
        return {
          margin: margin,
          w: w,
          h: h,
          boxH: boxH,
          fw: margin.left + w + margin.right,
          fh: margin.top + h + margin.bottom
        };
      };
    });
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
      return require("d3@5");
    });
    return main;
  }

  // Your notebook, compiled as an ES module.
  //   data: [ {key: "overweight", percent: 64.09333333333336}, ...]
  //   colorBars: "#cee9f2"
  // }

  window.ranked_percents = function (config) {
    return configure_notebook(define$1, config, "chart");
  };

}());
