import { nextColor } from "./color.js";

// DOM elements
var app = document.getElementById("app-container"),
    color_button = document.getElementById("color-button");

// Handle click
color_button.onclick = function(event) {
  // Get the new color
  let old_color = app.dataset.color,
      new_color = nextColor(old_color);

  // Change the colors in the CSS
  app.classList.remove(old_color);
  app.classList.add(new_color);
  app.dataset.color = new_color;
};
