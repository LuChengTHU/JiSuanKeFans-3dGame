
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import { withStyles } from 'material-ui/styles';
import Paper from 'material-ui/Paper';
import Grid from 'material-ui/Grid';
import withRoot from '../withRoot';
import App from '../App';
import Nav from '../Nav';
import axios from 'axios';
import GameContainer from '../../containers/GameContainer';
import BlocklyContainer from '../../containers/BlocklyContainer';
import {fetch_map} from '../../interfaces/Map';
import MessageDialog from '../MessageDialog';
import Button from 'material-ui/Button';
import Logic from '../../logic/logic';
import {getToolboxXml, getDefaultBlocks} from '../../utils/BlocklyAttribute';
import {create_solution, fetch_solution_list} from '../../interfaces/Solution'
import Typography from 'material-ui/Typography'
import TextField from 'material-ui/TextField'
import {CopyToClipboard} from 'react-copy-to-clipboard'

import EnhancedInterpreter from '../EnhancedInterpreter';
const styles = (/*theme*/) => ({
  root: {
    flexGrow: 1,
  },
});

class DashBoard extends Component {
    constructor(props)
    {
        super(props);
        this.classes = props.classes;
        this.state = {
            welcomeOpen: true,
            welcomeMsg: null,
            map: null,
            gameState: "ready", // one of 'ready', 'stepping', 'running', 'failed', 'passed'
            passedOpen: false,
            failedOpen: false,
            sharedOpen: false,
            solutionId: -1
        }
        this.mapInitialised = false;
      
    }
    handleClick = (name, value) => () => {
        this.setState({
            [name]: value
        })
    }
    gameSetState = (gameState) =>
    {
        if(gameState === 'passed'){
            let starNum = 3;
            try {
                const blockNumber = window.Game.map.n_blockly;
                const userNumber = this.blocklyContainer.getNBlocks();
                if(userNumber <= blockNumber) {
                    starNum = 3;
                } else if(userNumber <= 2 * blockNumber) {
                    starNum = 2;
                } else {
                    starNum = 1;
                }
                if(blockNumber === 0) {
                    starNum = 3;
                }
            } catch(e) {
                starNum = 3;
            }
            this.stars = starNum;
        }

        this.setState((prevState/*, props*/) => {
            const passedOpen = (prevState.gameState !== gameState && gameState === "passed");
            const failedOpen = (prevState.gameState !== gameState && gameState === "failed");
            return {passedOpen: passedOpen, gameState: gameState, failedOpen: failedOpen};
        });
    }
    initMap = () => 
    {
		window.blocklyCallback = () => {
            // Remove any callback before start playing
        };
		window.blocklyShouldRun = false;
		window.animationShouldStop = true;
        Logic.gameSetMap(window.map);
        this.setState({gameState: "ready"});
        this.blocklyContainer.highlightBlock('');
        this.enhancedInterpreter = new EnhancedInterpreter(window.Game, this.blocklyContainer, this.gameSetState);
    }
    run = () => {
        window.Game.gameInit();
        this.setState({gameState: "stepping"});
        this.enhancedInterpreter.loadProgram(this.blocklyContainer.getCode());
		window.blocklyCallback = this.enhancedInterpreter.step;
		window.blocklyShouldRun = true;
    }
    render()
    {
        const toolboxXml = getToolboxXml(this.state.map);
        const defaultBlocks = getDefaultBlocks(this.state.map);
        const gameContainer = <GameContainer gameSetState={this.gameSetState} 
            gameState={this.state.gameState}
            reportHeight={(h)=>{this.blocklyContainer.resize(h)}}/>;
        let welcomeMsg, gameoverMsg = 'GAME OVER', passedMsg = '通过';
        if (this.state.map === null)
        {
            welcomeMsg = '加载中...';
        }
        else if (!('welcome_msg' in this.state.map))
        {
            welcomeMsg = '无';
        }
        else
        {
            welcomeMsg = this.state.map['welcome_msg'];
        }
        const solutionUrl = `${typeof(process.env.REACT_APP_AC_BASE) === 'undefined' ? 
                            'http://localhost:3000' :
                             process.env.REACT_APP_AC_BASE}/solution/${this.state.solutionId}/`;
        if (this.state.map) {
            gameoverMsg = this.state.map['gameover_msg'];
            passedMsg = this.state.map['passed_msg'];
        }
        const blocklyReadOnly = (this.state.gameState === 'stepping');

        const starNum = this.stars;
        const starImg = [];
        for(let i = 0; i < starNum; i++) {
            starImg.push(<img src={`${process.env.PUBLIC_URL}/assets/star_true.jpg`}/>)
        }
        for(let i = starNum; i < 3; i++) {
            starImg.push(<img src={`${process.env.PUBLIC_URL}/assets/star_false.png`}/>)
        }
        // TODO window.Game.gameSetMap(fetch_map(1));

        return <div className={this.classes.root}>
            <MessageDialog title="提示" open={this.state.welcomeOpen} 
                closeText="关闭" onRequestClose={this.handleClick('welcomeOpen', false)}>
                {welcomeMsg} 
            </MessageDialog>
           <MessageDialog title="提示" open={this.state.sharedOpen}
                closeText="好的" onRequestClose={this.handleClick('sharedOpen', false)}>
                <Typography type="title">解法分享成功！</Typography>
                <Typography type="body2">请将下面的链接分享给好友：</Typography>
                <TextField disabled autoFocus fullWidth
                defaultValue={solutionUrl}/>
                <CopyToClipboard text={solutionUrl}>
                    <Button>复制链接</Button>
                </CopyToClipboard>
            </MessageDialog>
            <MessageDialog title="提示" open={this.state.passedOpen}
                closeText="关闭" onRequestClose={()=>{
                    // accepted. Store the code.
                    const code = this.blocklyContainer.getXmlText();
                    const map_id = this.props.match.params.map_id;

                    create_solution(map_id, code, false, this.stars).then((id)=>{
                        this.props.onUpdate();
                    });
                    this.handleClick('passedOpen', false)();
                }}>
                <div><Button onClick={()=>{
                    const code = this.blocklyContainer.getXmlText();
                    const map_id = this.props.match.params.map_id;
                    const shared = true;
                    create_solution(map_id, code, shared, this.stars).then(
                        (id)=>{
                            this.setState({
                                sharedOpen: true,
                                solutionId: id
                            });
                            this.props.onUpdate();
                        });
                    this.setState({passedOpen: false});
                }}>分享解法</Button></div>
                <p>{passedMsg}</p>
                {starImg}
            </MessageDialog>
            <MessageDialog title="游戏失败" open={this.state.failedOpen}
                confirmText="重试" onRequestConfirm={() => {
                    this.setState({failedOpen: false});
                    this.initMap();
                }}
                closeText="关闭" onRequestClose={this.handleClick('failedOpen', false)}>
                {gameoverMsg}
            </MessageDialog>
            <Grid container spacing={0} justify='center'>
            <Grid item xs={12} sm={12} >
                <Button onClick={this.handleClick('welcomeOpen', true)}>提示</Button>
                <Button onClick={this.initMap}>重置</Button>
                <Button onClick={this.run}>运行</Button>
            </Grid>
            <Grid item xs={12} sm={6} >
                <div id={'gameContainer'}>
                    {gameContainer}    
                </div>
            </Grid>
            <Grid item xs={12} sm={6}>
                <BlocklyContainer onError={()=> {throw Error('JS load failed.');}}
                    refCallback={(e) => { this.blocklyContainer = e; 
                    }}
                    onLoaded={()=>{
                            if(!this.mapInitialised){
                                this.mapInitialised = true;
                             
                                fetch_map(this.props.match.params.map_id, true)
                                    .then((response) => {
                                    if(response && response.data && response.data.res_code === 1) {
                                        this.setState({ map: response.data.map });
                                        this.initMap();
                                        } else {
                                            alert('没有权限！');
                                            this.props.history.push('/');
                                        }
                                });

                                fetch_solution_list(0, this.props.match.params.map_id, 'true',
                                    'true', 1, 1).then((list) => {
                                        if(typeof(list) !== 'undefined' && list.length > 0){
                                            const solution = list[0];
                                            this.blocklyContainer.loadXmlText(solution.code);
                                        }
                                });
                                
                            }
                            
                    }}
                    readOnly={blocklyReadOnly} 
                    defaultBlocks={defaultBlocks} toolboxXml={toolboxXml}
                    />
            </Grid>
            </Grid>
        </div>;
    }
    componentDidMount = () => {
        /* currently do nothing */
    }
}

DashBoard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DashBoard);