function choose_single_sheet(sheets) {
  var sheet_names = sheets.map(function(sheet) {
    return sheet.properties.title;
  });
  var sheet_set = new Set(sheet_names);
  for (var i = 0; i < sheet_names.length; i++) {
    var sheet = sheet_names[i];
    if (sheet_set.has(sheet + ".fields")) {
      return sheet;
    }
  }
  return null;
}

function organize_fields(fields) {
  // Need at least 2 rows
  if (fields.length < 1) {
    return { isMalformed: true };
  }

  // Header needs to look like this:
  // Field, Description, Caption, Type, Distribution
  var header = fields[0];
  if (header.length < 9) {
    return { isMalformed: true };
  }
  if (header[0] !== "Field" ||
      header[1] !== "Description" ||
      header[2] !== "Caption" ||
      header[3] !== "Type" ||
      header[4] !== "Distribution" ||
      header[5] !== "TotalUnique" ||
      header[6] !== "Avg" ||
      header[7] !== "Min" ||
      header[8] !== "Max") {
    return { isMalformed: true };
  }

  // Create a map of the fields
  fields = fields.slice(1).map(function(field) {
    return {
      field: field[0],
      description: field[1],
      caption: field[2],
      type: field[3],
      distribution: field[4],
      totalUnique: +field[5],
      avg: (field[6] !== "" ? +field[6] : null),
      min: (field[7] !== "" ? +field[7] : null),
      max: (field[8] !== "" ? +field[8] : null),
      index: -1
    };
  });

  // Collect all categorical (grouped) fields
  var categorical = fields.filter(function(field) {
    return field.distribution === "grouped";
  }).map(function(field) {
    return field.field;
  });

  // Collect all numerical random fields
  var numerical_random = fields.filter(function(field) {
    var numerical = (field.type === "numerical" ||
                     field.type === "percent");
    return numerical && field.distribution === "random";
  }).map(function(field) {
    return field.field;
  });

  return {
    all: fields,
    categorical: categorical,
    numericalRandom: numerical_random,
    isMalformed: false
  };
}

function match_header_to_fields(fields, header) {
  // Map all of the fields
  var fields_map = new Map(fields.all.map(function(field) {
    return [field.field, field];
  }));

  // Match each non-empty column to a field description
  for (var i = 0; i < header.length; i++) {
    var col = header[i];
    if (col.length == 0)
      continue;

    if (!fields_map.has(col))
      return null;

    var field = fields_map.get(col);
    field.index = i;
    fields_map.set(col, field);
  }

  // Return new format
  fields.get = function(field) {
    return fields_map.get(field);
  };
  return fields;
}

export {
  choose_single_sheet,
  organize_fields,
  match_header_to_fields
};
