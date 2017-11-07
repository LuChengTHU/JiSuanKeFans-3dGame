import React, {Component} from 'react';
import withRoot from './withRoot';
import Nav from './Nav';
import axios from 'axios';
import { withStyles } from 'material-ui/styles';
import DashBoard from './pages/DashBoard'
import MapEditor from './pages/MapEditor'
import {Route} from 'react-router-dom'
import MapChooser from '../containers/MapChooser'
import createReactClass from 'create-react-class'
import {createHashHistory} from 'history'

const styles = theme => ({
    root: {
      flexGrow: 1,
    },
  });


//for testing only
const MapListView = createReactClass({
    render: function(){
        return <MapChooser mapFetcher={ {fetch: (page_no)=>
            {
                return axios.get('map/?pageNo=' + page_no).then(function(response){
                    return {map_list: response.data.list, has_prev: response.data.has_prev, 
                        has_next: response.data.has_next};
                    });
            }
        }} onClick={ (map) => this.props.history.push('/editor/' + map.id)}/>;
    }
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
                <Route exact path="/game/:map_id/" component={DashBoard}/>
                <Route exact path="/editor/:map_id/" component={MapEditor}/>
                <Route exact path="/editor/" component={MapEditor}/>
                <Route exact path="/maps/" component={MapListView}/>
                {/* for testing only*/}
                {this.props.children}
            </div>
        );
    }
}

export default withRoot(withStyles(styles)(App));