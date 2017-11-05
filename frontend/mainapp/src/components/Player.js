import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Euler, Vector3 } from 'three';

export default class Player extends Component {

    constructor(props, context) {
        super(props, context);
    }

    render() {
        const {
            position, rotation
        } = this.props;
		
		this.group = <group
			position={ position }
			rotation={ rotation }
		>
			<mesh>
				  <boxGeometry
					width={1}
					height={2}
					depth={1}
				  />
				<materialResource
					resourceId="robotTexture"
				/>
			</mesh>
		</group>;

        return this.group;

    }

}

Player.propTypes = {
    position: PropTypes.instanceOf( Vector3 ).isRequired,
    rotation: PropTypes.instanceOf( Euler ).isRequired,
}
