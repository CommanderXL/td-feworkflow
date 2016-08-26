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
        showLogs: function(str) {
            var date = new Date(),
                hours = date.getHours(),
                minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes(),
                seconds = date.getSeconds() < 10 ? '0' + date.getSeconds() : date.getSeconds();
            str = $('<p>[' + hours + ':' + minutes + ':' + seconds + '] ' + str +'</p>');
            $('.log-container').append(str);
        },
        //获取目标文件路径
        getDestPath: function(srcPath) {
            var extRegExp = /^.(js|html|css)/,
                matcher = path.extname(srcPath).match(extRegExp);

            var _result =  matcher == null ? srcPath.replace(/\/src/, '') : path.dirname(srcPath).replace(/\/src/, '');

            return _result;
        },
        modalOperateFn: function(info) {
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
        }
    }
};
