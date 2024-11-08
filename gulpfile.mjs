import gulp from "gulp";
import config from "./scripts/config.mjs";

import appPath from "./scripts/paths/app.mjs";
import tasksPath from "./scripts/paths/tasks.mjs";

const header = `
/*
 * Kordion ${config.version}
 * https://github.com/koirodev/kordion
 *
 * Copyright 2024 Vitaly Koiro
 *
 * Released under the MIT License
 *
 * Released on: ${config.date}
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
  "js:process:min",
  "js:process:modules",
  "js:process:modules:min",
];

gulp.task("default", gulp.series(
  "clean",
  gulp.parallel(...defaultTasks)
));
