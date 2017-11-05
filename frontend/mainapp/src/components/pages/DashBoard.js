
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
            welcomeOpen: false,
            welcomeMsg: null,
            map: null,
        }
        fetch_map(this.props.match.params.map_id)
        .then((response) => {
            if(response.data.res_code === 1) {
                this.setState({ map: response.data.map });
            } else {
                // TODO: Error message
            }
        });
        this.state.map = window.map;
    }
    handleClick = (name, value) => () => {
        console.log('setState',name,value,this)
        this.setState({
            [name]: value
        })
    }
    render()
    {
        const gameContainer = <GameContainer/>;
        const welcomeMsg = (this.state.map === null || !('welcome_msg' in this.state.map))
            ? '无' : this.state.map['welcome_msg'];
        console.log(welcomeMsg)

        //TODO
        // window.Game.gameSetMap(fetch_map(1));

        return (
            <div className={this.classes.root}>
                <MessageDialog title="提示" open={this.state.welcomeOpen} 
                    closeText="关闭" onRequestClose={this.handleClick('welcomeOpen', false)}>
                    {welcomeMsg} 
                </MessageDialog>
                <Grid container spacing={8} justify='center'>
                <Grid item xs={12} sm={12} >
                    <Button onClick={this.handleClick('welcomeOpen', true)}>提示</Button>
                </Grid>
                <Grid item xs={12} sm={6} >
                    <div id={'gameContainer'}>
                        {gameContainer}    
                    </div>
                </Grid>
                <Grid item xs={12} sm={6}>
                    <BlocklyContainer onError={()=> {throw Error('JS load failed.');}}/>
                </Grid>
                </Grid>
            </div>
        );
    }
}

DashBoard.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(DashBoard);