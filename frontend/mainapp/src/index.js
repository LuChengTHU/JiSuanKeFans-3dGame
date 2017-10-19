import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './registerServiceWorker';

import GameContainer from './containers/GameContainer';

ReactDOM.render(
    <GameContainer />,
    document.getElementById( 'game' )
);

//ReactDOM.render(<App />, document.getElementById('root'));
//registerServiceWorker();
