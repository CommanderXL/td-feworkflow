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
        var behavior,
            stream = gulp.src(src),
            cwd = process.cwd();

        switch (flag) {
            case 'js':
                behavior = $$.uglify;
                break;
            case 'css':
                behavior = $$.cleanCss;
                break;
            case 'img':
                behavior = $$.imagemin;
                break;
            default :
                break;
        }

        if(flag === 'js' || flag === 'css') {
            behavior = (flag === 'js' ? $$.uglify : $$.cleanCss);


            stream.pipe(behavior())
                .pipe($$.rev())
                .pipe(gulp.dest(dest))
                .pipe($$.rev.manifest(path.resolve(revPath, 'manifest.json'), {
                    base: revPath,
                    merge: true
                }))
                .pipe(gulp.dest(revPath));
        } else {
            behavior = $$.imagemin;

            stream.pipe(behavior())
                .pipe(gulp.dest(dest))
        }
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
    if(suffix === 'js') {           //js处理
        return jsMini;
    } else if(suffix === 'css') {   //css处理
        return cssMini;
    } else {
        return imgMini;             //图片处理
    }
};

//_path 源文件的路径
//dest 目标文件的路径
var operateFn = function (_path, dest) {
    var pathArr = _path.split('/'),
        file = pathArr[pathArr.length - 1],
        index =  file.indexOf('.'),
        behavior,
        revPath;        //版本号路径

    if(index != -1) {
        behavior = getFileOperation(file);

        revPath = path.resolve(_path, '../../../rev');

        behavior(_path, dest, revPath);
    } else {

        var _pathArr = _path.split('/');

        _pathArr.pop();

        revPath = _pathArr.join('/');

        revPath = path.resolve(revPath, '../rev');


        fs.readdir(_path, function (err, fileNameArr) {
            "use strict";
            fileNameArr.forEach(function (item, index) {
                var _pattern = /\.(js|css|jpeg|png|gif)$/,
                    _match = item.match(_pattern);

                if(_match && _match[1]) {
                    return behavior = getFileOperation(item);
                }
            });

            fileNameArr.forEach(function (item, index) {
                fileNameArr[index] = _path + '/' + item;
            });
            behavior(fileNameArr, dest, revPath);
        })
    }
};




var cssMini = getMiniFn('css'),
    jsMini = getMiniFn('js'),
    imgMini = getMiniFn('img');



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
                _pattern = /src(\/\w+\.?\w*)+/g;

            var _srcPath = srcPath.match(_pattern)[0],
                _pathArr = _srcPath.split('/'),
                _destFile = [_pathArr[1], _pathArr[2]].join('/');


            var destPath = srcPath.replace(_pattern, '') + _destFile;

            operateFn(srcPath, destPath);
        });

        //postcss complier
        $('.list-container').delegate('.complie-btn', 'click', function () {
            "use strict";
            var path = $(this).parent().parent().prev().data('file');
        });

        //图片压缩复制
        $('.list-container').delegate('.copy-btn', 'click', function () {
            var srcPath = $(this).parent().parent().prev().data('file');
        });


        //watchFn();

        //gulp.run(['watch', 'connect']);
    };
