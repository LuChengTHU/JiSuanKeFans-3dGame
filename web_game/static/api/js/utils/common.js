"use strict";
window.formAxios = function(action, data, formVm, ERROR_MESSAGE) {
    return axios({
        //headers: {'Content-Type': 'application/json'},
        method: 'POST',
        url: action,
        data: data,
    })
    .then(function (response) {
        console.log('then ');
        console.log(response.data);
        if (response.data['res_code'] == 1) {
            // vm.token = localStorage.token;
            // vm.user = response.data['user'];
            //$('#'+formid+'Modal').modal('toggle');
            //location.reload();
        } else {
            formVm.msgs.push(ERROR_MESSAGE[response.data['res_code']]);
        }
        return response;
    })
    .catch(function(error) {
        //TODO: expiration handling
        //alert(error + '\nPlease try again.');
            formVm.msgs.push(error + '\nPlease try again.');
        if (error.response) {
            // The request was made and the server responded with a status code
            // that falls out of the range of 2xx
            console.log(error.response.data);
            console.log(error.response.status);
            console.log(error.response.headers);
            if (error.response.data['res_code']) {
                formVm.msgs.push(ERROR_MESSAGE[response.data['res_code']]);
            }
        } else if (error.request) {
            // The request was made but no response was received
            // `error.request` is an instance of XMLHttpRequest in the browser and an instance of
            // http.ClientRequest in node.js
            console.log(error.request);
        } else {
            // Something happened in setting up the request that triggered an Error
            console.log('Error', error.message);
        }
        console.log(error.config);
        //frm.html(data['formHTML']);
    })
}