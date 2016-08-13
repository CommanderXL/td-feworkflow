/**
 * Created by XRene on 16/8/5.
 */

//native system dialogs for opening and saving files,对于render process需要调用加上remote属性
var dialog = require('electron').remote.dialog,
    gulp = require('gulp'),
    $$ = require('gulp-load-plugins')(),
    path = require('path'),
    browserSync = require('browser-sync').create(),
    fs = require('fs'),
    del = require('del');




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


// js or css mini
var getMiniFn = function (flag) {
    return function (src, dest, revPath, info) {
        var behavior,
            stream = gulp.src(src),
            cwd = process.cwd();

        //遍历文件夹,删除文件(注意这个地方的异步操作使用闭包来处理)
        for(var i = 0; i < src.length; i++) {
            var _srcArr = src[i].replace(/\/src/, '').split('/'),
                _fileArr = _srcArr[_srcArr.length - 1].split('.');
            _srcArr.pop();
            _fileArr.pop();
            var _destPath = _srcArr.join('/'),
                _fileName = _fileArr.join('.'),
                _pattern = new RegExp(_fileName);
            (function (x) {
                fs.readdir(_destPath, function (err, destArr) {
                    destArr.forEach(function (item) {
                        if(x.test(item)) {
                            gulp.src(path.resolve(_destPath, item), {read: false})
                                .pipe($$.clean({force: true}));
                        }
                    });
                });
            })(_pattern);
        }

        if(flag === 'js' || flag === 'css') {
            behavior = (flag === 'js' ? $$.uglify : $$.cleanCss);

            $('#myModal').on('hidden.bs.modal', function () {
                stream
                    .pipe($$.replace(flag === 'js' ? $('.api-src-path').val() : $('.css-src-path').val(), flag === 'js' ? $('.api-dest-path').val() : $('.css-dest-path').val()))
                    .pipe(behavior())
                    .pipe($$.rev())
                    .pipe(gulp.dest(dest))
                    .pipe($$.rev.manifest(path.resolve(revPath, 'manifest.json'), {
                        base: revPath,
                        merge: true
                    }))
                    .pipe(gulp.dest(revPath));
            });


            //modalOperateFn(info);
        } else if(flag === 'html'){
            behavior = $$.revReplace;

            $('#myModal').on('hidden.bs.modal', function () {

                var manifest = gulp.src(path.resolve(revPath, 'manifest.json')),
                    replaceObj = {};

                replaceObj[$('.md5-src-path').val()] = $('.md5-dest-path').val();

                src.unshift(path.resolve(revPath, 'manifest.json'));

                gulp.src(src)
                    .pipe($$.revCollector({
                        replaceReved: true,
                        dirReplacements: replaceObj
                    }))
                    .pipe(gulp.dest(dest));
                //modalOperateFn(info);
            });

        } else {
            behavior = $$.imagemin;

            stream.pipe(gulp.dest(dest));
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

//文件的操作动作
var getFileOperation = function (file) {
    return getMiniFn(file);
};

//_path 源文件的路径
//dest 目标文件的路径
//info 提示语
var operateFn = function (_path, dest, info) {

    var behavior,   //动作
        revPath = _path.replace(/src(\/\w+((\.|-|_)\w+)*)+/, '') + 'src/rev'; //版本号文件夹

    var extNameRegExp = /^.(html|js|css)$/,
        matcher = path.extname(_path).match(extNameRegExp);

    if(matcher == null) {

        fs.readdir(_path, function (err, fileNameArr) {
            fileNameArr.forEach(function (item, index) {
                var _pattern = /\.(js|css|jpeg|png|gif|html)$/,
                    _match = item.match(_pattern);

                if(_match && _match[1]) {
                    return behavior = getFileOperation(_match[1]);
                }
            });

            fileNameArr.forEach(function (item, index) {
                fileNameArr[index] = _path + '/' + item;
            });

            behavior(fileNameArr, dest, revPath, info);
        })

    } else {
        behavior = getFileOperation(matcher[1]);

        behavior([_path], dest, revPath, info);
    }

};

//获取目标文件的路径
var getDestPath = function (srcPath) {

    var extRegExp = /^.(js|html|css)/,
        matcher = path.extname(srcPath).match(extRegExp);

    var _result =  matcher == null ? srcPath.replace(/\/src/, '') : path.dirname(srcPath).replace(/\/src/, '');

    return _result;
};

//modal控制函数
//info modal需要显示的信息
var modalOperateFn = function (info) {
    var modal = $('#myModal');
    modal.modal();
    modal.find('.modal-title').text(info.title);


    if(info.title === '压缩完成') {
        $('.uglifyForm').show()
            .find('input').val('');
        $('.md5Form').hide();
    } else if(info.title === '请输入替换路径') {
        $('.md5Form').show()
            .find('input').val('');
        $('.uglifyForm').hide();
    } else {
        modal.find('.modal-body').text(info.tips);
    }
};

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

            var html = [],
                i = 0,
                len = filename.length;

            for(; i < len; i++) {
                var _nodeItem = [
                    '<li class="list-item">',
                    /*'<span class="icon icon-large icon-file-alt"></span>',*/
                    '<div class="file-box" data-file="',
                    filename[i],
                    '">',
                    filename[i],
                    '</div>',
                    '<ul class="btn-box">',
                    '<li><a href="##" class="btn btn-default uglify-btn" data-whatever="压缩完成" role="button" data-loading-text="压缩中....">压缩</a></li><li><a href="##" class="btn btn-default md5-btn" data-whatever="请输入替换路径"   role="button" data-loading-text="MD5ing">MD5</a></li><li><a href="##" class="btn btn-danger dev-btn" data-whatever="启动完成!" data-tips="PC端访问根路径:localhost:3000;\nMoblie访问根路径:192.168.1.101:3000"  data-loading-text="启动ing..." role="button">开发</a></li>',
                    '</ul>',
                    '</li>'
                ].join('');
                html[i] = _nodeItem;
            }

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

        watchFn(srcPath, getInfo.call(this));
    });
};

//初始化操作
init();

