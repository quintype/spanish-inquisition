"use strict";

var gulp   = require("gulp"),
    jsHint = require("gulp-jshint"),
    jscs   = require("gulp-jscs");

var jsFiles = ["*.js", "lib/**/*.js"];

gulp.task("lint", function () {
  return gulp.src(jsFiles)
    .pipe(jsHint())
    .pipe(jsHint.reporter("jshint-stylish", {
      verbose: true
    }))
    .pipe(jscs());
});

gulp.task("default", ["lint"]);
