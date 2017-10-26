// @flow weak

import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import Typography from 'material-ui/Typography';
import Button from 'material-ui/Button';
import IconButton from 'material-ui/IconButton';
import MenuIcon from 'material-ui-icons/Menu';
import LoginFormDialog from './pages/Login.js';
import RegisterFormDialog from './pages/Register.js';
import {withRouter} from 'react-router-dom'
// import FormDialog from './Login.js';

const styles = theme => ({
  root: {
    marginTop: 0,//theme.spacing.unit * 3,
    marginBottom: theme.spacing.unit * 3,
    width: '100%',
  },
  flex: {
    flex: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
});

class Nav extends Component {
    constructor(props) 
    {
        super(props);
        const { classes } = props;
        this.classes = classes;
        this.state = {
            loginOpen: false,
            registerOpen: false,
            links: props.links ? props.links : []
        }
    }
    render()
    {
        return (
            <div className={this.classes.root}>
            <AppBar position="static">
                <Toolbar>
                <IconButton className={this.classes.menuButton} color="contrast" aria-label="Menu">
                    <MenuIcon />
                </IconButton>
                <Typography type="title" color="inherit" className={this.classes.flex}>
                    Title
                </Typography>
                <div>
                    <Button color="contrast" onClick={() => {this.props.history.push('/editor');}}>地图编辑器</Button>
                </div>
                {localStorage.getItem('token') ? 
                <div className="profile">
                {JSON.parse(localStorage.getItem('user'))['username']}
                <Button color="contrast" onClick={(e) => {
                    localStorage.removeItem("token");
                    localStorage.removeItem("user");
                    window.location.reload();
                    }
                }>
                    登出
                </Button>
                </div>
                :
                <div className="login-register">
                <Button color="contrast" onClick={(e) => {
                    this.setState({loginOpen:true, registerOpen:false});
                    console.log('login');
                    }}>登录</Button>
                <Button color="contrast" onClick={(e) => {
                    this.setState({registerOpen:true, loginOpen:false});
                    console.log('register');
                    }}>注册</Button>
                { <LoginFormDialog open={this.state.loginOpen}/> }
                { <RegisterFormDialog open={this.state.registerOpen}/> }
                </div>
                }
                </Toolbar>
            </AppBar>
            </div>
        );
    }
}

Nav.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withRouter(withStyles(styles)(Nav));