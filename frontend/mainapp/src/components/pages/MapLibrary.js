import React from 'react'
import createReactClass from 'create-react-class'
import axios from 'axios'
import {withStyles} from 'material-ui/styles'
import MapChooser from '../../containers/MapChooser'
import Typography from 'material-ui/Typography'

const styles = theme => ({});

const MapLibrary = createReactClass({
    mapFetcher: {
        fetch: pageNo => {
            return axios.get('/map/', {params: {pageNo: pageNo, 
                authorId:JSON.parse(localStorage.getItem('user'))['id']}}).then(response => ({
                has_prev: response.data.has_prev,
                has_next: response.data.has_next,
                map_list: response.data.list
            }))
        }// TODO the backend interface has not been set up supporting this
    },
    render: function(){
        return (
            <div>
                <Typography type="title" align="center">地图库</Typography>
                <MapChooser mapFetcher={this.mapFetcher} onClick={(map) => this.props.history.push('/editor/' + map.id + '/')}/>
            </div>
        );
    }
});

export default withStyles(styles)(MapLibrary);

