import React from 'react'
import createReactClass from 'create-react-class'
import MapChooser from '../../containers/MapChooser'
import axios from 'axios'
import Typography from 'material-ui/Typography'
import {withStyles} from 'material-ui/styles'

const styles = theme => ({});

const StageGallery = createReactClass({
    mapFetcher: {
        fetch: pageNo => axios.get('map/?pageNo=' + pageNo).then(response =>
            ({
                map_list: response.data.list, has_prev: response.data.has_prev,
                has_next: response.data.has_next
            })
        )
    },
    render: function(){
        return (
            <div>
                <Typography type="title" align="center">所有关卡</Typography> 
                <MapChooser mapFetcher={this.mapFetcher}
                    onClick={(map) => this.props.history.push('/game/' + map.id + '/')} />
            </div>
        );
    }
});


export default withStyles(styles)(StageGallery);
