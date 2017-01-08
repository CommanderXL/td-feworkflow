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

var handle = [];

// js or css mini
var getMiniFn = function (flag) {
    return function (src, dest, revPath, info) {
        return function () {
            var behavior,
                stream = gulp.src(src),
                cb,
                _base = path.dirname(src[0]);

            if (src.length > 1) {
                //遍历文件夹,删除文件(注意这个地方的异步操作使用闭包来处理)
                for (var i = 0; i < src.length; i++) {

                    var _destPath = path.dirname(src[i]).replace(/\/src/, ''),//目标路径
                        _baseName = path.basename(src[i]),  //文件or文件夹
                        _fileName,
                        _pattern;


                    if (_baseName.indexOf('.') == -1) {
                        _fileName = _baseName;
                    } else {
                        _fileName = _baseName.split('.')[0];
                    }

                    _pattern = new RegExp(_fileName);

                    (function (x) {
                        fs.readdir(_destPath, function (err, destArr) {
                            destArr && destArr.forEach(function (item) {
                                if (x.test(item)) {
                                    //这个通过gulp的写法为什么有问题
                                    cProcess.exec('rm -rf' + path.resolve(_destPath, item));
                                    /* gulp.src(path.resolve(_destPath, item), {read: false})
                                     .pipe($$.clean({force: true}));*/
                                }
                            });
                        });
                    })(_pattern);

                    if (path.extname(src[i]) == '') {
                        if (flag === 'js') {
                            src[i] = src[i] + '/**/*.js';
                        } else if (flag === 'css') {
                            src[i] = src[i] + '/**/*.css';
                        }
                    }
                }
            }

            function CssOrJsHandle() {

                gulp.src(src, { base: _base })//设备base选项可以设定src代码最后输出的base目录
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
                    .pipe($$.revReplace({ manifest: manifest }))
                    .pipe($$.replace($('.md5-src-path').val(), $('.md5-dest-path').val()))
                    .pipe(gulp.dest(dest))
                    .on('end', function () {
                        util.showLogs('html文件版本号添加成功...');
                    });
            }

            if (flag === 'js' || flag === 'css') {
                behavior = (flag === 'js' ? $$.uglify : $$.cleanCss);

                cb = CssOrJsHandle;

            } else if (flag === 'html') {
                behavior = $$.revReplace;

                cb = htmlHandle;

            } else {
                behavior = $$.imagemin;

                stream
                    .pipe(gulp.dest(dest))
                    .on('end', function() {
                        util.showLogs('图片文件复制成功...');
                    });

                cb = function() {};
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

    if (matcher == null) {
        fs.readdir(_path, function (err, fileNameArr) {
            fileNameArr.forEach(function (item, index) {
                var _pattern = /\.(js|jpg|css|jpeg|png|gif|html)$/,
                    _match = item.match(_pattern);

                if (_match && _match[1]) {
                    return behavior = getFileOperation(_match[1]);
                }
            });

            fileNameArr.forEach(function (item, index) {
                fileNameArr[index] = _path + '/' + item;
            });


            if (!behavior) return alert('请选择正确的工作方式^_^');

            handle.push(behavior(fileNameArr, dest, revPath, info));
        })

    } else {
        behavior = getFileOperation(matcher[1]);

        handle.push(behavior([_path], dest, revPath, info));
    }
};


//点击确认触发按钮操作
$('.btn-confirm').on('click', function () {
    handleBootstrap();
});

//关闭模态框按钮操作
$('.close').click(function () {
    clearHandle();
});

//事件触发
function handleBootstrap() {
    console.log(handle);
    for(var i = 0; i < handle.length; i++) {
        typeof handle[i] === 'function' && handle[i]();
    }
    clearHandle();
}

//清除事件
function clearHandle() {
    handle = [];
}

var init = function () {
    var btn = document.querySelector('button'),
        addFileBtn = $('.add-file-btn');

    addFileBtn.on('click', function () {
        //唤起native选择框
        dialog.showOpenDialog(config.dialogConfig, function (filename) {

            //取消按钮操作
            if (!filename) return;

            var html = [],
                i = 0,
                len = filename.length,
                li = document.createElement('li');

            li.className = 'list-item';

            li.innerHTML = [
                '<div class="file-box" data-name="" data-file="',
                filename[i],
                '">',
                filename[i],
                '</div>',
                '<ul class="btn-box">',
                '<li><a href="##" class="btn btn-success compile-btn" data-whatever="编译完成" role="button" data-loading-text="编译中....">编译</a></li><li><a href="##" class="btn btn-danger dev-btn" data-whatever="启动完成!" data-tips="PC端访问根路径:localhost:3000;\nMoblie访问根路径:192.168.1.101:3000"  data-loading-text="启动ing..." role="button">开发</a></li><li><a href="##" class="btn btn-info upload-btn" role="button">上传</a></li><li><a href="##" class="btn btn-warning config-btn" role="button">配置</a></li>',
                '</ul>',
            ].join('');

            $('.list-container').append(li);

            util.modalOperateFn({
                title: '请输入项目名称'
            });

            //设置项目名称
            handle.push(function () {
                $(li).find('.file-box')
                    .attr('data-name', $('.item-name').val());
            });

        });
    });

    //编译(压缩及追加版本号)
    $('.list-container').delegate('.compile-btn', 'click', function () {
        var prevNode = $(this).parent().parent().prev();
        var basePath = prevNode.data('file');
        var itemName = prevNode.data('name');

        var srcCssPath = path.resolve(basePath, 'src/css/' + itemName);
        var srcJsPath = path.resolve(basePath, 'src/js/' + itemName);
        var srcHtmlPath = path.resolve(basePath, 'src/pages/' + itemName);
        var srcImagePath = path.resolve(basePath, 'src/images/' + itemName);

        var itemInfo = getItemNode($(this));
        //配置文件路径
        var configFilePath = path.resolve(itemInfo.basePath, 'src/pages/' + itemInfo.itemName + '/workflow1.config.json');

        //util.modalOperateFn({ title: '编译' });

        //css打包压缩
        operateFn(srcCssPath, util.getDestPath(srcCssPath));
        //js打包压缩
        operateFn(srcJsPath, util.getDestPath(srcJsPath));
        //图片文件
        operateFn(srcImagePath, util.getDestPath(srcImagePath));
        //html打版本号
        operateFn(srcHtmlPath, util.getDestPath(srcHtmlPath));
        //事件触发
        setTimeout(function() {
            handleBootstrap();
        }, 0);
    });

    //开发 页面无刷新
    $('.list-container').delegate('.dev-btn', 'click', function () {
        var srcPath = $(this).parent().parent().prev().data('file');

        //开启browserSync服务
        browserSync.watchFn(srcPath, util.getInfo.call(this));

        handle.push(function () {
            //开启less或者sass编译服务
            var srcLess = path.resolve(srcPath, '/src/less/**/*.less');
            var gulpWatcher = gulp.watch(srcLess);
            gulpWatcher.on('change', function () {
                gulp.src(srcLess)
                    .pipe($$.less())
                    .pipe(gulp.dest(srcPath + '/src/css'))
                    .on('end', function () {
                        util.showLogs('less编译完成');
                    });
            });


        });
        //TODO 添加停止编译的功能
    });

    $('.list-container').delegate('.upload-btn', 'click', function () {
        var itemInfo = getItemNode($(this));
        //配置文件路径
        var configFilePath = path.resolve(itemInfo.basePath, 'src/pages/' + itemInfo.itemName + '/workflow1.config.json');
        //判断是否存在项目的配置文件
        fs.exists(configFilePath, function (flag) {
            if (flag) {
                gulp.src(configFilePath)
                    .pipe($$.jsonEditor(function (json) {
                        var cfg = Object.assign(json.sftp),
                            type = json.type;

                        util.showLogs('上传文件中ing....');

                        //判断上传文件类型
                        for (var key in type) {
                            var v = type[key];

                            if (v) {

                                //上传成功回调
                                cfg.callback = function () {
                                    util.showLogs(key + '文件上传成功');
                                };

                                var filePath = path.resolve(itemInfo.basePath, key + '/' + itemName);

                                gulp.src(filePath)
                                    .pipe($$.sftp(cfg))
                                    .on('error', function () {
                                        util.showLogs('好像出错了喔...');
                                    })
                            }
                        }
                        return json;
                    }))
            } else {
                //写入文件
                fs.writeFile(configFilePath, JSON.stringify({
                    "sftp": {
                        "host": "",
                        "user": "",
                        "pass": "",
                        "port": "",
                        "remotePath": ""
                    },
                    "type": {
                        "js": false,
                        "css": false,
                        "html": false,
                        "images": false
                    },
                    "compile": {
                        "srcCss": "",
                        "distCss": "",
                        "srcApi": "",
                        "distApi": ""
                    }
                }), function (e) {
                    if (!e) {
                        //util.showLogs('新建上传配置文件成功...');
                        alert('请填写配置信息');
                    }
                })
            }
        });
    });

    //配置信息
    $('.list-container').delegate('.config-btn', 'click', function () {
        util.modalOperateFn({
            title: '请输入配置信息',
            tips: '部署'
        });

        var itemInfo = getItemNode($(this));
        //配置文件路径
        var configFilePath = path.resolve(itemInfo.basePath, 'src/pages/' + itemInfo.itemName + '/workflow1.config.json');

        fs.exists(configFilePath, function (flag) {
            if (flag) {
                gulp.src(configFilePath)
                    .pipe($$.jsonEditor(function (json) {
                        var cfg = Object.assign(json),
                            sftpCfg = cfg.sftp,
                            typeCfg = cfg.type,
                            compileCfg = cfg.compile;

                        //部署服务器配置
                        $('.host-path').val(sftpCfg.host);
                        $('.remote-path').val(sftpCfg.remotePath);
                        $('.host-port').val(sftpCfg.port);
                        $('.user-name').val(sftpCfg.user);
                        $('.user-password').val(sftpCfg.pass);

                        //上传文件类型
                        for (var key in typeCfg) {
                            console.log(typeCfg[key]);
                            $('.box-upload-' + key).prop('checked', typeCfg[key] ? true : false);
                        }
                        //编译路径替换
                        $('.css-src-path').val(compileCfg.srcCss);
                        $('.css-dest-path').val(compileCfg.distCss);
                        $('.api-src-path').val(compileCfg.srcApi);
                        $('.api-dest-path').val(compileCfg.distApi);

                        return json;
                    }))
            } else {
                //写入文件
                fs.writeFile(configFilePath, JSON.stringify({
                    "sftp": {
                        "host": "",
                        "user": "",
                        "pass": "",
                        "port": "",
                        "remotePath": ""
                    },
                    "type": {
                        "js": false,
                        "css": false,
                        "html": false,
                        "images": false
                    },
                    "compile": {
                        "srcCss": "",
                        "distCss": "",
                        "srcApi": "",
                        "distApi": ""
                    }
                }), function (e) {
                    if (!e) {
                        console.log('新建配置文件');
                    }
                })
            }
        });

        handle.push(function () {
            gulp.src(configFilePath)
                .pipe($$.jsonEditor(function (json) {
                    json.sftp.host = $('.host-path').val();
                    json.sftp.user = $('.user-name').val();
                    json.sftp.pass = $('.user-password').val();
                    json.sftp.port = $('.host-port').val();
                    json.sftp.remotePath = $('.remote-path').val();

                    json.type.js = $('.box-upload-js').prop('checked');
                    json.type.css = $('.box-upload-css').prop('checked');
                    json.type.html = $('.box-upload-html').prop('checked');
                    json.type.images = $('.box-upload-images').prop('checked');

                    json.compile.srcCss = $('.css-src-path').val();
                    json.compile.distCss = $('.css-dest-path').val();
                    json.compile.srcApi = $('.api-src-path').val();
                    json.compile.distApi = $('.api-dest-path').val();

                    return json;
                }))
                .pipe(gulp.dest(path.resolve(configFilePath, '../')));
        });
    });

    //服务器部署
    /*$('.config-btn').click(function () {
        util.modalOperateFn({
            title: '请输入部署信息',
            tips: '部署'
        });

        handle.push(function () {
            util.setLocItem('serverConfig', {
                host: $('.host-path').val(),
                user: $('.user-name').val(),
                pass: $('.user-password').val(),
                port: $('.host-port').val(),
                remotePath: $('.remote-path').val()
            });

            util.showLogs('上传文件中ing.........');

            gulp.src('/Users/didi/demo/gulp/test/src/js/**')
                .pipe($$.sftp({
                    host: $('.host-path').val(),
                    user: $('.user-name').val(),
                    pass: $('.user-password').val(),
                    port: $('.host-port').val(),
                    remotePath: $('.remote-path').val(),
                    callback: function () {
                        util.showLogs('文件上传成功.....');
                    }
                }))
                .on('error', function () {
                    util.showLogs('好像出错了?...');
                })
        });
    });*/

    /*$('.upload-btn').click(function () {
        var itemInfo = getItemNode($(this));
        //配置文件路径
        var configFile = path.join(itemInfo.basePath, itemInfo.itemName, 'feWorkFlow.config.json');

        //判断是否存在项目的配置文件
        fs.exists(configFilePath, function (err, stat) {
            console.log(stat);
        });
    });*/

    function getItemNode(node) {
        var prevNode = node.parent().parent().prev();
        return {
            prevNode: prevNode,
            basePath: prevNode.data('file'),
            itemName: prevNode.data('name')
        }
    }
};

//初始化操作
init();

