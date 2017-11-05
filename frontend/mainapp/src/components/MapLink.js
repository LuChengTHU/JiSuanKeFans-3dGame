import createReactClass from 'create-react-class'
import React from 'react'

export default createReactClass({
    render: function(){
        return <p>{this.props.map.title}</p>;
    }
});