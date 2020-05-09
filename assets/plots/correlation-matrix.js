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
    var data = _taggedTemplateLiteral(["# Pearson correlation code"]);

    _templateObject$1 = function _templateObject() {
      return data;
    };

    return data;
  }

  // https://observablehq.com/d/3f2a225750ecdcdd@60
  function define$1(runtime, observer) {
    var main = runtime.module();
    main.variable(observer()).define(["md"], function (md) {
      return md(_templateObject$1());
    });
    main.variable(observer("correlationMatrix")).define("correlationMatrix", ["calcArrays", "pearson"], function (calcArrays, pearson) {
      return function correlationMatrix(data, cols) {
        var out = [];
        cols.forEach(function (colx) {
          cols.forEach(function (coly) {
            var arrays = calcArrays(data, colx, coly);
            var obj = {
              column_x: colx,
              column_y: coly,
              correlation: pearson(arrays[0], arrays[1])
            };
            out.push(obj);
          });
        });
        return out;
      };
    });
    main.variable(observer("calcArrays")).define("calcArrays", ["pluck"], function (pluck) {
      return function calcArrays(data, column_a, column_b) {
        var array_a = pluck(data, column_a);
        var array_b = pluck(data, column_b);
        return [array_a, array_b];
      };
    });
    main.variable(observer("pluck")).define("pluck", function () {
      return function pluck(arr, mapper) {
        return arr.map(function (d) {
          return typeof mapper === "string" ? d[mapper] : mapper(d);
        });
      };
    });
    main.variable(observer("pearson")).define("pearson", function () {
      return function pearson(x, y) {
        var shortestArrayLength = 0;

        if (x.length == y.length) {
          shortestArrayLength = x.length;
        } else if (x.length > y.length) {
          shortestArrayLength = y.length;
          console.error('x has more items in it, the last ' + (x.length - shortestArrayLength) + ' item(s) will be ignored');
        } else {
          shortestArrayLength = x.length;
          console.error('y has more items in it, the last ' + (y.length - shortestArrayLength) + ' item(s) will be ignored');
        }

        var xy = [];
        var x2 = [];
        var y2 = [];

        for (var i = 0; i < shortestArrayLength; i++) {
          xy.push(x[i] * y[i]);
          x2.push(x[i] * x[i]);
          y2.push(y[i] * y[i]);
        }

        var sum_x = 0;
        var sum_y = 0;
        var sum_xy = 0;
        var sum_x2 = 0;
        var sum_y2 = 0;

        for (var i = 0; i < shortestArrayLength; i++) {
          sum_x += x[i];
          sum_y += y[i];
          sum_xy += xy[i];
          sum_x2 += x2[i];
          sum_y2 += y2[i];
        }

        var step1 = shortestArrayLength * sum_xy - sum_x * sum_y;
        var step2 = shortestArrayLength * sum_x2 - sum_x * sum_x;
        var step3 = shortestArrayLength * sum_y2 - sum_y * sum_y;
        var step4 = Math.sqrt(step2 * step3);
        var answer = step1 / step4;
        return answer;
      };
    });
    return main;
  }

  function _templateObject$2() {
    var data = _taggedTemplateLiteral(["# Half correlation matrix"]);

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
        // {kidney_disease: 3.5, pulmonary_disease: 5.3, diabetes: 9.5, ...}
        data: [],
        // ["kidney_disease", "pulmonary_disease", "diabetes", ...]
        columns: [],
        // 65
        binSize: 65
      };
    });
    var child1 = runtime.module(define);
    main.import("setDefaults", child1);
    main.variable(observer("make")).define("make", ["setDefaults", "config", "defaults", "d3", "getDimensions", "correlationMatrix", "halfMatrix", "makeScaleX", "makeAxisX", "makeAxisY", "makeBoxes", "scaleColor", "annotateBoxes"], function (setDefaults, config, defaults, d3, getDimensions, correlationMatrix, halfMatrix, makeScaleX, makeAxisX, makeAxisY, makeBoxes, scaleColor, annotateBoxes) {
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

        var correlations = correlationMatrix(config.data, config.columns),
            matrix = halfMatrix(config.columns, correlations),
            scaleX = makeScaleX(config.columns, w),
            scaleY = makeScaleX(config.columns, h);
        var svg = d3.create("svg").attr("viewBox", [0, 0, fw, fh]).attr("color", "rgba(5, 5, 38, 0.5)");
        var axisX = svg.append("g").attr("transform", "translate(".concat(margin.left, ",").concat(h, ")"));
        makeAxisX(axisX, scaleX);
        var axisY = svg.append("g").attr("transform", "translate(".concat(margin.left - 1, ",0)"));
        makeAxisY(axisY, scaleY);
        var boxesLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",0)"));
        makeBoxes(boxesLayer, matrix, scaleX, scaleY, scaleColor);
        var textLayer = svg.append("g").attr("transform", "translate(".concat(margin.left, ",0)"));
        annotateBoxes(textLayer, matrix, scaleX, scaleY);
        return svg;
      };
    });
    main.variable(observer("makeBoxes")).define("makeBoxes", function () {
      return function (g, matrix, scaleX, scaleY, scaleColor) {
        g.attr("fill", "none").attr("pointer-events", "all").selectAll("rect").data(matrix.filter(function (d) {
          return d.column_x != d.column_y;
        })).join("rect").attr("x", function (d) {
          return scaleX(d.column_x);
        }).attr("y", function (d) {
          return scaleY(d.column_y);
        }).attr("width", scaleX.bandwidth()).attr("height", scaleX.bandwidth()).attr("fill", function (d) {
          return scaleColor(d.correlation);
        }).attr("stroke", "none");
        g.append("g").attr("fill", "none").attr("pointer-events", "all").selectAll("rect").data(matrix.filter(function (d) {
          return d.column_x == d.column_y;
        })).join("rect").attr("x", function (d) {
          return scaleX(d.column_x);
        }).attr("y", function (d) {
          return scaleY(d.column_y);
        }).attr("width", scaleX.bandwidth()).attr("height", scaleX.bandwidth()).attr("fill", "#ffffff").attr("stroke", "#999999").attr("stroke-width", 0.5);
      };
    });
    main.variable(observer("annotateBoxes")).define("annotateBoxes", function () {
      return function (g, matrix, scaleX, scaleY) {
        g.attr("fill", "none").attr("pointer-events", "all").selectAll("text").data(matrix).join("text").text(function (d) {
          return d.correlation.toFixed(2);
        }).attr('dominant-baseline', 'middle').attr('fill', function (d) {
          if (d.column_x == d.column_y) return "none";
          return 'rgba(0, 0, 0, 0.7)';
        }).attr('font-family', 'sans-serif').attr('font-size', '11px').attr('font-weight', 'bold').attr('text-anchor', 'middle').attr('transform', function (d) {
          var x = scaleX(d.column_x),
              y = scaleY(d.column_y);
          return "translate(".concat(x + scaleX.bandwidth() / 2, ", ").concat(y + scaleY.bandwidth() / 2, ")");
        });
      };
    });
    main.variable(observer("makeAxisY")).define("makeAxisY", ["d3"], function (d3) {
      return function (g, scaleY) {
        g.call(d3.axisLeft(scaleY).tickPadding(8).tickSize(0)).call(function (g) {
          return g.select(".domain").remove();
        }).call(function (g) {
          return g.selectAll("text").attr("font-size", 10);
        });
      };
    });
    main.variable(observer("makeAxisX")).define("makeAxisX", ["d3"], function (d3) {
      return function (g, scaleX) {
        g.call(d3.axisBottom(scaleX).tickPadding(8).tickSize(0)).call(function (g) {
          return g.select(".domain").remove();
        }).call(function (g) {
          return g.selectAll("text").attr("font-size", 10).style("text-anchor", "start").attr("dx", "1em").attr("dy", "0.6em").attr("transform", function (d) {
            return "rotate(40)";
          });
        });
      };
    });
    main.variable(observer("scaleColor")).define("scaleColor", ["d3"], function (d3) {
      return function (correlation) {
        var lightReds = d3.scaleLinear().domain([-1.0, 0.0]).range([0.35, 0.0]);
        var lightBlues = d3.scaleLinear().domain([0.0, 1.0]).range([0.0, 0.35]);

        if (correlation >= 0) {
          return d3.interpolateBlues(lightBlues(correlation));
        }

        return d3.interpolateReds(lightReds(correlation));
      };
    });
    main.variable(observer("makeScaleY")).define("makeScaleY", ["d3"], function (d3) {
      return function (columns, h) {
        return d3.scaleBand().domain(columns).range([0, h]);
      };
    });
    main.variable(observer("makeScaleX")).define("makeScaleX", ["d3"], function (d3) {
      return function (columns, w) {
        return d3.scaleBand().domain(columns).range([0, w]);
      };
    });
    main.variable(observer("getDimensions")).define("getDimensions", ["config"], function (config) {
      return function () {
        var margin = {
          left: 100,
          top: 0,
          right: 20,
          bottom: 100
        };
        var w = config.columns.length * config.binSize,
            h = w;
        return {
          margin: margin,
          w: w,
          h: h,
          fw: margin.left + w + margin.right,
          fh: margin.top + h + margin.bottom
        };
      };
    });
    main.variable(observer("halfMatrix")).define("halfMatrix", function () {
      return function (columns, matrix) {
        var indices = {};
        columns.map(function (d, i) {
          indices[d] = i;
        });
        return matrix.filter(function (d) {
          var ix = indices[d.column_x],
              iy = indices[d.column_y];
          return ix <= iy;
        });
      };
    });
    var child2 = runtime.module(define$1);
    main.import("correlationMatrix", child2);
    main.variable(observer("d3")).define("d3", ["require"], function (require) {
      return require("d3@5");
    });
    return main;
  }

  // Your notebook, compiled as an ES module.
  //   data: [{ diabetes: 9.45, obese: 0.56, overweight: 34.5}, ...],
  //   columns: ["diabetes", "obese", "overweight"]
  // }

  window.correlation_matrix = function (config) {
    return configure_notebook(define$2, config, "chart");
  };

}());
