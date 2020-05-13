const fs = require('fs');
const path = require('path');
const htmlclean = require('htmlclean');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var args = process.argv.slice(2);
if (args.length < 2) {
  console.error("Usage: node index.js <mock-dir> <template-output-file>");
}
var inputDir = args[0],
    outputFile = args[1];

var mockIndex = path.join(inputDir, "index.html"),
    indexData = fs.readFileSync(mockIndex, 'utf8');

var dom = new JSDOM(indexData),
    temp = dom.window.document.querySelector(".temp"),
    container = dom.window.document.querySelector(".container");

// Remove all objects
var objects = container.querySelectorAll("object");
objects.forEach(function(object, i) {
  var parent = object.parentNode;
  parent.classList.add("contains-object");
  if (i > 0) {
    parent.classList.add("hide");
  }
  parent.removeChild(object);
});

// Embed all images
var images = container.querySelectorAll("img");
images.forEach(function(image) {
  var imagePath = path.join(inputDir, "images", path.basename(image.src)),
      imageData = fs.readFileSync(imagePath, 'utf8');

  temp.innerHTML = imageData;
  var svg = temp.firstChild;
  svg.classList.add("inline");

  image.parentNode.replaceChild(svg, image);
});

// Write the output
console.log("Done!");
fs.writeFileSync(outputFile, htmlclean(container.innerHTML));
