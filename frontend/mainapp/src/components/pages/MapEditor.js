import GameContainer from '../../containers/GameContainer'
import {TextField, Button, Grid} from 'material-ui'
import React from 'react'
import {Component} from 'react'
import createReactClass from 'create-react-class'

const MapEditor = createReactClass({
    inputValue: '{}', 
    getInitialState: function(){
        const INIT_MAP = { // initial map
            height: 6,
            width: 9,
            nMaxHandBoxes: 4,
            instrSet: [true, true, true],
            initPos: [1, 1],
            finalPos: [1, 2],
            initGroundColors: [[0, 0, 0], [0, 0, 0]],
            finalGroundColors: null,
            initGroundBoxes: [[null, null, null], [null, null, null]],
            finalGroundBoxes: null,
            initHandBoxes: [],
            finalHandBoxes: [],
            initDir:16
        };
        this.inputValue = JSON.stringify(INIT_MAP, null, 4);
        return {map: INIT_MAP};
    },
    render: function(){
        const gameContainer = <GameContainer/>
        this.inputValue = JSON.stringify(this.state.map, null, 4);
        this.inputBox = <TextField onChange={(event) => {this.inputValue = event.target.value}}
            defaultValue={this.inputValue} contentEditable={true} 
                multiline={true} fullWidth={true} rows={30} rowsMax={30}/>;
        return (
            <Grid container spacing={25} justify='center'>
            <Grid item xs={12} sm={6} >
            <div id={'gameContainer'}>
            {gameContainer}</div>
            <Button onClick={() => this.updateMap()}>Update</Button>
            </Grid>
            <Grid item xs={12} sm={6}>
            {this.inputBox}
            </Grid>
            </Grid>
        );
    },
    updateMap: function(){
        let new_map = JSON.parse(this.inputValue);
        window.Game.gameSetMap(new_map);
        this.setState({map: new_map});
    },
    setMap: function(map){
        this.setState({map: map});
    }
});

export default MapEditor;
