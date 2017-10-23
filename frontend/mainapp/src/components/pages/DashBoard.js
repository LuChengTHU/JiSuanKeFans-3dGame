
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
    }
    render()
    {
        return (
            <div className={this.classes.root}>
                <Grid container spacing={24} justify='center'>
                <Grid item xs={12} sm={6} >
                <GameContainer />
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