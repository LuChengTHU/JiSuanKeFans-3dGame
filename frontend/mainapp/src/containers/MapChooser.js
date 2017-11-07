import createReactClass from 'create-react-class'
import React from 'react'
import MapLink from '../components/MapLink'
import {GridList} from 'material-ui/GridList'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'

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
            this.props.mapFetcher.fetch(this.state.pageNo).then( (data) =>
                this.setState({mapList: data.map_list, 
                    hasPrev: data.has_prev,
                    hasNext: data.has_next,
                    ready: true})
            );
        },

        render: function(){
            if(!this.state.ready){
                this.loadMapList();
                return (<div>
                    Loading...
                </div>);
            }
            return (
                <div>
                    <GridList cols={2} cellHeight={140} spacing={3} className={this.props.classes.map_chooser}>
                        {this.state.mapList.map((map) => <MapLink key={map.id} map={map}
                        onClick={() => this.props.onClick(map)}/>)}
                    </GridList>
                    <span><Button onClick={this.goToPrev} disabled={!this.state.hasPrev}>&larr;</Button></span>
                    <span><Button onClick={this.goToNext} disabled={!this.state.hasNext}>&rarr;</Button></span>
                </div>
                );
        },
        goToPrev: () => this.setState({pageNo: this.state.pageNo - 1, ready: false}),
        goToNext: () => this.setState({pageNo: this.state.pageNo + 1, ready: false})

    }
);


export default withStyles(styles)(MapChooser);
