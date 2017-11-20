import React from 'react'
import createReactClass from 'create-react-class'
import {withStyles} from 'material-ui/styles'
import {fetch_map} from '../../interfaces/Map'
import GameContainer from '../../containers/GameContainer'
import BlocklyContainer from '../../containers/BlocklyContainer'

const SolutionViewer = createReactClass({
    getInitialState: function(props){
        
    },
    render: function(){
        return (
            <Grid container spacing={25} justify='center'>
            <Grid item xs={12} sm={6} >
            <div id={'gameContainer'}>
            <GameContainer/></div>
            <Button onClick={() => this.loadMap()}>Load</Button>
            </Grid>
            <Grid item xs={12} sm={6}>
            <BlocklyContainer/>
            </Grid>
            </Grid>
        );
    },
    loadMap: function(){
        const map = fetch_map(this.props.solution.map.id);
        window.gameSetMap(map);
    }
});

export default SolutionViewer;

