import createReactClass from 'create-react-class'
import React from 'react'
import Paper from 'material-ui/Paper'
import {GridListTile, GridListTileBar} from 'material-ui/GridList'
import {withStyles} from 'material-ui/styles'
import Typography from 'material-ui/Typography'
import IconButton from 'material-ui/IconButton'
import LaunchIcon from 'material-ui-icons/Launch'

const styles = function(theme){
    return {
        tile_paper: theme.mixins.gutters({
            position: 'relative',
            float: 'left',
            minHeight: '100px',
            minWidth: '300px',
            overflow: 'hidden',
            height: '100% !important',
        }),
        grid_list_tile: {
            margin: 10
        }
    };
};


const MapLink = createReactClass({
    render: function(){
        return (<GridListTile className={this.props.classes.grid_list_tile} key={this.props.key}>
                <div className={this.props.classes.tile_paper} elevation={3}>
                    <Typography type="headline" align="center">
                        {this.props.map.height} x {this.props.map.width}
                    </Typography>
                </div>
                <GridListTileBar title={this.props.map.title} 
                    subtitle={"by " + this.props.map.author.username}
                    actionIcon={<IconButton onClick={this.props.onClick}><LaunchIcon color="rgba(255, 255, 255, 0.6)"/></IconButton>}/>
            </GridListTile>)
    }
});

export default withStyles(styles)(MapLink);