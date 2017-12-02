import React from 'react';
import Typography from 'material-ui/Typography'
import {
    Route,
    Redirect
  } from 'react-router-dom'
export function isLoggedIn() {
    return localStorage.getItem('token') !== null;
}
export const PrivateRoute = ({ component: Component, ...rest }) => (
<Route {...rest} render={props => (
    isLoggedIn() ? (
    <Component {...props}/>
    ) : (
    <Redirect to={{
        pathname: '/login',
        state: { from: props.location }
    }}/>
    )
)}/>);
export class PleaseLogin extends React.Component {
  render() {
    return <Typography type="headline" component="h2" align="center"> 请先登录 </Typography>;
  }
}