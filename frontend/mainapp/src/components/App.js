import React, {Component} from 'react';
import withRoot from './withRoot';
import Nav from './Nav';
import axios from 'axios';
import { withStyles } from 'material-ui/styles';
import DashBoard from './pages/DashBoard'
import MapEditor from './pages/MapEditor'
import {Route} from 'react-router-dom'
import StageGallery from './pages/StageGallery'
import MapLibrary from './pages/MapLibrary'
import SolutionViewer from './pages/SolutionViewer'
import InfoModify from './pages/InfoModify'
import {PleaseLogin, PrivateRoute} from '../utils/Permission'

const styles = (/*theme*/) => ({
    root: {
      flexGrow: 1,
    },
  });

class App extends Component {
    constructor(props)
    {
        super(props);
        this.classes = props.classes;
        if(typeof(process.env.REACT_APP_AC_BACKEND) === 'undefined')
            axios.defaults.baseURL = 'http://localhost:8000/api/v0.1';
        else
            axios.defaults.baseURL = process.env.REACT_APP_AC_BACKEND + '/api/v0.1';
        axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded';
        if(localStorage.getItem('user')){
            this.state = {
                user: JSON.parse(localStorage.getItem('user')),
                token: localStorage.getItem('token')
            };
            axios.defaults.headers.common['Authorization'] = 'Token ' + localStorage.getItem('token');
        } else{
            this.state = {
                user: null,
                token: null
            };
            axios.defaults.headers.common['Authorization'] = '';
        }


        this.onLoginChange = this.onLoginChange.bind(this);
    }

    onLoginChange(){
        if(localStorage.getItem('user')){
            this.setState({
                user: JSON.parse(localStorage.getItem('user')),
                token: localStorage.getItem('token')
            });
            axios.defaults.headers.common['Authorization'] = 'Token ' + localStorage.getItem('token');
        } else{
            this.setState({
                user: null,
                token: null
            });
            axios.defaults.headers.common['Authorization'] = '';
        }

    }

    render() 
    {
        return (
            <div className={this.classes.root}>
                <Nav user={this.state.user} onLoginChange={this.onLoginChange}/>
                <Route exact path="/game/:map_id/" component={DashBoard}/>
                <PrivateRoute exact path="/editor/:map_id/" component={MapEditor}/>
                <PrivateRoute exact path="/editor/" component={MapEditor}/>
                <Route exact path="/solution/:sol_id/" component={SolutionViewer}/>
                <Route path="/login" component={PleaseLogin}/>
                <Route exact path="/searchmaps/:author_id/" component={StageGallery}/>
                <Route exact path="/allmaps/" component={(props) => <StageGallery
                    user={this.state.user} {...props}/>}/>
				<Route exact path="/stages/" component={(props) => <StageGallery
                         user={this.state.user} author_id={1} {...props}/>}/>
                <PrivateRoute exact path="/info/" component={InfoModify}/>
                {this.state.user ?
                    <Route exact path="/mymaps/" component={(props) => <MapLibrary
                         author={this.state.user} self={true} {...props}/>}/>
                    : ""
                }
                {/* for testing only*/}
                {this.props.children}
            </div>
        );
    }
}

export default withRoot(withStyles(styles)(App));