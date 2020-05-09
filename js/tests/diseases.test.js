import {
  organize_fields,
  match_header_to_fields,
  choose_designs
} from "../src/report/processing.js";
import diseases from "./testdata.diseases.js";

function queryVars(query) {
  var vars = query.split('&');
  var vars_map = new Map();
  for (var i = 0; i < vars.length; i++) {
      var pair = vars[i].split('=');
      vars_map.set(
        decodeURIComponent(pair[0]),
        decodeURIComponent(pair[1])
      );
  }
  return vars_map;
}

describe('spec', () => {
  var fields = null,
      data = diseases.data,
      designs = null;

  beforeAll(() => {
    var fs = organize_fields(diseases.fields);
    fields = match_header_to_fields(fs, data[0]);
    designs = choose_designs(fields).designs;
  });

  test('config (report)', () => {
    for (var i = 0; i < designs.length; i++) {
      var v = designs[i];
      var iter = v.iterations[0];
      var config = v.spec.report.config(iter, fields, data.slice(1));
      console.log("report.config", v.type, JSON.stringify(config));
    }
  });
  test('titles', () => {
    for (var i = 0; i < designs.length; i++) {
      var v = designs[i];
      var iter = v.iterations[0];
      var titles1 = v.spec.report.titles(iter, fields),
          titles2 = v.spec.report.titles(iter, fields);
      console.log("titles", v.type, titles1, titles2);
    }
  });
  test('query vars', () => {
    for (var i = 0; i < designs.length; i++) {
      var v = designs[i];
      var iter = v.iterations[0];

      var qvars = v.spec.report.makeVars(iter, fields),
          qvars_str = qvars.join("&"),
          qmap = queryVars(qvars_str),
          pvars = v.spec.plot.parseVars(qmap, data[0]);

      console.log("vars", v.type, qvars, pvars);
    }
  });
  test('config (plot)', () => {
    for (var i = 0; i < designs.length; i++) {
      var v = designs[i];
      var iter = v.iterations[0];

      var qvars = v.spec.report.makeVars(iter, fields),
          qvars_str = qvars.join("&"),
          qmap = queryVars(qvars_str),
          pvars = v.spec.plot.parseVars(qmap, data[0]);

      var config = v.spec.plot.config(pvars, data.slice(1));
      console.log("plot.config", v.type, JSON.stringify(config));
    }
  });
});
