/**
 * Created by XRene on 16/8/5.
 */

//native system dialogs for opening and saving files,对于render process需要调用加上remote属性
var dialog = require('electron').remote.dialog,
    gulp = require('gulp'),
    $$ = require('gulp-load-plugins')(),
    path = require('path'),
    fs = require('fs'),
    del = require('del'),
    //主菜单配置文件
    config = require('./config'),
    cProcess = require('child_process'),
    //工具函数
    util = require('./workflow/util')($, gulp, path),
    //静态服务器,  多端都可以查看(browser)
    browserSync = require('./workflow/browserSync')($, gulp, path);

var handle;

// js or css mini
var getMiniFn = function (flag) {
    return function (src, dest, revPath, info) {

        util.modalOperateFn(info);

        return function () {
            var behavior,
                stream = gulp.src(src),
                cb,
                _base = path.dirname(src[0]);

            if(src.length > 1) {
                //遍历文件夹,删除文件(注意这个地方的异步操作使用闭包来处理)
                for(var i = 0; i < src.length; i++) {

                    var _destPath = path.dirname(src[i]).replace(/\/src/, ''),//目标路径
                        _baseName = path.basename(src[i]),  //文件or文件夹
                        _fileName,
                        _pattern;


                    if(_baseName.indexOf('.') == -1) {
                        _fileName = _baseName;
                    } else {
                        _fileName = _baseName.split('.')[0];
                    }

                    _pattern = new RegExp(_fileName);

                    (function (x) {
                        fs.readdir(_destPath, function (err, destArr) {
                            destArr.forEach(function (item) {
                                if(x.test(item)) {
                                    //这个通过gulp的写法为什么有问题
                                    cProcess.exec('rm -rf' + path.resolve(_destPath, item));
                                    /* gulp.src(path.resolve(_destPath, item), {read: false})
                                     .pipe($$.clean({force: true}));*/
                                }
                            });
                        });
                    })(_pattern);

                    if(path.extname(src[i]) == '') {
                        if(flag === 'js') {
                            src[i] = src[i] + '/**/*.js';
                        } else if(flag === 'css') {
                            src[i] = src[i] + '/**/*.css';
                        }
                    }
                }
            }

            function CssOrJsHandle() {

                gulp.src(src, {base: _base})//设备base选项可以设定src代码最后输出的base目录
                    .pipe($$.replace(flag === 'js' ? $('.api-src-path').val() : $('.css-src-path').val(), flag === 'js' ? $('.api-dest-path').val() : $('.css-dest-path').val()))
                    .pipe(behavior())
                    .pipe($$.rev())
                    .pipe(gulp.dest(dest))
                    .pipe($$.rev.manifest(path.resolve(revPath, 'manifest.json'), {
                        base: revPath,
                        merge: true
                    }))
                    .pipe(gulp.dest(revPath))
                    .on('end', function () {
                        util.showLogs(flag === 'js' ? 'js压缩完毕...' : 'css压缩完毕...');
                    });
            }

            function htmlHandle() {
                var manifest = gulp.src(path.resolve(revPath, 'manifest.json')),
                    replaceObj = {};

                replaceObj[$('.md5-src-path').val()] = $('.md5-dest-path').val();

                gulp.src(src)
                    .pipe($$.revReplace({manifest: manifest}))
                    .pipe($$.replace($('.md5-src-path').val(), $('.md5-dest-path').val()))
                    .pipe(gulp.dest(dest))
                    .on('end', function () {
                        util.showLogs('html文件文件版本号添加成功');
                    });
            }

            if(flag === 'js' || flag === 'css') {
                behavior = (flag === 'js' ? $$.uglify : $$.cleanCss);

                cb = CssOrJsHandle;

                //modalOperateFn(info);
            } else if(flag === 'html'){
                behavior = $$.revReplace;

                cb = htmlHandle;

            } else {
                behavior = $$.imagemin;

                stream.pipe(gulp.dest(dest));
            }

            cb();

        }
    }
};


//文件的操作动作  (这个地方的代码重新书写)
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


            if(!behavior) return alert('请选择正确的工作方式^_^');

            handle = behavior(fileNameArr, dest, revPath, info);
        })

    } else {
        behavior = getFileOperation(matcher[1]);

        handle = behavior([_path], dest, revPath, info);
    }
};


$('.btn-confirm').on('click', function () {
    handle();
});


var init = function () {
    var btn = document.querySelector('button'),
        addFileBtn = $('.add-file-btn');

    addFileBtn.on('click', function () {
        //唤起native选择框
        dialog.showOpenDialog(config.dialogConfig, function (filename) {

            //取消按钮操作
            if(!filename) return;

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

        operateFn(srcPath, util.getDestPath(srcPath), util.getInfo.call(this));
    });

    //MD5追加版本号
    $('.list-container').delegate('.md5-btn', 'click', function () {
        "use strict";
        var srcPath = $(this).parent().parent().prev().data('file');

        operateFn(srcPath, util.getDestPath(srcPath), util.getInfo.call(this));
    });

    //开发 页面无刷新
    $('.list-container').delegate('.dev-btn', 'click', function () {
        var srcPath = $(this).parent().parent().prev().data('file');

        browserSync.watchFn(srcPath, util.getInfo.call(this));
    });
};

//初始化操作
init();

