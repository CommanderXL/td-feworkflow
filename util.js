/**
 * Created by XRene on 16/8/22.
 */

var $ = require('jquery'),
    path = require('path');

module.exports = {
    //获取提示信息
    getInfo: function () {
        var tips = {
            title: $(this).data('whatever') ? $(this).data('whatever') : '',
            tips: $(this).data('tips') ? $(this).data('tips') : ''
        };
        return tips;
    },
    //获取目标文件路径
    getDestPath: function (srcPath) {
        var extRegExp = /^.(js|html|css)/,
            matcher = path.extname(srcPath).match(extRegExp);

        var _result =  matcher == null ? srcPath.replace(/\/src/, '') : path.dirname(srcPath).replace(/\/src/, '');

        return _result;
    }
};
