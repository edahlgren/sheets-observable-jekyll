function canUseOne(fields, templates) {
  for (var i = 0; i < templates.length; i++) {
    if (templates[i].canUse(fields)) return true;
  }
  return false;
}

function usableSections(fields, sections) {
  return sections.filter(function(s) {
    return s.canUse(fields);
  });
}

function insertSections(root, sections) {
  var elements = root.getElementsByClassName("section");
  for (var i = 0; i < sections.length; i++) {
    var element = elements[i];
    element.appendChild(sections[i]);
    element.classList.remove("hide");
  }
  return root;
}

export default {
  canUseOne: canUseOne,
  filterForUsable: usableSections,
  insertAll: insertSections
}
