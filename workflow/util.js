/**
 * Created by XRene on 16/8/26.
 */



module.exports = function ($, gulp, path) {
    return {
        //获取提示信息
        getInfo: function () {
            var tips = {
                title: $(this).data('whatever') ? $(this).data('whatever') : '',
                tips: $(this).data('tips') ? $(this).data('tips') : ''
            };
            return tips;
        },
        //打印日志
        showLogs: function (str) {
            var date = new Date(),
                hours = date.getHours(),
                minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
                seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
            str = $('<p>[' + hours + ':' + minutes + ':' + seconds + '] ' + str + '</p>');
            $('.log-container').append(str);
        },
        //获取目标文件路径
        getDestPath: function (srcPath) {
            var extRegExp = /^.(js|html|css)/,
                matcher = path.extname(srcPath).match(extRegExp);

            var _result = matcher == null ? srcPath.replace(/\/src/, '') : path.dirname(srcPath).replace(/\/src/, '');

            return _result;
        },
        modalOperateFn: function (info) {
            var modal = $('#myModal'),
                title = info.title || '';
            modal.modal();
            modal.find('.modal-title').text(info.title);


            if (title === '压缩完成') {
                $('.uglifyForm').show()
                    .find('input').val('');
                $('.md5Form').hide();
                $('.sftpForm').hide();
                $('.modal-tips').hide();
                $('.itemForm').hide();
            } else if (title === '请输入替换路径') {
                $('.md5Form').show()
                    .find('input').val('');
                $('.uglifyForm').hide();
                $('.sftpForm').hide();
                $('.modal-tips').hide();
                $('.itemForm').hide();
            } else if (title === '请输入部署信息') {
                let serverConfig = JSON.parse(this.getLocItem('serverConfig'));
                $('.host-path').val(serverConfig.host || '');
                $('.remote-path').val(serverConfig.remotePath || '');
                $('.host-port').val(serverConfig.port || '');
                $('.user-name').val(serverConfig.user || '');
                $('.user-password').val(serverConfig.pass || '');


                $('.sftpForm').show();
                $('.md5Form').hide();
                $('.uglifyForm').hide();
                $('.modal-tips').hide();
                $('.itemForm').hide();
            } else if (title === '请输入项目名称') {
                $('.sftpForm').hide();
                $('.md5Form').hide();
                $('.uglifyForm').hide();
                $('.modal-tips').hide();

                $('.itemForm').show();
            } else {
                $('.md5Form').hide();
                $('.uglifyForm').hide();
                $('.sftpForm').hide();
                $('.itemForm').hide();
                $('.modal-tips')
                    .show()
                    .text(info.tips);
                //modal.find('.modal-body').text(info.tips);
            }
        },
        setLocItem(key, value) {
            key = key || '';
            value = value || {};

            let itemValue,
                type = typeof value;
            if (type === 'string' || type === 'number') {
                itemValue = value;
            } else if (Object.prototype.toString.call(value) === '[object Object]') {
                itemValue = JSON.stringify(value);
            } else {
                itemValue = undefined;
            }
            localStorage.setItem(key, itemValue);
        },
        getLocItem(key) {
            return localStorage.getItem(key);
        },
        removeLocItem(key) {
            return localStorage.removeItem(key);
        }
    }
};
