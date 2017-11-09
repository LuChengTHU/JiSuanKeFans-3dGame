import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Euler, Vector3 } from 'three';

export default class Player extends Component {

    constructor(props, context) {
        super(props, context);
    }

    componentDidMount() {
        const {playerMesh,} = this.props;
        playerMesh.name = "player";
        this.groupRef.add(playerMesh);
    }

    render() {
        const {
            position, rotation
        } = this.props;
		
		this.group = <group ref={val => { this.groupRef = val; }}
			position={ position }
			rotation={ rotation }
		>

		</group>;

        return this.group;

    }

}

Player.propTypes = {
    position: PropTypes.instanceOf( Vector3 ).isRequired,
    rotation: PropTypes.instanceOf( Euler ).isRequired,
}
