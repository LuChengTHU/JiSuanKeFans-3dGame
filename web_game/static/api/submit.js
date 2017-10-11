"use strict;"
TOKEN_ERROR_MESSAGE = {
    0: 'Unknown error',
    2: 'Password error',
    3: 'User does not exist',
}
REGISTER_ERROR_MESSAGE = {
    0: 'Unknown error',
    2: 'Email exists',
    3: 'Data illegal',
}



$(document).ready(function () {
    if (localStorage.token) {
        axios.defaults.headers.common['Authorization'] = "Token " + localStorage.token
    }
    
    /*axios.interceptors.response.use(function (response) {
        // Do something with response data
        console.log(response);
        return response;
        }, function (error) {
        // Do something with response error
        console.log(error);
        return Promise.reject(error);
    });*/
    
    window.vm = new Vue({
        el: '#nav',
        data: {
            user: JSON.parse(localStorage.getItem("user")), 
            token: localStorage.getItem("token"),
        },
        computed: {
            isLoggedIn() {
                return this.token != null;
            }
        }
    })

    window.loginVm = new Vue({
        el: '#loginFormModal',
        data: {
            msgs: [],
        },
    })

    /*window.registerVm = new Vue({
        el: '#registerFormModal',
        data: {
            msgs: null,
        },
    })*/

    bind('loginForm', loginVm, TOKEN_ERROR_MESSAGE);
    //bind('registerForm', registerVm, REGISTER_ERROR_MESSAGE);

    $('#logout-a').on("click",function(){
      //axios.get("{% url 'api:logout' %}");
        console.log('logout-a');
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        // vm.user = null;
        // vm.token = null;

        location.reload();
    });
});


function bind(formid, formVm, ERROR_MESSAGE)
{
    var frm = $('#'+formid);
    frm.submit(function () {
        axios({
            //headers: {'Content-Type': 'application/json'},
            method: frm.attr('method'),
            url: frm.attr('action'),
            data: frm.serialize(),
        })
        .then(function (response) {
            console.log('then ');
            console.log(response.data);
            if (response.data['res_code'] == 1) {
                localStorage.token = response.data['token'];
                localStorage.user = JSON.stringify(response.data['user']);
                // vm.token = localStorage.token;
                // vm.user = response.data['user'];
                //$('#'+formid+'Modal').modal('toggle');
                location.reload();
            } else formVm.msgs.push(ERROR_MESSAGE[response.data['res_code']]);
        })
        .catch(function(error) {
            //TODO: expiration handling
            alert(error + '\nPlease try again.');
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
        });
        return false;
    });
}
/*function bind(formid)
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
}*/
