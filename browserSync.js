/**
 * Created by XRene on 16/8/22.
 */

var browserSync = require('browser-sync').create(),
    gulp = require('gulp'),
    path = require('path'),
    modalOperateFn = require('./modalOperate');

function syncFn(src, info) {
    browserSync.init({
        server: {
            baseDir: srcPath
        }
    });

    gulp.watch([path.resolve(srcPath, 'pages/**/*.html'),
        path.resolve(srcPath, 'css/**/*.css'),
        path.resolve(srcPath, 'js/**/*.js')])
        .on('change', browserSync.reload);

    modalOperateFn(info);
}
