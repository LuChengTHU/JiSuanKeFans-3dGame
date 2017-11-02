import GameContainer from '../../containers/GameContainer'
import {TextField, Button, Grid} from 'material-ui'
import React from 'react'
import {Component} from 'react'
import createReactClass from 'create-react-class'
import {fetch_map, create_map, modify_map} from '../../interfaces/Map'

const MapEditor = createReactClass({
    getInitialState: function(){
        // const INIT_MAP = { // initial map
        //     height: 6,
        //     width: 9,
        //     nMaxHandBoxes: 4,
        //     instrSet: [true, true, true],
        //     initPos: [1, 1],
        //     finalPos: [1, 2],
        //     initGroundColors: [[0, 0, 0], [0, 0, 0]],
        //     finalGroundColors: null,
        //     initGroundBoxes: [[null, null, null], [null, null, null]],
        //     finalGroundBoxes: null,
        //     initHandBoxes: [],
        //     finalHandBoxes: [],
        //     initDir:16
        // };
        const INIT_MAP = { // initial map
            title: 'Untitled',
            height: 6,
            width: 9,
            n_max_hand_boxes: 4,
            n_blockly: 10,
            instr_set: [true, true, true],
            init_AI_infos: [],
            init_pos: [1, 1],
            final_pos: [1, 2],
            init_ground_colors: [[0, 0, 0], [0, 0, 0]],
            final_ground_colors: null,
            init_ground_boxes: [[null, null, null], [null, null, null]],
            final_ground_boxes: null,
            init_hand_boxes: [],
            final_hand_boxes: [],
            init_dir:16
        };

        let map = INIT_MAP;
        window.map = map;
        if('map_id' in this.props.match.params){
            this.map_id = this.props.match.params['map_id'];
            fetch_map(this.map_id).then(()=>{if('map' in window){
                map = window.map;
                this.setState({inputText: JSON.stringify(map, null, 4)});
            }});
        } else{
            this.map_id = -1;
        }
        return {inputText: JSON.stringify(map, null, 4)};
    },
    handleTextChange: function(event){
        this.setState({inputText: event.target.value});
    },
    render: function(){
        const gameContainer = <GameContainer/>;
        this.inputBox = <TextField onChange={this.handleTextChange}
            value={this.state.inputText} 
            multiline={true} fullWidth={true} rows={30} rowsMax={30}/>;
        return (
            <Grid container spacing={25} justify='center'>
            <Grid item xs={12} sm={6} >
            <div id={'gameContainer'}>
            {gameContainer}</div>
            <Button onClick={() => this.updateMap()}>Update</Button>
            <Button onClick={() => this.submitMap()}>Submit</Button>
            </Grid>
            <Grid item xs={12} sm={6}>
            {this.inputBox}
            </Grid>
            </Grid>
        );
    },
    updateMap: function(){
        let new_map = JSON.parse(this.state.inputText);
        console.log(new_map);
        window.map = new_map;
        window.Game.gameSetMap(new_map);
    },
    setMap: function(map){
        window.map = map;
        window.gameSetMap(map);
    },
    submitMap: function(){
        if(this.map_id == -1){
            create_map(window.map);
        } else{
            modify_map(this.map_id, window.map);
        }
    }
});

export default MapEditor;
