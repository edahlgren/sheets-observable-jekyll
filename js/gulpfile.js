var gulp = require("gulp");
var eslint = require("gulp-eslint");
var rollup = require("gulp-rollup");
var rename = require("gulp-rename");
var babel = require("gulp-babel");

const destFolder = "../assets/js";

function bundle(config) {
  process.env.NODE_ENV = "release";

  return gulp.src("./src/**/*.js")
    // ----------- linting --------------
    .pipe(eslint({
      configFile: "./eslint.config.json"
    }))
    .pipe(eslint.format())
    .pipe(eslint.failAfterError()) // --> failing if errors
    // ----------- rolling up --------------
    .pipe(rollup({
      input: config.entry,
      output: {
        format: config.format,
        name: "app"
      }
    }))
    .pipe(rename(config.rollup))
    .pipe(gulp.dest(destFolder)) // --> writing rolledup
    // ----------- babelizing --------------
    .pipe(babel())
    .pipe(rename(config.babel))
    .pipe(gulp.dest(destFolder)); // --> writing babelized ES5

    // ----------- TODO minifying --------------
}

gulp.task("new_iife", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    entry: "./src/new/index.js",
    format: "iife",
    rollup: "new.es2015.js",
    babel: "new.js"
  });
});

gulp.task("new_esm", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    entry: "./src/new/index.js",
    format: "esm",
    rollup: "new.esm.es2015.js",
    babel: "new.esm.js"
  });
});

gulp.task("report_iife", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    entry: "./src/report/index.js",
    format: "iife",
    rollup: "report.es2015.js",
    babel: "report.js"
  });
});

gulp.task("report_esm", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    entry: "./src/report/index.js",
    format: "esm",
    rollup: "report.esm.es2015.js",
    babel: "report.esm.js"
  });
});

gulp.task("default", gulp.parallel(
  'new_iife',
  'new_esm',
  'report_iife',
  'report_esm'
));

gulp.task("watch", function () {
    gulp.watch("./src/**/*.js", gulp.parallel(
      'new_iife',
      'new_esm',
      'report_iife',
      'report_esm'
    ));
});
