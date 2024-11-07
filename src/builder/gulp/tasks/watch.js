export default function (gulp, config, paths) {
  gulp.task("watch", function () {
    gulp.watch(`${config.root}/dev/js/**/*.js`, gulp.series("js:process"));
    gulp.watch(`${config.root}/dev/scss/**/*.scss`, gulp.series("sass"));
  });
}
