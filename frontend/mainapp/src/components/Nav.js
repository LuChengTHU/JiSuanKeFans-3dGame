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
    handleClick = (name, value) => () => {
        this.setState({
            [name]: value
        })
    }
    render()
    {
        return (
            <div className={this.classes.root} id="navbar">
            <AppBar position="static">
                <Toolbar>
                <IconButton className={this.classes.menuButton} color="contrast" aria-label="Menu">
                    <MenuIcon />
                </IconButton>
                <Typography type="title" color="inherit" className={this.classes.flex}>
                    JiSuanKeFans
                </Typography>
                <div>
                    <Button color="contrast" onClick={() => {
                        this.setState({loginOpen:false, registerOpen:false});
                        this.props.history.push('/stages');}}>主线关卡</Button>
                </div>
                <div>
                    <Button color="contrast" onClick={() => {
                        this.setState({loginOpen:false, registerOpen:false});
                        this.props.history.push('/allmaps');}}>所有关卡</Button>
                </div>
                <div>
                    <Button color="contrast" onClick={() => {
                        this.setState({loginOpen:false, registerOpen:false});
                        this.props.history.push('/editor');}}>地图编辑器</Button>
                </div>
                { this.props.user ?
                <div>
                    <Button color="contrast" onClick={() => {
                        this.setState({loginOpen:false, registerOpen:false});
                        this.props.history.push('/mymaps/');
                    }}>我的地图</Button>
                </div>
                : ""
                }
                { this.props.user
                ? 
                    <div className="profile">
                    <Button color="contrast" onClick={() => {
                        this.setState({loginOpen:false, registerOpen:false});
                        this.props.history.push('/info');}}>{this.props.user.username}
                        </Button>
                    <Button color="contrast" onClick={(/*e*/) => {
                        localStorage.removeItem("token");
                        if(this.props.onLoginChange) {
                            this.props.onLoginChange(null);
                        }
                        this.props.history.push('/');
                    }}>
                        登出
                    </Button>
                    </div>
                :
                    <div className="login-register">
                    <Button color="contrast" onClick={this.handleClick('loginOpen', true)}>登录</Button>
                    <Button color="contrast" onClick={this.handleClick('registerOpen', true)}>注册</Button>
                    { <LoginFormDialog open={this.state.loginOpen} onRequestClose={this.handleClick('loginOpen', false)} onLogin={this.props.onLoginChange}/> }
                    { <RegisterFormDialog open={this.state.registerOpen} onRequestClose={this.handleClick('registerOpen', false)}/> }
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