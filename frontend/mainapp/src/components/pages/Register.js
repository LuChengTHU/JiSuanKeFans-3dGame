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
    1: 'Success. Please confirm via the email then login.',
    2: 'Email exists',
    3: 'Data illegal',
}

class RegisterFormDialog extends React.Component {
  constructor(props) 
  {
    super(props);
    this.num_msg = 0;
    this.state = {
      open: props.open,
      username: '',
      email: '',
      password: '',
      messages: []
    };
    const { classes } = props;
    this.classes = classes;
    this.handleRequestSubmit = this.handleRequestSubmit.bind(this);
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

  handleRequestSubmit = (e) => {
    let payload={
        "username":this.state.username,
        "email":this.state.email,
        "password":this.state.password
    }
    console.log(payload);
    axios.post('user/', payload)
        .then((response) => {
            console.log(response);
            if(response.data.res_code !== null) {
                this.addMessgae(MESSAGE[response.data.res_code]);
                if (response.data.res_code === 1) {
                    // localStorage.token = response.data['token'];
                    // localStorage.user = JSON.stringify(response.data['user']);
                    // window.location.reload();
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
        <Dialog open={this.state.open} onRequestClose={this.handleRequestClose}>
          <DialogTitle>注册</DialogTitle>
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
          <form onSubmit={this.handleRequestSubmit}>
          <DialogContent className={this.classes.dialogContent}>
          <TextField
            required={true}
            margin="dense"
            id="username"
            label="用户名"
            value={this.state.username}
            fullWidth
            onChange={this.handleInputChange('username')}
          />
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
              注册
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

export default withStyles(styles)(RegisterFormDialog);