import React, {Component} from 'react';
import GameContainer from '../containers/GameContainer';
import BlocklyContainer from '../containers/BlocklyContainer';

export default class App extends Component {
    render() 
    {
        return (
            <div className="App">
                <GameContainer />
                <BlocklyContainer onError={()=> {console.error("scripts load failed.");}}/>
            </div>
        );
    }
}