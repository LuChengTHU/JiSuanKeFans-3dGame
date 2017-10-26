"use strict";
var TOKEN_MESSAGE = {
    0: 'Unknown error',
    1: 'Success. Reloading...',
    2: 'Password error',
    3: 'User does not exist',
}
var REGISTER_MESSAGE = {
    0: 'Unknown error',
    1: 'Success. Logging in...',
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
            email: null,
            password: null,
            succ_msgs: [],
            msgs: [],
        },
        watch: {
            msgs: function(val) {
                $('#loginFormModal').modal('show');
                $('#registerFormModal').modal('hide');
            }
        }
    })

    window.registerVm = new Vue({
        el: '#registerFormModal',
        data: {
            email: null,
            password: null,
            succ_msgs: [],
            msgs: [],
        },
        watch: {
            msgs: function(val) {
                $('#registerFormModal').modal('show');
                $('#loginFormModal').modal('hide');
            }
        }
    })


    window.loginForm = $('#loginForm');
    window.registerForm = $('#registerForm');
    bindLogin(loginVm, TOKEN_MESSAGE);
    bindRegister(registerVm, REGISTER_MESSAGE);

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


function bindLogin(formVm, ERROR_MESSAGE)
{
    var frm = loginForm;
    frm.submit(() => {
        formAxios(frm.attr('action'), frm.serialize(), formVm, ERROR_MESSAGE)
        .then(response => {
            if (response && response.data['res_code'] == 1) {
                localStorage.token = response.data['token'];
                localStorage.user = JSON.stringify(response.data['user']);
                formVm.succ_msgs.push(ERROR_MESSAGE[1]);
                location.reload();
            }
        })
        return false;
    });
}

function bindRegister(formVm, ERROR_MESSAGE)
{
    var frm = registerForm;
    frm.submit(() => {
        formAxios(frm.attr('action'), frm.serialize(), formVm, ERROR_MESSAGE)
        .then(response => {
            if (response && response.data['res_code'] == 1) {
                formVm.succ_msgs.push(ERROR_MESSAGE[1]);
                loginVm.email = registerVm.email;
                loginVm.password = registerVm.password;
                //formAxios(frm, formVm, ERROR_MESSAGE)
            }
            return response;
        })
        .then(response => {
            if (response && response.data['res_code'] == 1) {
                loginForm.submit();
            }
            //$('#registerFormModal').modal('toggle');
            //$('#loginFormModal').modal('toggle');
        })
        return false;
    });
}