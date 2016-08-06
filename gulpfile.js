/**
 * Created by XRene on 16/8/5.
 */

//native system dialogs for opening and saving files,对于render process需要调用加上remote属性
var dialog = require('electron').remote.dialog,
    gulp = require('gulp'),
    $$ = require('gulp-load-plugins')(),
    path = require('path'),
    fs = require('fs');




var dialogConfig = {
    properties: ['openFile', 'openDirectory', 'multiSelections'],
    filters: [
        {name: 'Images', extensions: ['jpg', 'png', 'gif']},
        {name: 'Html', extensions: ['html', 'php']},
        {name: 'css', extensions: ['css', 'less', 'sass', 'scss']},
        {name: 'js', extensions: ['js', 'jsx']},
        {name: 'All Files', extensions: ['*']}
    ]
};


function concatCss(src, dest) {
    "use strict";
    src = src || '';
    dest = dest || process.cwd();
}


// js or css mini
var getMiniFn = function (flag) {
    return function (src, dest, revPath) {
        var behavior = (flag === 'js' ? $$.uglify : $$.cleanCss),
            stream = gulp.src(src),
            cwd = process.cwd();

        stream.pipe(behavior())
            .pipe($$.rev())
            .pipe(gulp.dest(dest))
            .pipe($$.rev.manifest(path.resolve(revPath, './rev/manifest.json'), {
                base: path.resolve(revPath, './rev'),
                merge: true
            }))
            .pipe(gulp.dest(path.resolve(revPath, './rev')));
    }
};


//静态服务器,  多端都可以查看(browser)
var watchFn = function (src) {
    gulp.watch(['./index.html', './css/**'], function () {
        gulp.src(['./index.html', './css/**'])
            .pipe($$.connect.reload());
    });

    $$.connect.server({
        name: 'dev app',
        port: 8000,
        root: './',
        livereload: true
    });
};


var getFileOperation = function (file) {
    var _arr = file.split('.'),
        suffix = _arr[_arr.length - 1];
    return suffix === 'js' ? jsMini : cssMini;
};

//path 源文件的路径
//目标文件的路径
var operateFn = function (path, dest) {
    var pathArr = path.split('/'),
        file = pathArr[pathArr.length - 1],
        index =  file.indexOf('.'),
        behavior,
        revPath;        //版本号路径

    if(index != -1) {
        behavior = getFileOperation(file);

        revPath = path;

        behavior(path, dest, revPath);
    } else {

        var _pathArr = path.split('/');

        _pathArr.pop();

        revPath = _pathArr.join('/');

        fs.readdir(path, function (err, fileNameArr) {
            "use strict";
            fileNameArr.forEach(function (item, index) {
                var _pattern = /\.(js|css)$/,
                    _match = item.match(_pattern);

                if(_match[1]) {
                    return behavior = getFileOperation(item);
                }
            });

            fileNameArr.forEach(function (item, index) {
                fileNameArr[index] = path + '/' + item;
            });
            behavior(fileNameArr, dest, revPath);
        })
    }
};



var cssMini = getMiniFn('css'),
    jsMini = getMiniFn('js');



    module.exports = function () {
        var fileInput = document.querySelector('input[type=file]'),
            btn = document.querySelector('button');

        var addFileBtn = $('.add-file-btn');


        addFileBtn.on('click', function () {
            //唤起native选择框
            dialog.showOpenDialog(dialogConfig, function (filename) {

                //取消按钮操作
                if(filename.length === 0) return;

                var html = [
                    '<li class="list-item">',
                    /*'<span class="icon icon-large icon-file-alt"></span>',*/
                    '<div class="file-box" data-file="',
                    filename[0],
                    '">',
                    filename[0],
                    '</div>',
                    '<ul class="btn-box">',
                    '<li><a href="##" class="uglify-btn">压缩</a></li><li><a href="##" class="complie-btn">编译</a></li><li><a href="##" class="copy-btn">复制到文件夹</a></li>',
                    '</ul>',
                    '</li>'
                ].join('');


                $('.list-container').append(html);

            });
        });


        //压缩混淆
        $('.list-container').delegate('.uglify-btn', 'click', function () {
            "use strict";
            var srcPath = $(this).parent().parent().prev().data('file'),
                pattern = /src\/(\w+)/,
                _pattern = /src(\/\w+)+/g;

            var destFile = srcPath.match(pattern)[1],
                destPath;

            destPath = srcPath.replace(_pattern, '') + destFile;


            operateFn(srcPath, destPath);
        });

        //postcss complier
        $('.list-container').delegate('.complie-btn', 'click', function () {
            "use strict";
            var path = $(this).parent().parent().prev().data('file');
        });

        //复制
        $('.list-container').delegate('.copy-btn', 'click', function () {
            var path = $(this).parent().parent().prev().data('file');
        });


        //watchFn();

        //gulp.run(['watch', 'connect']);
    };
