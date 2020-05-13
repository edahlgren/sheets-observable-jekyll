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
  report.make = async function(fields, data, progress) {
    return make(report, fields, data, progress);
  };
  return report;
}

async function make(report, fields, data, progress) {
  progress.desc.textContent = "Finding best variations to show";
  var all = getVariations(report, fields);
  progress.bar.style.width = "20%";

  var sections = all.sections,
      total = all.total,
      bands = progressBands(20, total),
      i = 0;

  console.log("total variations", total);

  var sectionRoots = [];
  for (var j = 0; j < sections.length; j++) {
    var templates = sections[j].templates,
        section = sections[j].section;

    var templateRoots = [];
    for (var k = 0; k < templates.length; k++) {
      var variations = templates[k].variations,
          template = templates[k].template;

      var svgRoots = [];
      for (var l = 0; l < variations.length; l++) {
        var ctx = variations[l];

        // Make visualization
        var svgRoot = await template.visualization.make(fields, data, ctx);
        svgRoots.push(svgRoot);

        // Increment progress bar
        progress.desc.textContent = (i+1) + "/" + total;
        progress.bar.style.width = (i+1 == total ? 100 : bands[i]) + "%";
        i += 1;
      }

      // Make template
      var templateRoot = template.compile(svgRoots);
      templateRoots.push(templateRoot);
    }

    // Make section
    var sectionRoot = section.compile(templateRoots);
    sectionRoots.push(sectionRoot);
  }

  // Make report
  return report.compile(sectionRoots);
}

function getVariations(report, fields) {
  var sections = report.sections(fields);
  var total = 0;

  var ss = sections.map(function(section) {
    var templates = section.templates(fields);
    var ts = templates.map(function(template) {
      var variations = template.variations(fields);
      total += variations.length;
      return {
        template: template,
        variations: variations
      };
    });
    return { section: section, templates: ts };
  });

  return { sections: ss, total: total };
}

function progressBands(start, total) {
  var bandwidth = (1.0 * (100 - start)) / (1.0 * total);
  var bands = [];
  for (var i = 0; i < total; i++) {
    bands.push(Math.floor(start + ((i+1) * bandwidth)));
  }
  return bands;
}

export { bestReport as bestReport };
