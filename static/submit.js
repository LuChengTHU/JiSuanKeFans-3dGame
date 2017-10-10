'use strict';
function bind(formid)
{
    var frm = $('#'+formid);
    frm.submit(function () {
        $.ajax({
            type: frm.attr('method'),
            url: frm.attr('action'),
            data: frm.serialize(),
            dataType: 'json',
            success: function (data) {
                if (data['res_code'] == 1)
                    location.reload();
                else frm.html(data['formHTML']);
            },
            error: function(data) {
                frm.html(data['formHTML']);
            }
        });
        return false;
    });
}