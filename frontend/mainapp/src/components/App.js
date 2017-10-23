import React, {Component} from 'react';
import withRoot from './withRoot';
import Nav from './Nav';
import axios from 'axios';
import { withStyles } from 'material-ui/styles';
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
        axios.defaults.headers.common['Authorization'] = localStorage.getItem('token') || '';
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        console.log(props.children);
    }
    render() 
    {
        return (
            <div className={this.classes.root}>
                <Nav/>
                {this.props.children}
            </div>
        );
    }
}

export default withRoot(withStyles(styles)(App));