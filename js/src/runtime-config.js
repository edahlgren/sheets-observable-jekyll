import { Runtime } from "./runtime-implementation.js";

window.configure_notebook = function(notebook, config, cell) {
  var main = new Runtime().module(notebook);
  main.redefine("config", config)
  return main.value(cell);
};
