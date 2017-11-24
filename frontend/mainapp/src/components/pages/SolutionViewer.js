import React from 'react'
import createReactClass from 'create-react-class'
import {withStyles} from 'material-ui/styles'
import {fetch_map} from '../../interfaces/Map'
import {fetch_solution} from '../../interfaces/Solution'
import GameContainer from '../../containers/GameContainer'
import BlocklyContainer from '../../containers/BlocklyContainer'
import Button from 'material-ui/Button'
import Grid from 'material-ui/Grid'
import Logic from '../../logic/logic';
import EnhancedInterpreter from '../EnhancedInterpreter';

const SolutionViewer = createReactClass({
    getInitialState: function(){
        this.mapInitialised = false;
        return {};
    },
    render: function(){
        return (
            <Grid container spacing={25} justify='center'>
            <Grid item xs={12} sm={6} >
            <div id={'gameContainer'}>
            <GameContainer gameState={this.state.gameState} gameSetState={()=>{/* Initialize to avoid error */}}
            reportHeight={(h)=>{this.blocklyContainer.resize(h)}}/></div>
            <Button onClick={this.loadSolution}>Load</Button>
            <Button onClick={this.run}>Run</Button>
            </Grid>
            <Grid item xs={12} sm={6}>
            <BlocklyContainer readOnly refCallback={(e)=>{this.blocklyContainer = e;}}
                onLoaded={()=>{
                    if(!this.mapInitialised){
                        this.mapInitialised = true;
                        fetch_solution(this.props.match.params.sol_id).then(
                            (solution) => {
                                this.solution = solution;
                                this.loadSolution();
                            }
                        );
                    }
                }}/>
            </Grid>
            </Grid>
        );
    },
    loadSolution: function(){
        fetch_map(this.solution.map.id).then((/*response*/) => {
            Logic.gameSetMap(window.map);
            this.setState({gameState: "ready"});
            this.blocklyContainer.highlightBlock('');
            this.enhancedInterpreter = new EnhancedInterpreter(window.Game, this.blocklyContainer, this.gameSetState);
        });
        this.blocklyContainer.loadXmlText(this.solution.code);

    },
    run: function(){
        window.Game.gameInit();
        this.setState({gameState: "stepping"});
        this.enhancedInterpreter.loadProgram(this.blocklyContainer.getCode());
        this.enhancedInterpreter.step();
    }
});

export default SolutionViewer;

