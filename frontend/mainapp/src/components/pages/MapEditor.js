import EditorGameContainer from '../../containers/EditorGameContainer'
import {TextField, Button, Grid} from 'material-ui'
import React from 'react'
import {Component} from 'react'
import createReactClass from 'create-react-class'
import {fetch_map, create_map, modify_map} from '../../interfaces/Map'
import Checkbox from 'material-ui/Checkbox'
import {FormControlLabel} from 'material-ui/Form'

const INIT_MAP = { // initial map
    title: 'Untitled',
    height: 10,
    width: 10,
    n_max_hand_boxes: 4,
    n_blockly: 10,
    instr_set: [
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
        true, true, true, 
    ],
    init_AI_infos: [],
    init_pos: [1, 1],
    final_pos: [1, 2],
    init_ground_colors: [[0, 0, 0], [0, 0, 0]],
    final_ground_colors: null,
    init_ground_boxes: [[null, null, null], [null, null, null]],
    final_ground_boxes: null,
    init_hand_boxes: [],
    final_hand_boxes: [],
    init_dir:16,
    failed_msg: 'Failed!',
    passed_msg: 'Passed!',
    std_blockly_code: '',
    welcome_msg: 'Welcome!',
    shared: false
};


const MapEditor = createReactClass({
    getInitialState: function(){
        this.mapInitialised = false;

        return {inputText: JSON.stringify(INIT_MAP, null, 4), map_id : -1, mapShared : false,
            mapSharedSetting: false};
    },
    handleTextChange: function(event){
        this.setState({inputText: event.target.value});
    },
    render: function(){
        const editorGameContainer = <EditorGameContainer 
            ref = {val => {this.refGame = val} }
            onLoaded={() => {
            if(!this.mapInitialised){
                this.mapInitialised = true;
                window.map = INIT_MAP;
                if('map_id' in this.props.match.params){
                    const map_id = this.props.match.params.map_id;
                    fetch_map(map_id).then(()=>{
                        if('map' in window)
                        {
                            window.Game.gameSetMap(window.map);
                            this.setState({inputText: JSON.stringify(window.map, null, 4), 
                                map_id : map_id,
                                mapShared : window.map.shared,
                                mapSharedSetting : window.map.shared});
                        }
                    });
                } else{
                    window.Game.gameSetMap(window.map);
                    this.setState({inputText: JSON.stringify(window.map, null, 4)});
                }
            }
        }}/>;
        this.inputBox = <TextField onChange={this.handleTextChange}
            value={this.state.inputText} 
            multiline={true} fullWidth={true} rows={30} rowsMax={30}/>;
        return (
            <Grid container spacing={25} justify='center'>
            <Grid item xs={12} sm={6} >
            <div>
                <Button onClick={() => this.updateMap()}>Update</Button>
                <Button onClick={() => this.submitMap()}>Submit</Button>
                <FormControlLabel control={
                    <Checkbox checked={this.state.mapSharedSetting}
                            onChange={(event) => {
                                this.setState({mapSharedSetting : event.target.checked});
                                window.map.shared = event.target.checked;
                            }}/>}
                     label="分享地图"/>
                {this.state.mapShared ? "已经分享" : ""}
            </div>

            <div id={'editorGameContainer'}>
            {editorGameContainer}</div>
            </Grid>
            <Grid>
                <div>
                    <Button onClick={() => this.choosePlayer()}> Player </Button>
                </div>
                <div>
                    <Button onClick={() => this.chooseTarget()}> Target </Button>
                </div>
                <div>
                    <Button onClick={() => this.chooseMonster()}> Monster </Button>
                </div>
            </Grid>
            {/* <Grid>
            {this.inputBox}
            </Grid> */}
            </Grid>
        );
    },
    updateMap: function(){
        const new_map = JSON.parse(this.state.inputText);
        window.map = new_map;
        window.Game.gameSetMap(new_map);
    },
    setMap: function(map){
        window.map = map;
        window.gameSetMap(map);
    },
    submitMap: function(){
        if(this.state.map_id == -1){
            create_map(window.map).then(map_id => {
                window.alert('New map ' + map_id + ' created!');
                this.setState({map_id : map_id, mapShared : window.map.shared});
            });
        } else{
            modify_map(this.state.map_id, window.map);
            this.setState({mapShared : window.map.shared})
        }
    },
    choosePlayer: function() {
        this.refGame.setState({
            selected: "Player"
        })
    },
    chooseMonster: function() {
        this.refGame.setState({
            selected: "Monster"
        })
    },
    chooseTarget: function() {
        this.refGame.setState({
            selected: "Target"
        })

    },
});

export default MapEditor;