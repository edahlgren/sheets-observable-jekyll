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
      input: "./src/index.js",
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

gulp.task("bundle_iife", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    format: "iife",
    rollup: "index.es2015.js",
    babel: "index.js"
  });
});

gulp.task("bundle_esm", function () {
  process.env.NODE_ENV = "release";
  return bundle({
    format: "esm",
    rollup: "index.esm.es2015.js",
    babel: "index.esm.js"
  });
});

gulp.task("default", gulp.parallel('bundle_iife', 'bundle_esm'));

gulp.task("watch", function () {
    gulp.watch("./src/**/*.js", gulp.parallel('bundle_iife', 'bundle_esm'));
});
