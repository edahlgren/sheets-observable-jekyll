// https://observablehq.com/d/9821d94b209bcc62@6
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer()).define(["md"], function(md){return(
md`# Set defaults`
)});
  main.variable(observer("setDefaults")).define("setDefaults", function(){return(
function(config, defaults) {
  for (var key in defaults) {
    if (defaults.hasOwnProperty(key) && !config.hasOwnProperty(key)) {
      config[key] = defaults[key];    
    }
  } 
}
)});
  return main;
}
