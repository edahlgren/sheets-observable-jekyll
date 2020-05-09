function canUseAny(fields, templates) {
  for (var i = 0; i < templates.length; i++) {
    if (templates[i].canUse(fields)) return true;
  }
  return false;
}

function usableTemplates(fields, templates) {
  return templates.filter(function(t) {
    return t.canUse(fields);
  });
}

function insertTemplates(root, templates) {
  var elements = root.getElementsByClassName("template");
  for (var i = 0; i < templates.length; i++) {
    var element = elements[i];
    element.appendChild(templates[i]);
    element.classList.remove("hide");
  }
  return root;
}

export default {
  canUseAny: canUseAny,
  filterForUsable: usableTemplates,
  insertAll: insertTemplates
}
