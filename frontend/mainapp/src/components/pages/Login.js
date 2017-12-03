/* eslint-disable flowtype/require-valid-file-annotation */

import React from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { SnackbarContent } from 'material-ui/Snackbar';
import { withStyles } from 'material-ui/styles';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogTitle,
} from 'material-ui/Dialog';
import axios from 'axios';

const styles = theme => ({
    snackbar: {
        margin: theme.spacing.unit,
        background: theme.background.fancy,//'linear-gradient(45deg, #FE6B8B 30%, #FF8E53 90%)',
        //color: danger
    },
    dialogContent: {
        '&:first-child': {
            paddingTop: theme.spacing.unit * 0,
        },
        cancleButton: {
            color: theme.palette.common.black
        }
    }
})
const MESSAGE = {
    0: '未知错误',
    1: '登录成功',
    2: '密码错误',
    3: '用户不存在',
}

class LoginFormDialog extends React.Component {
  constructor(props) 
  {
    super(props);
    this.muiName = 'Dialog';
    //Object.assign(this, {classes})
    this.num_msg = 0;
    this.state = {
      email: '',
      password: '',
      messages: []
    };
    this.handleRequestSubmit = this.handleRequestSubmit.bind(this);
    this.handleRequestForget = this.handleRequestForget.bind(this);
  }

  addMessage(msg)
  {
    this.setState((prevState/*, props*/) => {
        prevState.messages.push([msg, this.num_msg++]);
        return { messages: prevState.messages };
    });
  }

  removeMessage(msg)
  {
    this.setState((prevState/*, props*/) => {
        const messages = prevState.messages.filter(item => item !== msg);
        return { messages: messages };
    });
  }

  handleRequestSubmit = (e) => {
    const payload={
        "email":this.state.email,
        "password":this.state.password
    }
    axios.post('token/', payload)
        .then((response) => {
            if(response.data.res_code !== null) {
                this.addMessage(MESSAGE[response.data.res_code]);
                if (response.data.res_code === 1) {
                    localStorage.token = response.data['token'];
                    if(this.props.onLogin)
                        this.props.onLogin(response.data.user);
                    this.props.onRequestClose();
                }
            }
        })
        .catch((error) => {
            if (error.response !== undefined && error.response.data !== undefined && 
                error.response.data.res_code !== undefined) {
                this.addMessage(MESSAGE[error.response.data.res_code]);
            } else {
                this.addMessage(error.toString());
            }

        });
        e.preventDefault();
    };

  handleRequestForget = (e) => {
    const payload={
        "email":this.state.email
    }
    axios.post('forget/', payload).then((response) => {
        if(response.data.res_code === 1)
            this.addMessage("已经申请找回密码，请查收邮件！");
        else
            this.addMessage("发生错误，请稍后重试！");
    }).catch(() => {
        this.addMessage("发生错误，请稍后重试！");
    });

    e.preventDefault();
  }

  myUpdate(newState) {
      this.setState(newState);
  }
  handleInputChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { classes, onRequestClose, ...other } = this.props;
    return (
        <Dialog {...other} onRequestClose={onRequestClose} >
          <DialogTitle>登录</DialogTitle>
          {this.state.messages.map((message) => {
            return <SnackbarContent key={message[1]} 
                className={classes.snackbar}
                message={message[0]}
                action={
                    <Button className={classes.dialogContent.cancleButton} dense onClick={() => {this.removeMessage(message)} }>
                    关闭
                    </Button>
                }
            />
          })}
          <form onSubmit={this.handleRequestSubmit}>
          <DialogContent className={classes.dialogContent}>
            <TextField
              required={true}
              margin="dense"
              id="email"
              type="email"
              label="邮箱"
              value={this.state.email}
              fullWidth
              onChange={this.handleInputChange('email')}
            />
           <TextField
              required={true}
              margin="dense"
              id='password'
              type = "password"
              label="密码"
              value={this.state.password}
              fullWidth
              onChange={this.handleInputChange('password')}
             />
          </DialogContent>
          <DialogActions>
            <Button onClick={this.handleRequestForget} color="primary">
              重置密码
            </Button>
            <Button type={'submit'} color="primary">
              登录
            </Button>
            <Button onClick={onRequestClose} color="primary">
              取消
            </Button>
          </DialogActions>
          </form>
        </Dialog>
    );
  }
}

export default withStyles(styles)(LoginFormDialog);