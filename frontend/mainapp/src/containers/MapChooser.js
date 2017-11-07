import createReactClass from 'create-react-class'
import React from 'react'
import MapLink from '../components/MapLink'
import {GridList} from 'material-ui/GridList'
import {withStyles} from 'material-ui/styles'

const styles = function(theme){
    return {
        map_chooser:{
            height: 300,
            width: 800
        }
    };
};

const MapChooser = createReactClass(
    {
        getInitialState: function(props){
            return {pageNo: 1, ready: false, mapList: []};
        },
        
        loadMapList: function(){
            this.props.mapFetcher.fetch(this.state.pageNo).then( (map_list) =>
                this.setState({mapList: map_list, ready: true})
            );
        },

        render: function(){
            if(!this.state.ready){
                this.loadMapList();
                return (<div>
                    Loading...
                </div>);
            }
            // const maplink_list = 
            return (<GridList cols={2} cellHeight={140} spacing={3} className={this.props.classes.map_chooser}>
                {this.state.mapList.map((map) => <MapLink key={map.id} map={map}
                onClick={() => this.props.onClick(map)}/>)}</GridList>);
            // return (<div>{maplink_list}</div>);
        }
    }
);


export default withStyles(styles)(MapChooser);
