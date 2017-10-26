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
            open: false,
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
                {localStorage.getItem('token') ? 
                localStorage.getItem('user')
                :''
                }
                <div>
                    <Button color="contrast" onClick={() => {this.props.history.push('/editor');}}>Map Editor</Button>
                </div>
                <div className="login">
                <Button color="contrast" onClick={(e) => {this.setState({open:true});}}>Login</Button>
                {/* <FormDialog open={this.state.open}/> */}
                </div>
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