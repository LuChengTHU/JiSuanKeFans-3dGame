import EditorGameContainer from '../../containers/EditorGameContainer'
import {TextField, Button, Grid} from 'material-ui'
import Select from 'react-select';
import React from 'react'
import createReactClass from 'create-react-class'
import {fetch_map, create_map, modify_map} from '../../interfaces/Map'
import Checkbox from 'material-ui/Checkbox'
import {FormControlLabel} from 'material-ui/Form'
import 'react-select/dist/react-select.css';
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

        return {
            inputText: JSON.stringify(INIT_MAP, null, 4),
            mapName: INIT_MAP.title,
            aiName: "naive", map_id : -1, mapShared : false,mapSharedSetting: false
        };
    },
    handleTextChange: function(event){
        this.setState({inputText: event.target.value});
    },
    render: function(){
        const editorGameContainer = <EditorGameContainer 
            ref = {val => {this.refGame = val} }
            aiName = {this.state.aiName}
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
                            this.setState({
                                inputText: JSON.stringify(window.map, null, 4),
                                mapName: window.map.title, 
                                map_id : map_id,
                                mapShared : window.map.shared,
                                mapSharedSetting : window.map.shared
                            });
                            this.map_id = map_id;
                        }
                    });
                } else{
                    window.Game.gameSetMap(window.map);
                    this.setState({
                        inputText: JSON.stringify(INIT_MAP, null, 4),
                        mapName: INIT_MAP.title
                    });
                    this.map_id = -1;
                }
            }
        }}/>;
        this.inputBox = <TextField onChange={this.handleTextChange}
            value={this.state.inputText} 
            multiline={true} fullWidth={true} rows={30} rowsMax={30}/>;
        return (
            <Grid container spacing={25} justify='center'>
            <Grid item xs={12} sm={9} >
            <div>
            {/*<Button onClick={() => this.updateMap()}>Update</Button>*/}
            </div>

            <div id={'editorGameContainer'}>
            {editorGameContainer}</div>
            </Grid>
            <Grid item xs={12} sm={3} >
                <div>
                    地图名字：
                    <TextField onChange={
                        event => {
                            this.setState({mapName: event.target.value});
                            window.map.title = event.target.value;
                        }
                    } value={this.state.mapName} />
                </div>
                <div>
                    <Button onClick={() => this.choosePlayer()}> 设置玩家位置 </Button>
                </div>
                <div>
                    <Button onClick={() => this.chooseTarget()}> 设置目标位置 </Button>
                </div>
                <div>
                    <Button onClick={() => this.chooseMonster()}> 放置一个怪物 </Button>，
                    怪物的AI名字：
                    <Select.Creatable
                        options={[
                            {value: "naive", label: "naive"},
                            {value: "run", label: "run"},
                            {value: "suicide", label: "suicide"}
                        ]}
                        onChange={value => this.setState({aiName: value.value})}
                        value={this.state.aiName}
                    />
                </div>
                <FormControlLabel control={
                    <Checkbox checked={this.state.mapSharedSetting}
                            onChange={(event) => {
                                this.setState({mapSharedSetting : event.target.checked});
                                window.map.shared = event.target.checked;
                            }}/>}
                     label="分享地图"/>
                {this.state.mapShared ? "已经分享" : ""}
                <Button onClick={() => this.submitMap()}>提交</Button>
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
        if(this.state.map_id === -1){
            create_map(window.map).then(map_id => {
                this.setState({map_id : map_id, mapShared : window.map.shared});
                if(map_id === -2)
                    window.alert('创建地图失败！');
                else
                {
                    window.alert('创建地图成功，编号为' + map_id + '号！');
                    this.map_id = map_id;
                }
            });
        } else{
            modify_map(this.map_id, window.map).then(ok => {
                if(ok)
                    window.alert('修改地图成功！');
                else
                    window.alert('修改地图失败！');
            });
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