// https://observablehq.com/d/3f2a225750ecdcdd@60
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Pearson correlation code`
)});
  main.variable(observer("correlationMatrix")).define("correlationMatrix", ["calcArrays","pearson"], function(calcArrays,pearson){return(
function correlationMatrix(data, cols) {
  var out = [];
  cols.forEach(function(colx){
    cols.forEach(function(coly){
      var arrays = calcArrays(data, colx, coly)
      var obj = {column_x: colx, column_y: coly, correlation: pearson(arrays[0], arrays[1])}
      out.push(obj);
    });
  });
  return out;
}
)});
  main.variable(observer("calcArrays")).define("calcArrays", ["pluck"], function(pluck){return(
function calcArrays(data, column_a, column_b){
  var array_a = pluck(data, column_a);
  var array_b = pluck(data, column_b);
  return [array_a, array_b];
}
)});
  main.variable(observer("pluck")).define("pluck", function(){return(
function pluck(arr, mapper){
  return arr.map(function(d){ return typeof(mapper) === "string" ? d[mapper] : mapper(d); });
}
)});
  main.variable(observer("pearson")).define("pearson", function(){return(
function pearson(x, y) {
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

  var step1 = (shortestArrayLength * sum_xy) - (sum_x * sum_y);
  var step2 = (shortestArrayLength * sum_x2) - (sum_x * sum_x);
  var step3 = (shortestArrayLength * sum_y2) - (sum_y * sum_y);
  var step4 = Math.sqrt(step2 * step3);
  var answer = step1 / step4;

  return answer;
}
)});
  return main;
}
