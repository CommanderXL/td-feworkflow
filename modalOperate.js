/**
 * Created by XRene on 16/8/22.
 */


var $ = require('jquery'),
    bootstrap = require('bootstrap');


//modal控制函数
//info modal需要显示的信息
module.exports = function (info) {
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