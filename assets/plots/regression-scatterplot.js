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
    var data = _taggedTemplateLiteral(["# Regression code"]);

    _templateObject$1 = function _templateObject() {
      return data;
    };

    return data;
  }

  // https://observablehq.com/d/bba258fd25367b55@16
  function define$1(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject$1());
    });
    main.variable(observer("makeRegression")).define("makeRegression", ["r", "d3", "correlation"], function (r, d3, correlation) {
      return function (points, xScale, yScale) {
        var loess = r.regressionLoess().x(function (d) {
          return d.x;
        }).y(function (d) {
          return d.y;
        }).bandwidth(0.9);
        var lineLoess = d3.line().x(function (d) {
          return xScale(d[0]);
        }).y(function (d) {
          return yScale(d[1]);
        });

        if (points.length == 0) {
          return {
            points: [],
            lineGenerator: lineLoess,
            correlated: 0
          };
        }

        var ps = loess(points);
        return {
          points: ps,
          lineGenerator: lineLoess,
          correlated: correlation(points, ps)
        };
      };
    });
    main.variable(observer("correlation")).define("correlation", ["d3"], function (d3) {
      return function (ds, rpoints) {
        var regressFirst = rpoints[0];
        var regressLast = rpoints[rpoints.length - 1];
        var slope = (regressLast[1] - regressFirst[1]) / (regressLast[0] - regressFirst[0]);
        var xEnds = d3.extent(ds, function (d) {
          return d.x;
        });
        var yEnds = d3.extent(ds, function (d) {
          return d.y;
        });
        var perfectSlope = (yEnds[1] - yEnds[0]) / (xEnds[1] - xEnds[0]);
        var positive = [perfectSlope / 2, perfectSlope * 2];
        var negative = [-positive[0], -positive[1]];

        if (slope >= positive[0] && slope <= positive[1]) {
          return 1;
        }

        if (slope >= negative[1] && slope <= negative[0]) {
          return -1;
        }

        return 0;
      };
    });
    main.variable(observer("r")).define("r", ["require"], function (require) {
      return require.alias({
        "d3-regression": "d3-regression@1"
      })("d3-regression");
    });
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
      return require("d3@5");
    });
    return main;
  }

  function _templateObject$2() {
    var data = _taggedTemplateLiteral(["# Scatterplot with loess regression"]);

    _templateObject$2 = function _templateObject() {
      return data;
    };

    return data;
  }
  function define$2(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject$2());
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
        // data: [{ x: 5.67, y: 10.45}]
        data: [],
        // "diabetes"
        labelX: "",
        // "obese"
        labelY: ""
      };
    });
    var child1 = runtime.module(define);
    main.import("setDefaults", child1);
    main.variable(observer("make")).define("make", ["setDefaults", "config", "defaults", "d3", "getDimensions", "makeScaleX", "makeScaleY", "makeRegression", "makeBackground", "makeAxisX", "makeAxisY", "plotPoints", "scaleColor", "makeRegressionLine"], function (setDefaults, config, defaults, d3, getDimensions, makeScaleX, makeScaleY, makeRegression, makeBackground, makeAxisX, makeAxisY, plotPoints, scaleColor, makeRegressionLine) {
      return function () {
        setDefaults(config, defaults);

        if (config.data.length == 0) {
          return d3.create("svg");
        }

        var _getDimensions = getDimensions(),
            margin = _getDimensions.margin,
            w = _getDimensions.w,
            h = _getDimensions.h,
            fw = _getDimensions.fw,
            fh = _getDimensions.fh;

        var scaleX = makeScaleX(config.data, w),
            scaleY = makeScaleY(config.data, h),
            regression = makeRegression(config.data, scaleX, scaleY);
        var svg = d3.create("svg").attr("viewBox", [0, 0, fw, fh]).attr("color", "rgba(5, 5, 38, 0.5)");
        var backgroundLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top - 15, ")"));
        makeBackground(backgroundLayer, w + 15, h + 15);
        var axisX = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(fh - margin.bottom, ")"));
        makeAxisX(axisX, scaleX, w, config.labelX);
        var axisY = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top, ")"));
        makeAxisY(axisY, scaleY, config.labelY);
        var pointsLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top, ")"));
        plotPoints(pointsLayer, config.data, regression.correlated, scaleX, scaleY, scaleColor);
        var lineLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(margin.top, ")"));
        makeRegressionLine(lineLayer, regression, scaleColor);
        return svg;
      };
    });
    main.variable(observer("makeRegressionLine")).define("makeRegressionLine", function () {
      return function (g, regression, scaleColor) {
        g.append("path").attr("fill", "none").attr("stroke", scaleColor(regression.correlated, 0.8)).attr("stroke-width", 2).datum(regression.points).attr("d", regression.lineGenerator);
      };
    });
    main.variable(observer("plotPoints")).define("plotPoints", function () {
      return function (g, points, correlated, scaleX, scaleY, scaleColor) {
        g.selectAll("cirlce").data(points).join("circle").attr("r", 3).attr("cx", function (d) {
          return scaleX(d.x);
        }).attr("cy", function (d) {
          return scaleY(d.y);
        }).attr("stroke", "none").attr("fill", scaleColor(correlated, 0.4));
      };
    });
    main.variable(observer("makeBackground")).define("makeBackground", function () {
      return function (g, w, h) {
        g.append("rect").attr("fill", "#F7FBFB").attr("x", 0).attr("y", 0).attr("width", w).attr("height", h);
      };
    });
    main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function (d3) {
      return function (g, scaleY, labelY) {
        g.call(d3.axisLeft(scaleY)).call(function (g) {
          return g.select(".domain").remove();
        }).call(function (g) {
          return g.selectAll("text").attr("font-size", 12);
        }).call(function (g) {
          return g.select(".tick:last-of-type text").clone().attr("x", 8).attr("fill", "rgba(5, 5, 38, 0.5)").attr("text-anchor", "start").attr("font-weight", "bold").attr("font-size", 12).text(labelY);
        });
      };
    });
    main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function (d3) {
      return function (g, scaleX, endX, labelX) {
        g.call(d3.axisBottom(scaleX)).call(function (g) {
          return g.select(".domain").remove();
        }).call(function (g) {
          return g.selectAll("text").attr("font-size", 12);
        }).call(function (g) {
          return g.append("text").attr("fill", "rgba(5, 5, 38, 0.5)").attr("font-weight", "bold").attr("text-anchor", "end").attr("font-size", 12).attr("x", endX).attr("y", -12).text(labelX);
        });
      };
    });
    main.variable(observer("scaleColor")).define("scaleColor", function () {
      return function (correlation, alpha) {
        if (correlation < 0) {
          return "rgba(232, 108, 9, " + alpha + ")";
        }

        if (correlation > 0) {
          return "rgba(39, 181, 234, " + alpha + ")";
        }

        return "rgba(111, 214, 214, " + alpha + ")";
      };
    });
    main.variable(observer("makeScaleY")).define("makeScaleY", ["d3"], function (d3) {
      return function (points, h) {
        return d3.scaleLinear().domain(d3.extent(points, function (d) {
          return d.y;
        })).nice().range([h, 0]);
      };
    });
    main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function (d3) {
      return function (points, w) {
        return d3.scaleLinear().domain(d3.extent(points, function (d) {
          return d.x;
        })).nice().range([0, w]);
      };
    });
    main.variable(observer("getDimensions")).define("getDimensions", function () {
      return function () {
        var margin = {
          top: 20,
          right: 30,
          bottom: 30,
          left: 40
        };
        var fw = 900,
            fh = 800;
        return {
          margin: margin,
          w: fw - margin.left - margin.right,
          h: fh - margin.top - margin.bottom,
          fw: fw,
          fh: fh
        };
      };
    });
    var child2 = runtime.module(define$1);
    main.import("makeRegression", child2);
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
      return require("d3@5");
    });
    return main;
  }

  // Your notebook, compiled as an ES module.
  //   data: [{ x: 5.67, y: 10.45}],
  //   labelX: "diabetes",
  //   labelY: "obese"
  // }

  window.regression_scatterplot = function (config) {
    return configure_notebook(define$2, config, "chart");
  };

}());
