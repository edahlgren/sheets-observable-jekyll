// Imports ------------------------------------

import { parseSpreadsheetUrl } from '../google.js';
import { setupTopNav } from "../top-nav.js";

// DOM ----------------------------------------

var samples = document.getElementsByClassName("sample");

// Setup the top nav bar ----------------------

setupTopNav();

// Setup samples ------------------------------

for (var i = 0; i < samples.length; i++) {
  var sample = samples.item(i),
      url = sample.dataset.url;

  var submit = sample.querySelector(".submit-spreadsheet");
  submit.onclick = function(event) {
    var id = parseSpreadsheetUrl(url);
    window.location.href = "report?id=" + id;
  };

  var view = sample.querySelector(".sample-logo");
  view.href = url;
}
