import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import registerServiceWorker from './registerServiceWorker';
import App from './components/App'

import {BrowserRouter} from 'react-router-dom'


const routes = <BrowserRouter>
        <App/>
        </BrowserRouter>


ReactDOM.render(routes, document.getElementById('root'));

registerServiceWorker();
