import createReactClass from 'create-react-class'
import React from 'react'
import MapLink from '../components/MapLink'
import {GridList} from 'material-ui/GridList'
import {withStyles} from 'material-ui/styles'
import Button from 'material-ui/Button'
import Grid from 'material-ui/Grid'

const styles = function(/*theme*/){
    return {
        map_chooser:{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-around',
            overflow: 'hidden'
        },
        nav_button: {
            width: '100%'
        }
    };
};

const MapChooser = createReactClass(
    {
        getInitialState: function(/*props*/){
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
                    <Grid container spacing={8}>
                        <Grid item xs={12}>
                            <GridList cols={2} cellHeight={140} spacing={3} className={this.props.classes.map_chooser}>
                                {this.state.mapList.map((map) => <MapLink key={map.id} map={map}
                                onClick={() => this.props.onClick(map)}/>)}
                            </GridList>
                        </Grid>
                        <Grid item xs={12}>
                            <Grid container spacing={8} justify="center">
                                <Grid item xs={12} sm={1}>
                                    <Button className={this.props.classes.nav_button} onClick={this.goToPrev} disabled={!this.state.hasPrev}>&larr;</Button>
                                </Grid>
                                <Grid item xs={12} sm={1}>
                                    <Button className={this.props.classes.nav_button} onClick={this.goToNext} disabled={!this.state.hasNext}>&rarr;</Button>
                                </Grid>
                            </Grid>
                        </Grid>
                    </Grid>
                </div>
                );
        },
        goToPrev: function(){
            this.setState({pageNo: this.state.pageNo - 1, ready: false});
        },
        goToNext: function(){
            this.setState({pageNo: this.state.pageNo + 1, ready: false});
        }

    }
);


export default withStyles(styles)(MapChooser);
