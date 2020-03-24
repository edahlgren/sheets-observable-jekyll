import { Runtime } from "./runtime-implementation.js";

window.render_notebook = function(notebook, data, cell) {
  var main = new Runtime().module(notebook);
  main.redefine("data", data)
  return main.value(cell);
};
