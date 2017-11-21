
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
import EnhancedInterpreter from '../EnhancedInterpreter';
const styles = theme => ({
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
        }
        fetch_map(this.props.match.params.map_id)
        .then((response) => {
            if(response && response.data && response.data.res_code === 1) {
                this.setState({ map: response.data.map });
            } else {
                // TODO: Error message
            }
        });
    }
    handleClick = (name, value) => () => {
        this.setState({
            [name]: value
        })
    }
    gameSetState = (gameState) =>
    {
        this.setState((prevState, props) => {
            let passedOpen = (prevState.gameState !== gameState && gameState === "passed");
            let failedOpen = (prevState.gameState !== gameState && gameState === "failed");
            return {passedOpen: passedOpen, gameState: gameState, failedOpen: failedOpen};
        });
    }
    initMap = () => 
    {
        Logic.gameSetMap(window.map);
        this.setState({gameState: "ready"});
        this.enhancedInterpreter = new EnhancedInterpreter(window.Game, this.gameSetState);
    }
    run = () => {
        window.Game.gameInit();
        this.setState({gameState: "stepping"});
        this.enhancedInterpreter.loadProgram(this.blocklyContainer.getCode())
        this.enhancedInterpreter.step();
    }
    render()
    {
        const gameContainer = <GameContainer gameSetState={this.gameSetState} gameState={this.state.gameState}/>;
        let welcomeMsg, gameoverMsg = 'GAME OVER', passedMsg = '通过';
        if (this.state.map === null) welcomeMsg = '加载中...';
        else if (!('welcome_msg' in this.state.map)) welcomeMsg = '无';
        else welcomeMsg = this.state.map['welcome_msg'];
        if (this.state.map) {
            gameoverMsg = this.state.map['gameover_msg'];
            passedMsg = this.state.map['passed_msg'];
        }
        let blocklyReadOnly = (this.state.gameState === 'stepping');

        //TODO
        // window.Game.gameSetMap(fetch_map(1));

        return (
            <div className={this.classes.root}>
                <MessageDialog title="提示" open={this.state.welcomeOpen} 
                    closeText="关闭" onRequestClose={this.handleClick('welcomeOpen', false)}>
                    {welcomeMsg} 
                </MessageDialog>
                <MessageDialog title="提示" open={this.state.passedOpen}
                    closeText="关闭" onRequestClose={this.handleClick('passedOpen', false)}>
                    {passedMsg}
                </MessageDialog>
                <MessageDialog title="游戏失败" open={this.state.failedOpen}
                    confirmText="重试" onRequestConfirm={() => {this.setState({failedOpen: false}); this.initMap();}}
                    closeText="关闭" onRequestClose={this.handleClick('failedOpen', false)}>
                    {gameoverMsg}
                </MessageDialog>
                <Grid container spacing={8} justify='center'>
                <Grid item xs={12} sm={12} >
                    <Button onClick={this.handleClick('welcomeOpen', true)}>提示</Button>
                    <Button onClick={this.initMap}>Init</Button>
                    <Button onClick={this.run}>Play</Button>
                </Grid>
                <Grid item xs={12} sm={6} >
                    <div id={'gameContainer'}>
                        {gameContainer}    
                    </div>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <BlocklyContainer onError={()=> {throw Error('JS load failed.');}}
                        refCallback={(e) => { this.blocklyContainer = e; }}
                        readOnly={blocklyReadOnly} />
                </Grid>
                </Grid>
            </div>
        );
    }
    componentDidMount = () => {
    }
}

DashBoard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DashBoard);