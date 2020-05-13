var fs = require('fs');
var path = require('path');

var mustache = require('mustache');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var imageDir = "./images";
var styleDir = "./styles";
var templates = [
  "../../../templates/correlation-1/mock",
  "../../../templates/correlation-2/mock"
];

function getBase(t) { return path.basename(path.dirname(t)); }

// Copy the images
console.log("Copying images ...");
templates.forEach(function(t) {
  var base = getBase(t),
      dir = path.join(imageDir, base);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  var images = path.join(t, "images");
  fs.readdirSync(images).forEach(function(name) {
    if (name === "." || name === "..") {
      return;
    }
    var src = path.join(images, name),
        dest = path.join(dir, name);
    fs.copyFileSync(src, dest);
  });
});

// Get the styles files
console.log("Copying styles ...");
var styles = templates.map(function(t) {
  var base = getBase(t),
      dir = path.join(styleDir, base);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }

  var cssFile = path.join(t, "main.css");
  fs.copyFileSync(cssFile, path.join(dir, "main.css"));

  return path.join("/styles", base, "main.css");
});

// Parse the html
console.log("Parsing HTML ...");
var htmlContent = templates.map(function(t) {
  var htmlFile = path.join(t, "index.html"),
      data = fs.readFileSync(htmlFile, 'utf8');

  var dom = new JSDOM(data),
      container = dom.window.document.querySelector(".container");

  // Rewrite all image sources
  var objects = container.querySelectorAll("object");
  objects.forEach(function(object) {
    var base = path.basename(object.data);
    object.data = path.join("/images", getBase(t), base);
  });

  var images = container.querySelectorAll("img");
  images.forEach(function(image) {
    var base = path.basename(image.src);
    image.src = path.join("/images", getBase(t), base);
  });

  return container.innerHTML;
});

// Load the mustache template
console.log("Templating ...");
var template = fs.readFileSync("./template.html", 'utf8');
var output = mustache.render(template, {
  styles: styles,
  content: htmlContent
});
fs.writeFileSync("./index.html", output);

console.log("Done")
