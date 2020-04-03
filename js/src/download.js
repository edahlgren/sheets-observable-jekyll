window.URL = (window.URL || window.webkitURL);

const doctype = '<?xml version="1.0" standalone="no"?><!DOCTYPE svg PUBLIC "-//W3C//DTD SVG 1.1//EN" "http://www.w3.org/Graphics/SVG/1.1/DTD/svg11.dtd">';

function svgToString(svg) {
  svg.setAttribute("version", "1.1");
  svg.removeAttribute("xmlns");
  svg.removeAttribute("xlink");

  if (!svg.hasAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns")) {
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns", "http://www.w3.org/2000/svg");
  }
  if (!svg.hasAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink")) {
    svg.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xlink", "http://www.w3.org/1999/xlink");
  }
  return (new XMLSerializer()).serializeToString(svg);
}

function svgDimensions(svg) {
  var dimensions = svg.getAttribute("viewBox").split(",").map(function(v) {
    return parseInt(v, 10);
  });

  var width = dimensions[2],
      height = dimensions[3];

  if (width > height) {
  	var _width = 1800;
  	height = 1800 * (height/width);
    width = _width;
  } else {
  	var _height = 1800;
    width = 1800 * (width/height);
    height = _height;
  }
  return { width: width, height: height };
}

function nowToString() {
  var now = new Date();
  var day = now.getUTCFullYear() + "-" + now.getUTCMonth() + "-" + now.getUTCDay(),
      time = now.getUTCHours() + "-" + now.getUTCMinutes() + "-" + now.getUTCSeconds();
  return day + "T" + time;
}

function download_svg(svg, name) {
  return new Promise(function(resolve, reject) {
    var source = svgToString(svg);
    var url = window.URL.createObjectURL(
      new Blob([doctype + source], { "type" : "text/xml" })
    );

    var a = document.createElement("a");
    a.download = name + "-" + nowToString() + ".svg";
    a.href = url;
    a.click();

    URL.revokeObjectURL(url);
    resolve();
  });
}

function download_png(svg, name) {
  return new Promise(function(resolve, reject) {
    var canvas = document.createElement("canvas"),
        context = canvas.getContext("2d");

    var dimensions = svgDimensions(svg);
  	canvas.width = dimensions.width;
  	canvas.height = dimensions.height;

    var source = svgToString(svg);
    var blob = new Blob([doctype + source], { type: 'image/svg+xml;charset=utf-8' });
    var url = window.URL.createObjectURL(blob);

    var image = new Image;
    image.onerror = function() {
      reject(new Error("Image failed to load"));
    }
    image.onload = function() {
  		context.drawImage(image, 0, 0);

      var dataURL = canvas.toDataURL("image/png");
      var a = document.createElement("a");
      a.download = name + "-" + nowToString() + ".png";
      a.href = dataURL;
      a.click();

      URL.revokeObjectURL(url);
      resolve();
    };
    image.src = url;
  });
}

export { download_svg as downloadSVG };
export { download_png as downloadPNG };
