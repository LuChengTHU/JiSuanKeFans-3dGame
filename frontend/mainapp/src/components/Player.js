import React, { Component, PropTypes, } from 'react';
import { Euler, Vector3 } from 'three';

export default class Player extends Component {

    componentDidMount() {
        const {playerMesh,} = this.props;
        playerMesh.name = "player";
        this.groupRef.add(playerMesh);
    }

    render() {
        const {
            position, rotation
        } = this.props;
		
		this.group = <group ref={
                val => {
                    this.groupRef = val;
                }
            }
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
