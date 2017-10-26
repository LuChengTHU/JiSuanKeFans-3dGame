import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import registerServiceWorker from './registerServiceWorker';
import App from './components/App.js';
import DashBoard from './components/pages/DashBoard'

ReactDOM.render(
    <App>
       <DashBoard />
    </App>, 
    document.getElementById('root'));
registerServiceWorker();
