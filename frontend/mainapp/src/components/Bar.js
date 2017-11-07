import React, { Component, PropTypes, } from 'react';
import React3 from 'react-three-renderer';
import { Euler, Vector3 } from 'three';

export default class Bar extends Component {

    constructor(props, context) {
        super(props, context);
		this.rotation = new Euler(0, Math.PI / 4, 0);
    }

    render() {
        const {
            position, curValue, maxValue
        } = this.props;
		
		return <group
			position={ position }
			rotation={ this.rotation }
		>
			<mesh>
				  <boxGeometry
					width={curValue / maxValue}
					height={0.2}
					depth={0.2}
				  />
				<meshLambertMaterial
					color={0xff0000}
				/>
			</mesh>
		</group>;
    }

}

Bar.propTypes = {
    position: PropTypes.instanceOf( Vector3 ).isRequired,
	curValue: PropTypes.number.isRequired,
	maxValue: PropTypes.number.isRequired,
}
