function next(color) {
  switch (color) {
  case "pink":
    return "blue";
  case "blue":
    return "green";
  case "green":
    return "pink";
  default:
    console.log("unknown color", "[" + color + "]");
    return "pink";
  }
}

export { next as nextColor };
