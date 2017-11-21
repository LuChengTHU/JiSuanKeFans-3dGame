import React from 'react'
import createReactClass from 'create-react-class'
import {withStyles} from 'material-ui/styles'
import {fetch_map} from '../../interfaces/Map'
import {fetch_solution} from '../../interfaces/Solution'
import GameContainer from '../../containers/GameContainer'
import BlocklyContainer from '../../containers/BlocklyContainer'
import Button from 'material-ui/Button'
import Grid from 'material-ui/Grid'

const SolutionViewer = createReactClass({
    getInitialState: function(){
        fetch_solution(this.props.match.params.sol_id).then(
            (solution) => {
                this.solution = solution;
            }
        );
        return {};
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
        fetch_map(this.solution.map.id).then(function(response){
            window.Game.gameSetMap(window.map);
        });
    }
});

export default SolutionViewer;

