import sourcemaps from "gulp-sourcemaps";
import terser from "gulp-terser";
import header from "gulp-header";
import rename from "gulp-rename";
import rollup from "gulp-rollup";

export default function (gulp, config, banner) {

  gulp.task("js:process", function () {
    return gulp.src("src/**/*.mjs")
      .pipe(sourcemaps.init())
      .pipe(rollup({
        input: "./src/kordion.mjs",
        output: {
          format: "iife",
          name: "Kordion",
          export: "default"
        }
      }))
      .pipe(rename({ extname: ".js" }))
      .pipe(header(banner))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(`${config.root}/dist`))
  });

  gulp.task("js:process:min", function () {
    return gulp.src("src/**/*.mjs")
      .pipe(sourcemaps.init())
      .pipe(rollup({
        input: "./src/kordion.mjs",
        output: {
          format: "iife",
          name: "Kordion",
          export: "default"
        }
      }))
      .pipe(terser())
      .pipe(rename({ suffix: ".min", extname: ".js" }))
      .pipe(header(banner))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(`${config.root}/dist`))
  });

  gulp.task("js:process:modules", function () {
    return gulp.src("src/**/*.mjs")
      .pipe(sourcemaps.init())
      .pipe(rollup({
        input: "./src/kordion.mjs",
        output: {
          format: "esm"
        }
      }))
      .pipe(header(banner))
      .pipe(sourcemaps.write("."))
      .pipe(gulp.dest(`${config.root}/dist`))
  });

  gulp.task("js:process:modules:min", function () {
    return gulp.src("src/**/*.mjs")
      .pipe(rollup({
        input: "./src/kordion.mjs",
        output: {
          format: "esm"
        }
      }))
      .pipe(terser())
      .pipe(rename({ suffix: ".min" }))
      .pipe(header(banner))
      .pipe(gulp.dest(`${config.root}/dist`))
  });

  gulp.task("js:process:vue", function () {
    return gulp.src("src/vue/**/*.mjs")
      .pipe(header(banner))
      .pipe(gulp.dest(`${config.root}/dist/vue`));
  });
}
