/**
 * Created by XRene on 16/8/5.
 */

//native system dialogs for opening and saving files,对于render process需要调用加上remote属性
var dialog = require('electron').remote.dialog,
    gulp = require('gulp'),
    $$ = require('gulp-load-plugins')(),
    path = require('path'),
    browserSync = require('browser-sync').create(),
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
    return function (src, dest, revPath, info) {
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
            case 'html':
                behavior = $$.revReplace;
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
        } else if(flag === 'html'){
            behavior = $$.revReplace;

            var manifest = gulp.src(path.resolve(revPath, 'manifest.json'));
            stream.pipe(behavior({manifest: manifest}))
                .pipe($$.replace())
                .pipe(gulp.dest(dest));
        } else {
            behavior = $$.imagemin;

            stream.pipe(behavior())
                .pipe(gulp.dest(dest));
        }

        modalOperateFn(info);
    }
};


//静态服务器,  多端都可以查看(browser)
var watchFn = function (srcPath, info) {
    browserSync.init({
        server: {
            baseDir: srcPath
        }
    });

    gulp.watch([path.resolve(srcPath, 'pages/**/*.html'),
        path.resolve(srcPath, 'css/**/*.css'),
        path.resolve(srcPath, 'js/**/*.js')])
        .on('change', browserSync.reload)

    modalOperateFn(info);
};


var getFileOperation = function (file) {
    var _arr = file.split('.'),
        suffix = _arr[_arr.length - 1];
    if(suffix === 'js') {           //js处理
        return jsMini;
    } else if(suffix === 'css') {   //css处理
        return cssMini;
    } else if(suffix === 'html'){
        return htmlMini;             //html文件打版本号
    } else {
        return imgMini;              //图片压缩
    }
};

//_path 源文件的路径
//dest 目标文件的路径
var operateFn = function (_path, dest, info) {
    var pathArr = _path.split('/'),
        file = pathArr[pathArr.length - 1],
        index =  file.indexOf('.'),
        behavior,
        revPath;        //版本号路径

    if(index != -1) {
        behavior = getFileOperation(file);

        revPath = path.resolve(_path, '../../../rev');

        behavior(_path, dest, revPath, info);
    } else {

        var _pathArr = _path.split('/');

        _pathArr.pop();

        revPath = _pathArr.join('/');

        revPath = path.resolve(revPath, '../rev');


        fs.readdir(_path, function (err, fileNameArr) {
            "use strict";
            fileNameArr.forEach(function (item, index) {
                var _pattern = /\.(js|css|jpeg|png|gif|html)$/,
                    _match = item.match(_pattern);

                if(_match && _match[1]) {
                    return behavior = getFileOperation(item);
                }
            });

            fileNameArr.forEach(function (item, index) {
                fileNameArr[index] = _path + '/' + item;
            });
            behavior(fileNameArr, dest, revPath, info);
        })
    }
};

//获取目标文件的路径
var getDestPath = function (srcPath) {

    var _pattern = /src(\/\w+((\.|_|-)*\w*)*\.?\w*)+/g,
        _srcPath = srcPath.match(_pattern)[0],
        _pathArr = _srcPath.split('/'),
        _destFile = [_pathArr[1], _pathArr[2]].join('/');

    console.log(srcPath);
    console.log(srcPath.replace(_pattern, ''));

    var destPath = srcPath.replace(_pattern, '') + _destFile;

    console.log(destPath);

    return destPath;
};

//modal控制函数
//info modal需要显示的信息
var modalOperateFn = function (info) {
    var modal = $('#myModal');
    modal.modal();
    modal.find('.modal-title').text(info.title);
    modal.find('.modal-body').text(info.tips);
};




var cssMini = getMiniFn('css'),
    jsMini = getMiniFn('js'),
    imgMini = getMiniFn('img'),
    htmlMini = getMiniFn('html');


var getInfo = function () {
    var tips = {
        title: $(this).data('whatever') ? $(this).data('whatever') : '',
        tips: $(this).data('tips') ? $(this).data('tips') : ''
    };
    return tips;
};

var init = function () {
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
                '<li><a href="##" class="btn btn-default uglify-btn" data-whatever="压缩完成!" data-target="#myModal" data-toggle="modal" role="button" data-loading-text="压缩中....">压缩</a></li><li><a href="##" class="btn btn-default md5-btn" data-whatever="MD5完成!" data-target="#myModal" data-toggle="modal"  role="button" data-loading-text="MD5ing">MD5</a></li><li><a href="##" class="btn btn-danger dev-btn" data-whatever="启动完成!" data-tips="PC端访问根路径:localhost:3000;\nMoblie访问根路径:192.168.1.101:3000"  data-loading-text="启动ing..." role="button">开发</a></li>',
                '</ul>',
                '</li>'
            ].join('');


            $('.list-container').append(html);

        });
    });


    //压缩混淆
    $('.list-container').delegate('.uglify-btn', 'click', function () {
        "use strict";
        var srcPath = $(this).parent().parent().prev().data('file');

        operateFn(srcPath, getDestPath(srcPath), getInfo.call(this));
    });

    //MD5追加版本号
    $('.list-container').delegate('.md5-btn', 'click', function () {
        "use strict";
        var srcPath = $(this).parent().parent().prev().data('file');

        operateFn(srcPath, getDestPath(srcPath), getInfo.call(this));
    });

    //开发 页面无刷新
    $('.list-container').delegate('.dev-btn', 'click', function () {
        var srcPath = $(this).parent().parent().prev().data('file');

        /*var $btn = $(this).button('loading');

         setTimeout(function () {
         $btn.button('reset');
         }, 3000);*/

        watchFn(srcPath, getInfo.call(this));
    });
};


init();

