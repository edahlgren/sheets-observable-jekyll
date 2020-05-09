const parser = new DOMParser();

function parse(templateText) {
  var doc = parser.parseFromString(templateText, "text/html");
  return doc.body.firstChild;
}

export default {
  parseTemplate: parse
}
