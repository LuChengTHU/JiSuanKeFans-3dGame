import React, { Component, PropTypes, } from 'react';
import { Euler, Vector3 } from 'three';

export default class Monster extends Component {

    componentDidMount() {
        const {monsterMesh,} = this.props;
        monsterMesh.name = "monster";
        this.groupRef.add(monsterMesh);
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

Monster.propTypes = {
    position: PropTypes.instanceOf( Vector3 ).isRequired,
    rotation: PropTypes.instanceOf( Euler ).isRequired,
}
