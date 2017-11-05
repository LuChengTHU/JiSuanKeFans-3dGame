import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';

import registerServiceWorker from './registerServiceWorker';
import App from './components/App'
import DashBoard from './components/pages/DashBoard'
import MapEditor from './components/pages/MapEditor'

import {Route} from 'react-router'
import {BrowserRouter} from 'react-router-dom'


const routes = <BrowserRouter>
        <App/>
        </BrowserRouter>


ReactDOM.render(routes, document.getElementById('root'));

registerServiceWorker();
