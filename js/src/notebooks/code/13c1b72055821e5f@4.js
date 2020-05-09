// https://observablehq.com/d/13c1b72055821e5f@4
export default function define(runtime, observer) {
  const main = runtime.module();
  main.variable(observer("stateToRegion")).define("stateToRegion", ["state_region"], function(state_region){return(
function(state) {
  if (!state_region.hasOwnProperty(state))
    return "Other";
  return state_region[state];
}
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
  return main;
}
