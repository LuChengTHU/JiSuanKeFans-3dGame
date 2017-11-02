import React, {Component} from 'react';
import withRoot from './withRoot';
import Nav from './Nav';
import axios from 'axios';
import { withStyles } from 'material-ui/styles';
import DashBoard from './pages/DashBoard'
import MapEditor from './pages/MapEditor'
import {Route} from 'react-router-dom'


const styles = theme => ({
    root: {
      flexGrow: 1,
    },
  });
class App extends Component {
    constructor(props)
    {
        super(props);
        this.classes = props.classes;
        axios.defaults.baseURL = 'http://localhost:8000/api/v0.1';
        axios.defaults.headers.common['Authorization'] = 'Token ' + localStorage.getItem('token') || '';
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    render() 
    {
        return (
            <div className={this.classes.root}>
                <Nav/>
                <Route exact path="/" component={DashBoard}/>
                <Route exact path="/editor" component={MapEditor}/>
                {this.props.children}
            </div>
        );
    }
}

export default withRoot(withStyles(styles)(App));