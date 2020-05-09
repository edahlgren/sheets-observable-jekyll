import analytical1 from "./analytical-1/index.js";

const reports = [
  analytical1
];

function bestReport(fields) {
  var selection = null, selectionScore = 0;

  reports.forEach(function(report) {
    if (report.canUse(fields)) {
      var score = report.computeScore(fields);
      if (score > selectionScore) {
        selection = report;
        selectionScore = score;
      }
    }
  });
  return enableMake(selection);
}

function enableMake(report) {
  report.make = function(fields, data, progress) {
    return make(report, fields, data, progress);
  };
  return report;
}

function make(report, fields, data, progress) {
  var sections = report.sections(fields);
  var sectionRoots = sections.map(function(section) {
    return makeSection(template, fields, data, progress);
  });
  return report.compile(sectionRoots);
}

function makeSection(section, fields, data, progress) {
  var templates = section.templates(fields);
  var templateRoots = templates.map(function(template) {
    return makeTemplate(template, fields, data, progress);
  });
  return section.compile(templateRoots);
}

function makeTemplate(template, fields, data, progress) {
  var variations = template.variations(fields);
  var svgRoots = variations.map(function(ctx) {
    return template.visualization.make(fields, data, ctx);
  });
  return template.compile(svgRoots);
}

export { bestReport as bestReport };
