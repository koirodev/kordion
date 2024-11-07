import { deleteAsync } from "del";

export default function (gulp, config, paths) {
  gulp.task("clean", async function () {
    return deleteAsync([`${config.root}/export/**/*`], { force: true });
  });
}
