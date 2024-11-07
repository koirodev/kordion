import gulp from "gulp";
import config from "./gulp/config.js";

import appPath from "./gulp/paths/app.js";
import tasksPath from "./gulp/paths/tasks.js";

const version = "2.0.0";
const date = "November 08, 2024";
const header = `
/*
 * Kordion ${version}
 * https://github.com/koirodev/kordion
 *
 * Copyright 2024 Vitaly Koiro
 *
 * Released under the MIT License
 *
 * Released on: ${date}
*/
`;

const paths = {
  tasks: tasksPath,
  app: appPath
}

for (const taskPath of paths.tasks) {
  const task = await import(taskPath);
  task.default(gulp, config, paths, header);
}

const defaultTasks = [
  "sass",
  "sass:minified",
  "js:process",
  "js:process:minified",
];

gulp.task("default", gulp.series(
  "clean",
  gulp.parallel(...defaultTasks),
  "watch"
));

gulp.task("prod", gulp.series(
  "clean",
  gulp.parallel(...defaultTasks)
));
