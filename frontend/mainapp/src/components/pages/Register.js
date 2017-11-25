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
    1: '注册成功',
    2: '邮箱已存在',
    3: '格式错误',
}

class RegisterFormDialog extends React.Component {
  constructor(props) 
  {
    super(props);
    this.num_msg = 0;
    this.state = {
      username: '',
      email: '',
      password: '',
      messages: []
    };
    this.handleRequestSubmit = this.handleRequestSubmit.bind(this);
  }

  addMessgae(msg)
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
        "username":this.state.username,
        "email":this.state.email,
        "password":this.state.password
    }
    axios.post('user/', payload)
        .then((response) => {
            if(response.data.res_code !== null) {
                this.addMessgae(MESSAGE[response.data.res_code]);
                if (response.data.res_code === 1) {
                    // TODO: response
                }
            }
        })
        .catch((error) => {
            if (error.response !== undefined && error.response.data !== undefined && 
                error.response.data.res_code !== undefined) {
                this.addMessgae(MESSAGE[error.response.data.res_code]);
            } else {
                this.addMessgae(error.toString());
            }

        });
    e.preventDefault();
  };
  handleInputChange = name => event => {
    this.setState({
      [name]: event.target.value,
    });
  };

  render() {
    const { classes, onRequestClose, ...other } = this.props;
    return (
        <Dialog {...other} onRequestClose={onRequestClose}>
          <DialogTitle>注册</DialogTitle>
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
              margin="dense"
              id="username"
              label="用户名"
              type="test"
              value={this.state.username}
              fullWidth
              onChange={this.handleInputChange('username')}
            />
            <TextField
              margin="dense"
              id="email"
              type="email"
              label="邮箱"
              value={this.state.email}
              fullWidth
              onChange={this.handleInputChange('email')}
            />
           <TextField
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
            <Button type={'submit'} color="primary">
              注册
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

export default withStyles(styles)(RegisterFormDialog);