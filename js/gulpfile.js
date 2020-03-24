var gulp = require("gulp");
var eslint = require("gulp-eslint");
var rollup = require("gulp-rollup");
var rename = require("gulp-rename");
var babel = require("gulp-babel");

function bundle(config) {
  process.env.NODE_ENV = "release";

  return gulp.src("./src/**/*.js")
    // ----------- rolling up --------------
    .pipe(rollup({
      input: config.entry,
      output: {
        format: config.format,
        name: "app"
      }
    }))
  //.pipe(rename(config.rollup))
    //.pipe(gulp.dest(config.destFolder)) // --> writing rolledup
    // ----------- babelizing --------------
    .pipe(babel())
    .pipe(rename(config.babel))
    .pipe(gulp.dest(config.destFolder)); // --> writing babelized ES5

    // ----------- TODO minifying --------------
}

gulp.task("new", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    destFolder: "../assets/js",
    entry: "./src/new/index.js",
    format: "iife",
    rollup: "new.es2015.js",
    babel: "new.js"
  });
});

/**
gulp.task("new_esm", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    destFolder: "../assets/js",
    entry: "./src/new/index.js",
    format: "esm",
    rollup: "new.esm.es2015.js",
    babel: "new.esm.js"
  });
});
**/

gulp.task("report", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    destFolder: "../assets/js",
    entry: "./src/report/index.js",
    format: "iife",
    rollup: "report.es2015.js",
    babel: "report.js"
  });
});

/**
gulp.task("report_esm", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    destFolder: "../assets/js",
    entry: "./src/report/index.js",
    format: "esm",
    rollup: "report.esm.es2015.js",
    babel: "report.esm.js"
  });
});
**/

gulp.task("basic_scatterplot", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    destFolder: "../assets/plots",
    entry: "./src/plots/basic-scatterplot.js",
    format: "iife",
    rollup: "basic-scatterplot.es2015.js",
    babel: "basic-scatterplot.js"
  });
});

gulp.task("default", gulp.parallel(
  'new',
  'report',
  'basic_scatterplot'
));

gulp.task("watch", function () {
    gulp.watch("./src/**/*.js", gulp.parallel(
      'new',
      'report',
      'basic_scatterplot'
    ));
});
