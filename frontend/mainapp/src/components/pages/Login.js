/* eslint-disable flowtype/require-valid-file-annotation */

import React from 'react';
import Button from 'material-ui/Button';
import TextField from 'material-ui/TextField';
import { SnackbarContent } from 'material-ui/Snackbar';
import Snackbar from 'material-ui/Snackbar';
import { withStyles } from 'material-ui/styles';
import { red, purple } from 'material-ui/colors';
import IconButton from 'material-ui/IconButton';
import CloseIcon from 'material-ui-icons/Close';
import Dialog, {
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from 'material-ui/Dialog';
import axios from 'axios';

const danger = red[500]; // #F44336
const accent = purple['A200']; // #E040FB
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
    0: 'Unknown error',
    1: 'Success. Reloading...',
    2: 'Password error',
    3: 'User does not exist',
}

class LoginFormDialog extends React.Component {
  constructor(props) 
  {
    super(props);
    this.num_msg = 0;
    this.state = {
      open: props.open,
      email: '',
      password: '',
      messages: []
    };
    const { classes } = props;
    this.classes = classes;
    this.handleRequestLogin = this.handleRequestLogin.bind(this);
  }

  handleRequestClose = () => {
    this.setState({ open: false });
  };

  addMessgae(msg)
  {
    this.setState((prevState, props) => {
        prevState.messages.push([msg, this.num_msg++]);
        return { messages: prevState.messages };
    });
  }

  removeMessage(msg)
  {
    this.setState((prevState, props) => {
        const messages = prevState.messages.filter(item => item !== msg);
        return { messages: messages };
    });
  }

  handleRequestLogin = (e) => {
    let payload={
        "email":this.state.email,
        "password":this.state.password
    }
    console.log(payload);
    axios.post('token/', payload)
        .then((response) => {
            console.log(response);
            if(response.data.res_code !== null) {
                this.addMessgae(MESSAGE[response.data.res_code]);
                if (response.data.res_code === 1) {
                    localStorage.token = response.data['token'];
                    localStorage.user = JSON.stringify(response.data['user']);
                    window.location.reload();
                }
            }
        })
        .catch((error) => {
            console.log(error)
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


  componentWillReceiveProps(nextProps)
  {
    if (this.state.open !== nextProps.open) {
        this.setState({ open: nextProps.open});
    }
  }

  render() {
    return (
      <div>
        {/* <Button onClick={this.handleClickOpen}>Open form dialog</Button> */}
            {/* <Snackbar 
                anchorOrigin={{
                    vertical: 'top',
                    horizontal: 'center',
                }}
                message={this.state.message}
                autoHideDuration={1000}
                onRequestClose={()=>{this.setState({ message:  ''})}}
                open={this.state.message !== ''}
            /> */}
        <Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
          <DialogTitle>Login</DialogTitle>
          {this.state.messages.map((message) => {
            return <SnackbarContent key={message[1]} 
                className={this.classes.snackbar}
                message={message[0]}
                action={
                    <Button className={this.classes.dialogContent.cancleButton} dense onClick={() => {this.removeMessage(message)} }>
                    关闭
                    </Button>
                }
            />
          })}
          <form onSubmit={this.handleRequestLogin}>
          <DialogContent className={this.classes.dialogContent}>
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
            <Button type={'submit'} color="primary">
              登录
            </Button>
            <Button onClick={this.handleRequestClose} color="primary">
              取消
            </Button>
          </DialogActions>
          </form>
        </Dialog>
      </div>
    );
  }
}

export default withStyles(styles)(LoginFormDialog);