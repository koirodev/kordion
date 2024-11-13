import fs from "fs";
import path from 'path';
import sourcemaps from "gulp-sourcemaps";
import notify from "gulp-notify";
import rename from "gulp-rename";
import cleanCSS from "gulp-clean-css";
import header from "gulp-header";

import postcss from "gulp-postcss";
import postcssImport from "postcss-import";
import postcssMediaMinmax from "postcss-media-minmax";
import postcssIsPseudoClass from "@csstools/postcss-is-pseudo-class";
import sass from "@csstools/postcss-sass";
import autoprefixer from "autoprefixer";

export default function (gulp, config, banner) {
  const postcssPlugins = [
    sass({ silenceDeprecations: ["legacy-js-api", "import"] }),
    postcssImport(),
    postcssMediaMinmax(),
    postcssIsPseudoClass({ preserve: false, onComplexSelector: "warning", onPseudoElement: "warning" }),
    autoprefixer({ overrideBrowserslist: config.autoprefixerConfig })
  ]

  gulp.task("sass", function () {
    return gulp.src([`${config.root}/src/**/*.scss`, `!${config.root}/src/**/_*.scss`])
      .pipe(sourcemaps.init())
      .pipe(postcss(postcssPlugins))
      .on("error", notify.onError({ title: "Style" }))
      .pipe(rename({ extname: ".css" }))
      .pipe(sourcemaps.write("."))
      .pipe(header(banner))
      .pipe(gulp.dest(`${config.root}/dist/`));
  });

  gulp.task("sass:minified", function () {
    return gulp.src([`${config.root}/src/**/*.scss`, `!${config.root}/src/**/_*.scss`])
      .pipe(sourcemaps.init())
      .pipe(postcss(postcssPlugins))
      .on("error", notify.onError({ title: "Style" }))
      .pipe(cleanCSS({ compatibility: "ie8" }))
      .pipe(rename({ extname: ".min.css" }))
      .pipe(sourcemaps.write("."))
      .pipe(header(banner))
      .pipe(gulp.dest(`${config.root}/dist/`));
  });
}
