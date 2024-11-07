import sourcemaps from "gulp-sourcemaps";
import concat from "gulp-concat";
import terser from "gulp-terser";
import header from "gulp-header";

export default function (gulp, config, paths, banner) {
  gulp.task("js:process", function () {
    return gulp.src(paths.app)
      .pipe(sourcemaps.init())
      .pipe(concat("kordion.js"))
      .pipe(sourcemaps.write())
      .pipe(header(banner))
      .pipe(gulp.dest(`${config.root}/export`));
  });

  gulp.task("js:process:minified", function () {
    return gulp.src(paths.app)
      .pipe(sourcemaps.init())
      .pipe(concat("kordion.min.js"))
      .pipe(terser())
      .pipe(sourcemaps.write())
      .pipe(header(banner))
      .pipe(gulp.dest(`${config.root}/export`));
  });
}
