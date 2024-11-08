import { deleteAsync } from "del";

export default function (gulp, config, paths) {
  gulp.task("clean", async function () {
    return deleteAsync([`${config.root}/dist/**/*`], { force: true });
  });
}
