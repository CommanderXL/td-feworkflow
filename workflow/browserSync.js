/**
 * Created by XRene on 16/8/26.
 */

var browserSync = require('browser-sync').create();

module.exports = function ($, gulp, path) {
    return {
        watchFn: function (srcPath, info) {
            browserSync.init({
                server: {
                    baseDir: srcPath
                }
            });

            gulp.watch([path.resolve(srcPath, 'pages/**/*.html'),
                path.resolve(srcPath, 'css/**/*.css'),
                path.resolve(srcPath, 'js/**/*.js')])
                .on('change', browserSync.reload);

            require('./util')($, gulp, path).modalOperateFn(info);
        }
    }
};
